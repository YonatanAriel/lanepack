#!/usr/bin/env bash
# One-shot setup (macOS/Linux). Requires Node.js 22+ on PATH — does not install Node.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node not found. Install Node.js 22+ and run: npm run setup" >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm not found. Install Node.js 22+ and run: npm run setup" >&2
  exit 1
fi
major="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
if [ "${major}" -lt 22 ]; then
  echo "Error: Node.js 22+ required (found $(node -v))." >&2
  exit 1
fi

exec "${SCRIPT_DIR}/mac-setup.sh"
