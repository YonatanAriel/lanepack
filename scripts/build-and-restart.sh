#!/usr/bin/env bash
set -euo pipefail
BOARD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/board-env.sh
source "${BOARD_SCRIPT_DIR}/lib/board-env.sh"
board_init_env "${BOARD_SCRIPT_DIR}"

cd "${REPO_ROOT}"
npx vite build
board_kill_port
board_start_preview

ok=false
if board_wait_up 40; then
  ok=true
fi
echo "server_ok=${ok}"

code="$(board_http_board_json)"
if [ "${code}" = "200" ]; then
  echo "board_json=${code}"
else
  echo "board_json_err=http_${code}"
fi
