#!/usr/bin/env bash
set -euo pipefail
BOARD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/board-env.sh
source "${BOARD_SCRIPT_DIR}/lib/board-env.sh"
board_init_env "${BOARD_SCRIPT_DIR}"

board_kill_port
remaining="$(board_count_listeners)"
echo "listeners_on_${BOARD_PORT}=${remaining}"
