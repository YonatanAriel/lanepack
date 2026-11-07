#!/usr/bin/env bash
set -euo pipefail
BOARD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/board-env.sh
source "${BOARD_SCRIPT_DIR}/lib/board-env.sh"
board_init_env "${BOARD_SCRIPT_DIR}"

cd "${REPO_ROOT}"
if command -v git >/dev/null 2>&1; then
  git stash list 2>&1 || true
fi

board_start_preview

ok=false
if board_wait_up 30; then
  ok=true
fi
echo "server_ok=${ok}"
