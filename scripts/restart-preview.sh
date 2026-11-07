#!/usr/bin/env bash
set -euo pipefail
BOARD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/board-env.sh
source "${BOARD_SCRIPT_DIR}/lib/board-env.sh"
board_init_env "${BOARD_SCRIPT_DIR}"

board_kill_port
board_start_preview

ok=false
if board_wait_up 40; then
  ok=true
fi
echo "server_ok=${ok}"
