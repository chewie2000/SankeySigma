// Sample Sankey data — revenue flow breakdown.
// Edit this file to test different flows without a live Sigma workbook.
const LINKS = [
  ['Product Sales',     'Revenue',          700],
  ['Service Revenue',   'Revenue',          500],
  ['Revenue',           'Cost of Goods',    400],
  ['Revenue',           'Gross Profit',     800],
  ['Gross Profit',      'R&D',              200],
  ['Gross Profit',      'Sales & Marketing',150],
  ['Gross Profit',      'G&A',              100],
  ['Gross Profit',      'Operating Income', 350],
  ['Operating Income',  'Tax',               70],
  ['Operating Income',  'Net Income',       280],
]

export const MOCK_STATE = {
  config: {
    linkData:   'link-source',
    sourceCol:  'col-source',
    targetCol:  'col-target',
    valueCol:   'col-value',
    orient:     'horizontal',
    nodeAlign:  'left',
  },
  elementData: {
    'link-source': {
      'col-source': LINKS.map(r => r[0]),
      'col-target': LINKS.map(r => r[1]),
      'col-value':  LINKS.map(r => r[2]),
    },
  },
  elementColumns: {
    'link-source': {
      'col-source': { name: 'Source', type: 'text' },
      'col-target': { name: 'Target', type: 'text' },
      'col-value':  { name: 'Value',  type: 'number' },
    },
  },
}
