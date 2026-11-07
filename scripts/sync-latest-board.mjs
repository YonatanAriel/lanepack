#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const src = path.join(repoRoot, 'latest-board.json')

if (!fs.existsSync(src)) {
  console.error(
    'missing latest-board.json at repo root (copy from latest-board.example.json for a starter pack)',
  )
  process.exit(1)
}

const targets = [
  path.join(repoRoot, 'public', 'latest-board.json'),
  path.join(repoRoot, 'dist', 'latest-board.json'),
]

for (const dest of targets) {
  const dir = path.dirname(dest)
  if (dest.includes(`${path.sep}dist${path.sep}`) && !fs.existsSync(dir)) {
    console.log('skip (no dist yet):', path.relative(repoRoot, dest))
    continue
  }
  fs.mkdirSync(dir, { recursive: true })
  fs.copyFileSync(src, dest)
  console.log('copied ->', path.relative(repoRoot, dest))
}
