#!/usr/bin/env bash
# One-shot Mac setup (safe to re-run). Resolves repo from this script's location.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=lib/board-env.sh
source "${SCRIPT_DIR}/lib/board-env.sh"
board_init_env "${SCRIPT_DIR}"

cd "${REPO_ROOT}"

for f in "${SCRIPT_DIR}"/*.sh "${SCRIPT_DIR}/lib/"*.sh; do
  [ -f "${f}" ] && chmod +x "${f}"
done

if [ ! -d node_modules ]; then
  echo "running npm install..."
  npm install
else
  echo "node_modules present — skipping npm install"
fi

"${SCRIPT_DIR}/install-desktop-launcher.sh"
npm run build
board_kill_port
SKIP_BROWSER=1 board_start_preview

ok=false
if board_wait_up 40; then
  ok=true
fi
echo "server_ok=${ok}"

if [ "$(uname -s)" = "Darwin" ]; then
  echo "Double-click ~/Desktop/Lanepack.command to open the board later."
  echo "Optional login item: see docs/MAC.md and scripts/com.lanepack.board.plist.template"
fi
