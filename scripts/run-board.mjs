#!/usr/bin/env node
/**
 * Cross-platform entry for npm run board:* — runs .ps1 on Windows, .sh elsewhere.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.dirname(scriptsDir)

const actions = {
  setup: { win: 'setup.ps1', unix: 'setup.sh' },
  start: { win: 'start-desktop.ps1', unix: 'start.sh' },
  'build-restart': { win: 'build-restart-board.ps1', unix: 'build-and-restart.sh' },
  'restart-status': { win: 'restart-and-status.ps1', unix: 'restart-and-status.sh' },
  'restart-preview': { win: 'restart-preview.ps1', unix: 'restart-preview.sh' },
  stop: { win: null, unix: 'stop.sh' },
}

const action = process.argv[2]
const entry = actions[action]
if (!entry) {
  console.error('usage: node run-board.mjs <setup|start|build-restart|restart-status|restart-preview|stop>')
  process.exit(1)
}

if (process.platform === 'win32') {
  if (!entry.win) {
    console.error(`board:${action} is not available on Windows via this runner`)
    process.exit(1)
  }
  const ps1 = path.join(scriptsDir, entry.win)
  const r = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1],
    { stdio: 'inherit', cwd: repoRoot, shell: false },
  )
  process.exit(r.status ?? 1)
}

const sh = path.join(scriptsDir, entry.unix)
const r = spawnSync('bash', [sh], { stdio: 'inherit', cwd: repoRoot, shell: false })
process.exit(r.status ?? 1)
