# shellcheck shell=bash
# Shared helpers for macOS/Linux board scripts (BSD bash compatible).
# Source from scripts/*.sh after setting BOARD_SCRIPT_DIR to that script's directory.

board_init_env() {
  local script_dir="$1"
  REPO_ROOT="$(cd "${script_dir}/.." && pwd)"
  BOARD_URL="http://127.0.0.1:43123/"
  BOARD_PORT=43123
  board_setup_path
}

board_setup_path() {
  # npm/nvm clash when Node is spawned from npm scripts (Cloud Agent sets npm_config_prefix).
  unset npm_config_prefix 2>/dev/null || true
  export PATH="/usr/local/bin:/opt/homebrew/bin:${PATH}"
  if [ -z "${NVM_DIR:-}" ]; then
    NVM_DIR="${HOME}/.nvm"
  fi
  export NVM_DIR
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "${NVM_DIR}/nvm.sh"
  fi
}

board_test_up() {
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "${BOARD_URL}" 2>/dev/null || echo "000")"
  [ "${code}" = "200" ]
}

board_wait_up() {
  local max="${1:-40}"
  local i=0
  while [ "${i}" -lt "${max}" ]; do
    if board_test_up; then
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

board_kill_port() {
  local pids
  pids="$(lsof -ti "tcp:${BOARD_PORT}" 2>/dev/null || true)"
  if [ -n "${pids}" ]; then
    # shellcheck disable=SC2086
    kill -9 ${pids} 2>/dev/null || true
    sleep 1
  fi
}

board_count_listeners() {
  local pids count
  pids="$(lsof -ti "tcp:${BOARD_PORT}" 2>/dev/null || true)"
  if [ -z "${pids}" ]; then
    echo "0"
    return 0
  fi
  count="$(printf '%s\n' "${pids}" | wc -l | tr -d ' ')"
  echo "${count}"
}

board_start_preview() {
  (
    cd "${REPO_ROOT}" || exit 1
    nohup npx --yes vite preview --host 127.0.0.1 --port "${BOARD_PORT}" --strictPort \
      >>"${REPO_ROOT}/.board-preview.log" 2>&1 &
  )
}

board_open_browser() {
  if [ "${SKIP_BROWSER:-}" = "1" ]; then
    return 0
  fi
  case "$(uname -s)" in
    Darwin) open "${BOARD_URL}" ;;
    Linux)
      if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "${BOARD_URL}" >/dev/null 2>&1 || true
      fi
      ;;
  esac
}

board_http_board_json() {
  curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://127.0.0.1:43123/latest-board.json" 2>/dev/null || echo "000"
}
