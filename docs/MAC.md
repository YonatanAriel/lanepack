# Lanepack on macOS

Windows and macOS setup steps live in the root [README.md](../README.md). This file adds macOS-specific detail.

The same Vite preview board as on Windows (`http://127.0.0.1:43123`), with shell scripts and a Desktop launcher instead of PowerShell and `.vbs`.

Windows scripts under `scripts/*.ps1` are unchanged in role; paths are repo-relative via `$PSScriptRoot`. Use the matching names on Mac:

| Mac / Linux | Windows | Purpose |
|-------------|---------|---------|
| `scripts/start.sh` | `start-desktop.ps1` | Start preview if down, open browser |
| `scripts/build-and-restart.sh` | `build-restart-board.ps1` | Build, restart preview, print `server_ok` |
| `scripts/restart-and-status.sh` | `restart-and-status.ps1` | Start preview, print `server_ok` |
| `scripts/restart-preview.sh` | `restart-preview.ps1` | Kill port, restart preview |
| `scripts/stop.sh` | — | Free port 43123 |

Cross-platform npm shortcuts (Node picks `.ps1` or `.sh`):

```bash
npm run board:start
npm run board:build-restart
npm run board:restart-status
npm run board:restart-preview
npm run board:stop          # macOS/Linux only
npm run board:sync-latest   # copy root latest-board.json → public/ and dist/
```

## First-time setup on your Mac

Prerequisites: **Node 22** (e.g. via nvm at `~/.nvm/versions/node/v22.x`), repo cloned to a path such as `~/repos/lanepack` (your clone).

Then run one-shot setup from the repo root (idempotent on macOS, Windows, and Linux):

```bash
cd ~/repos/lanepack   # your clone
npm run setup
```

(`npm run setup` on macOS runs the same flow as `./scripts/mac-setup.sh`.)

That installs `~/Desktop/Lanepack.command`, runs `npm install` if needed, builds, starts the preview (without opening a browser during setup), and prints `server_ok=true` or `server_ok=false`.

Double-click **Lanepack.command** on the Desktop anytime (same idea as the hidden Windows shortcut).

## Manual workflow

```bash
npm ci
npm run build
npm run board:start
```

Update board JSON at the **repo root** (gitignored; see README for agent/automation flow), then sync copies:

```bash
cp latest-board.example.json latest-board.json   # starter, if you have no pack yet
npm run board:sync-latest
npm run board:build-restart   # if you need a fresh dist build
```

Or only restart preview after copying into `dist/`:

```bash
npm run board:restart-preview
```

Stop the server:

```bash
npm run board:stop
```

## Optional: start on login (LaunchAgent)

Template: `scripts/com.lanepack.board.plist.template`.  
Replace `__REPO_ROOT__`, copy to `~/Library/LaunchAgents/`, then `launchctl load` — see comments in the template. Not installed by `mac-setup.sh`.

## Node without an interactive shell

Scripts source `~/.nvm/nvm.sh` when present, then use `PATH` including Homebrew (`/opt/homebrew/bin`, `/usr/local/bin`). Logs: `.board-preview.log` in the repo root.

## Windows

Use a shortcut to `scripts/start-desktop-hidden.vbs`, or:

```powershell
powershell -File scripts\start-desktop.ps1
powershell -File scripts\build-restart-board.ps1
```

The VBS launcher resolves the repo from its own path (no hardcoded `C:\Users\...`). Same npm `board:*` commands work on Windows where a `.ps1` counterpart exists.
