# AGENTS.md

## What this is

Figma plugin for packing shapes onto a sheet. Creates a frame with user-defined dimensions (mm/px) and places as many shape instances as possible without overlap.

## Architecture

Two isolated sandboxes:
- **Backend** (`src/code/`) — Figma API, entry: `src/code/main.js`
- **Frontend** (`src/ui/`) — Svelte 5 iframe, entry: `src/ui/main.js`

RPC bridge at `src/ui/utils/figma.js` via `figma.send('actionName', params)`.

## Key files

| File | Purpose |
|------|---------|
| `src/code/actions/createSheet.js` | Creates frame with given dimensions |
| `src/code/actions/packShapes.js` | Grid-packs shapes on sheet, optional component creation |
| `src/ui/pages/CompositorPage.svelte` | Single UI page with all controls |
| `src/ui/settings.svelte.js` | Persistent settings (PPI, units, dimensions, shape config) |

## Build & dev

```bash
pnpm run dev        # barrel + code + ui watch concurrently
pnpm run build      # clear → barrel → build:code → build:ui
```

Output: `dist/manifest.json` — import in Figma via Plugins → Development.

## Conventions

### Barrel auto-generation

`scripts/barrel.js` auto-generates `index.js` for:
- `src/code/actions`, `src/code/utils`, `src/ui/utils`, `src/ui/pages`

**Rule**: new files must use `export default` with filename = export name.

### Backend actions

Every file in `src/code/actions/`:
- Accepts params object
- Returns `{ ok: true }` or `{ ok: false, error: 'message' }`
- Auto-registered via barrel (filename = action name)

### Unit conversion

PPI-based: `px = mm × (ppi / 25.4)`. Default PPI: 300.

### Packing algorithm

Grid-based: `cols = floor((sheetW + gap) / (shapeW + gap))`, centered on sheet. Shapes become children of sheet frame.

## Gotchas

- `vite.config.js` (root) references non-existent `vite-plugin-auto-barrel.js`. Use `vite.config.code.js` + `vite.config.ui.js`.
- `src/manifest.json` has `"id": "YOUR_PLUGIN_ID"` — replace before publishing.
- `viteSingleFile` inlines everything into `ui.html` — Figma requires this.
- `initAutoResize` handles iframe height — use in dynamic pages.
