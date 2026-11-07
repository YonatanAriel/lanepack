#!/usr/bin/env bash
set -euo pipefail
BOARD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/board-env.sh
source "${BOARD_SCRIPT_DIR}/lib/board-env.sh"
board_init_env "${BOARD_SCRIPT_DIR}"

if ! board_test_up; then
  board_start_preview
  board_wait_up 40 || true
fi

board_open_browser
