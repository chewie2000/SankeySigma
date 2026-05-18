# CLAUDE.md — SankeySigma

Sigma Computing custom plugin — ECharts Sankey chart.

## Sigma Plugin Rules — non-negotiable

### Export safety
- `useLoadingState(true)` is wired — `setLoadingState(false)` is gated on rowCount > 0 AND nodes.length > 0
- `print-color-adjust: exact !important` injected via `<style>` in render
- Must be hosted on a public URL (Vercel). Never rely on localhost for export testing.
- Plugin must be on page 1 of the workbook (SIG-91743 — page 2+ fails in PDF exports)

### Banned patterns
- No `localStorage` / `sessionStorage` — use `plugin.config.setKey` if persistence needed
- No external `fetch` or network calls — all data via Sigma sources
- No `plugin.config.setKey` in event handlers — always move to `useEffect` after state commits

### Dev workflow
- `npm run dev:mock` — local dev with sample data, no Sigma required
- `npm run build` + Vercel for export testing
- Mock data lives in `src/mock/data.js` — edit to test different Sankey flows
- Version shown in editor panel via `__APP_VERSION__` / `__GIT_HASH__` Vite defines

## Project structure

```
SankeySigma/
├── src/
│   ├── App.jsx              # Plugin component (ECharts Sankey)
│   ├── main.jsx             # Sigma entry point
│   ├── main.mock.jsx        # Mock dev entry point
│   └── mock/
│       ├── data.js          # Sample data for local dev
│       └── plugin.jsx       # Sigma SDK stub
├── index.html               # Sigma entry HTML
├── mock.html                # Mock dev entry HTML
├── vite.config.js           # Production Vite config
└── vite.config.mock.js      # Mock dev Vite config
```

## Data model

One Sigma element (Link Data) with three columns:
- **Source node column** — name of the flow source (text)
- **Target node column** — name of the flow target (text)
- **Value column** — flow magnitude (number)

Nodes are auto-derived from unique source/target values — no separate node table required.

## Full skill guide
See `/Users/mark.oldfield/Documents/PlugIns/SKILL-sigma-plugin.md` for all patterns, known bugs, and setup reference.
