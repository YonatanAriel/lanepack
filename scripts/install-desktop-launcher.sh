#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST="${HOME}/Desktop/Lanepack.command"

cat >"${DEST}" <<EOF
#!/bin/bash
set -euo pipefail
cd "${REPO_ROOT}" || exit 1
exec "${REPO_ROOT}/scripts/start.sh"
EOF
chmod +x "${DEST}"
echo "installed ${DEST}"
