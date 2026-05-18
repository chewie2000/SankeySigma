import { useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts'
import {
  useConfig,
  useEditorPanelConfig,
  useElementData,
  useElementColumns,
  useLoadingState,
} from '@sigmacomputing/plugin'

// ── Editor panel ──────────────────────────────────────────────────────────────
const EDITOR_FIELDS = [
  { name: 'linkData',  type: 'element', label: 'Link Data' },
  { name: 'sourceCol', type: 'column', source: 'linkData', allowMultiple: false, label: 'Source node column' },
  { name: 'targetCol', type: 'column', source: 'linkData', allowMultiple: false, label: 'Target node column' },
  { name: 'valueCol',  type: 'column', source: 'linkData', allowMultiple: false, label: 'Value column' },

  { name: 'grpAppearance', type: 'group', label: 'Appearance' },
  { name: 'orient',    type: 'dropdown', label: 'Orientation',     values: ['horizontal', 'vertical'],      defaultValue: 'horizontal' },
  { name: 'nodeAlign', type: 'dropdown', label: 'Node alignment',  values: ['left', 'right', 'justify'],    defaultValue: 'left' },
  { name: 'nodeWidth', type: 'dropdown', label: 'Node width (px)', values: ['10','15','20','25','30'],       defaultValue: '20' },
  { name: 'nodeGap',   type: 'dropdown', label: 'Node gap (px)',   values: ['4','6','8','10','12','16'],     defaultValue: '8' },

  { name: 'grpVersion', type: 'group', label: `v${__APP_VERSION__} (${__GIT_HASH__})` },
  { name: 'repoUrl',    type: 'text',  label: 'Repository', defaultValue: 'github.com/chewie2000/SankeySigma' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function App() {
  useEditorPanelConfig(EDITOR_FIELDS)
  const config = useConfig()
  const [, setLoadingState] = useLoadingState(true)

  const linkSourceId = config?.linkData
  const sourceColId  = config?.sourceCol
  const targetColId  = config?.targetCol
  const valueColId   = config?.valueCol
  const orient       = config?.orient    || 'horizontal'
  const nodeAlign    = config?.nodeAlign || 'left'
  const nodeWidth    = Number(config?.nodeWidth ?? 20)
  const nodeGap      = Number(config?.nodeGap   ?? 8)

  const linkData = useElementData(linkSourceId)
  const rowCount = linkData?.[sourceColId]?.length ?? 0

  // ── Build nodes + links from Sigma columns ────────────────────────────────
  const { nodes, links } = useMemo(() => {
    if (!rowCount || !sourceColId || !targetColId || !valueColId) {
      return { nodes: [], links: [] }
    }
    const sources = linkData[sourceColId]
    const targets = linkData[targetColId]
    const values  = linkData[valueColId]
    const nodeNames = new Set()
    const builtLinks = []
    for (let i = 0; i < rowCount; i++) {
      const src = String(sources[i] ?? '').trim()
      const tgt = String(targets[i] ?? '').trim()
      const val = parseFloat(String(values[i] ?? '0').replace(/[,$\s]/g, ''))
      if (src && tgt && !isNaN(val) && val > 0) {
        nodeNames.add(src)
        nodeNames.add(tgt)
        builtLinks.push({ source: src, target: tgt, value: val })
      }
    }
    return { nodes: [...nodeNames].map(name => ({ name })), links: builtLinks }
  }, [linkData, sourceColId, targetColId, valueColId, rowCount])

  // ── ECharts option ────────────────────────────────────────────────────────
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: p => p.dataType === 'edge'
        ? `${p.data.source} → ${p.data.target}: <b>${p.data.value.toLocaleString()}</b>`
        : `${p.name}: <b>${(p.value ?? '').toLocaleString()}</b>`,
    },
    series: [{
      type: 'sankey',
      nodeAlign,
      orient,
      nodeWidth,
      nodeGap,
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      data: nodes,
      links,
      lineStyle: { color: 'gradient', curveness: 0.5 },
      label: { fontSize: 11 },
    }],
  }), [nodes, links, nodeAlign, orient, nodeWidth, nodeGap])

  // ── Chart refs ────────────────────────────────────────────────────────────
  const chartRef      = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current || nodes.length === 0) return
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }
    chartInstance.current.setOption(option, true)
  }, [option, nodes.length])

  // Resize via ResizeObserver — cleaner than window resize events inside an iframe
  useEffect(() => {
    if (!chartRef.current) return
    const ro = new ResizeObserver(() => chartInstance.current?.resize())
    ro.observe(chartRef.current)
    return () => {
      ro.disconnect()
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [])

  // ── Loading state — waits for data before signalling screenshotter ────────
  useEffect(() => {
    if (!linkSourceId) { setLoadingState(false); return }
    if (rowCount > 0 && nodes.length > 0) setLoadingState(false)
  }, [linkSourceId, rowCount, nodes.length])

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!linkSourceId) {
    return <div style={S.empty}>Connect a Link Data source in the editor panel.</div>
  }
  if (!sourceColId || !targetColId || !valueColId) {
    return <div style={S.empty}>Select Source, Target, and Value columns in the editor panel.</div>
  }
  if (rowCount === 0) {
    return <div style={S.empty}>No data to display.</div>
  }

  return (
    <div style={S.wrap}>
      {/* Force background colours to render in PDF/print contexts */}
      <style>{`* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`}</style>
      <div ref={chartRef} style={S.chart} />
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  wrap:  { width: '100vw', height: '100vh', background: '#fff', overflow: 'hidden' },
  chart: { width: '100%',  height: '100%' },
  empty: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100vw', height: '100vh',
    color: '#888', fontSize: '13px', fontFamily: 'Inter, sans-serif',
    background: '#fafafa',
  },
}
