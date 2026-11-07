# Lanepack

**Lanepack** is a personal, local task board: kanban lanes, drag-and-drop, source badges (Slack, Jira, Gmail, meetings), and evidence lines. It runs in your browser against a preview server on your machine—not a hosted multi-user product.

You can use it entirely by hand (add, edit, import, export in the UI). The design also supports **keeping the board fresh from the outside**: an assistant, scheduled job, or script reads your real sources, then writes a JSON **pack** that the app picks up automatically.

## How board data flows

1. **Your live pack** lives at the repo root as `latest-board.json`. That file is **gitignored**—it is not part of the public tree you clone.
2. When you want the running app to see changes, copy the pack into places the static server serves:
   ```bash
   npm run board:sync-latest   # root latest-board.json → public/ and dist/
   ```
3. The UI **polls** `/latest-board.json` about every 20 seconds and **merges** tasks by `id`. Incoming packs can refresh titles, links, and evidence; **your local lane, status, and priority stay authoritative** unless you change them in the board.
4. **`localStorage`** still holds your working copy in the browser (`lanepack-board-v1` by default). Export/import in the header works for one-off backups or moving between machines.

See [`latest-board.example.json`](latest-board.example.json) for the JSON shape (`tasks` array plus optional `hideDone`).

## Agent-driven updates (the intended automation path)

The repo does **not** ship connectors for Slack, Jira, or Gmail. Instead it assumes something you control **verifies** what is open (threads, tickets, mail, meeting notes), **decides** what belongs on the board, and **writes or updates** `latest-board.json`. That something can be:

- A coding agent in your editor or cloud environment  
- A cron job or CI step  
- A small Python or Node script  
- Any tool that can output JSON and optionally run `npm run board:sync-latest`

There is **no lock-in** to a single vendor or bot framework.

**Example (not a requirement):** the author often runs this flow with **Grok Bot**—scheduled or on-demand tasks that check Slack/Jira/Gmail/meetings and rewrite the pack. That is one concrete pattern; you can replicate the same idea with Cursor Cloud Agents, your own scripts, or manual edits plus sync.

Typical loop:

1. Agent or script updates `latest-board.json` at the repo root.  
2. `npm run board:sync-latest` (and optionally `npm run board:build-restart` if you serve from `dist/`).  
3. Open or refresh the board; merged tasks appear without wiping manual tweaks.

You do **not** need Grok Bot (or any agent) to install or run Lanepack.

## Prerequisites

- **Git** (to clone) and **Node.js 22+** with npm — install these yourself; Lanepack does **not** download or install Node (on macOS, nvm/Homebrew are common; see [docs/MAC.md](docs/MAC.md) for PATH/nvm notes)
- The board is served at [http://127.0.0.1:43123](http://127.0.0.1:43123) after setup or `board:*` start

## Install (one command)

Fresh clone:

```bash
git clone https://github.com/YonatanAriel/lanepack.git && cd lanepack && npm run setup
```

Already have the repo checked out — from the repo root:

```bash
npm run setup
```

`npm run setup` (via `scripts/run-board.mjs`) runs **`setup.ps1` on Windows** or **`setup.sh` on macOS/Linux**. It:

- Exits with a clear error if `node` / `npm` are missing or Node is below 22 (no auto-install)
- Runs `npm install` if `node_modules` is absent
- Builds the app and starts the Vite preview on port 43123
- **Windows:** creates a Desktop shortcut **Lanepack.lnk** → `scripts/start-desktop-hidden.vbs`
- **macOS:** installs `~/Desktop/Lanepack.command` (same as `scripts/install-desktop-launcher.sh`)

Re-run `npm run setup` anytime to refresh the build, preview, and launcher.

## macOS and Windows setup (reference)

Lanepack is a **first-class** local app on **Windows and macOS**. Both use the same UI and the same preview URL; only the shell launchers differ.

### Development (either OS)

Hot reload while editing the app:

```bash
npm run dev
```

Then open [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Production-style preview (either OS)

Build static assets, then serve with Vite preview (same port):

```bash
npm run build
npm run preview
```

For day-to-day use, prefer the `board:*` npm scripts below—they start or restart preview and open the browser on both platforms where a script exists.

### Windows — first run and desktop launcher

Prefer **`npm run setup`** — it builds, starts preview, and creates the **Lanepack** Desktop shortcut for you.

Manual steps if you prefer:

1. `npm run board:build-restart` (runs `scripts/build-restart-board.ps1`).
2. Open the board: double-click the **Lanepack** shortcut on the Desktop, or  
   `powershell -File scripts\start-desktop.ps1`
3. The `.vbs` launcher resolves the repo from its own location—**no hardcoded `C:\Users\...` paths**.

Equivalent PowerShell entry points (also repo-relative):

```powershell
powershell -File scripts\start-desktop.ps1
powershell -File scripts\build-restart-board.ps1
powershell -File scripts\restart-and-status.ps1
powershell -File scripts\restart-preview.ps1
```

### macOS — first run and desktop launcher

Prefer **`npm run setup`** (wraps `scripts/mac-setup.sh`): npm install if needed, build, preview, and `~/Desktop/Lanepack.command`.

Equivalent: `./scripts/mac-setup.sh`. Extra detail (script table, LaunchAgent, nvm/PATH): [docs/MAC.md](docs/MAC.md).

### npm `board:*` commands (cross-platform)

`scripts/run-board.mjs` picks **`.ps1` on Windows** and **`.sh` on macOS/Linux**:

| npm script | What it does |
|------------|----------------|
| `npm run setup` | First-time / refresh: install, build, preview, desktop launcher |
| `npm run board:start` | Start preview if down; open browser |
| `npm run board:build-restart` | Build, restart preview, report `server_ok` |
| `npm run board:restart-status` | Start/restart preview; report `server_ok` |
| `npm run board:restart-preview` | Kill port 43123, restart preview |
| `npm run board:sync-latest` | Copy root `latest-board.json` → `public/` and `dist/` |
| `npm run board:stop` | **macOS/Linux only** — free port 43123 (`scripts/stop.sh`; no Windows counterpart) |

Use these on **either OS** wherever a matching `.ps1` or `.sh` exists (`board:stop` excepted).

## Features

- **Lanes:** Up next, In progress, Done (collapsible)
- **Cards:** Title, source badge (Slack / Jira / Gmail / meeting), status, priority reorder, links, evidence
- **Actions:** Mark done, edit/delete, drag or arrow reorder, lane moves, source filters
- **Persistence:** `localStorage` auto-save; JSON export/import
- **Live pack:** Merged polling from served `latest-board.json` (see above)

## Configuration

Copy [`.env.example`](.env.example) to `.env` or `.env.local` and set:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_BOARD_TITLE` | `Lanepack` | Browser tab title and board heading |
| `VITE_BOARD_TAGLINE` | *(see example)* | Subtitle under the title |
| `VITE_STORAGE_KEY` | `lanepack-board-v1` | `localStorage` key |
| `VITE_EXPORT_PREFIX` | `lanepack` | Downloaded export filename prefix |

Jira and Slack URLs belong in your local JSON pack, not in source.

## First-time board file

```bash
cp latest-board.example.json latest-board.json   # starter pack; then edit or let an agent overwrite
npm run board:sync-latest
```

Import/export in the UI works without `latest-board.json`; the file is for disk-based sync and automation.

## Seed data

On first load (empty `localStorage`), three placeholder tasks are seeded (generic example URLs and titles).

Clear storage to reset:

```javascript
localStorage.removeItem('lanepack-board-v1')
```

## Stack

Vite · React · TypeScript · Tailwind CSS · @dnd-kit · lucide-react
