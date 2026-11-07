# One-shot setup (Windows). Requires Node.js 22+ on PATH — does not install Node.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Require-Node {
  $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $nodeCmd) {
    Write-Error "node not found. Install Node.js 22+ and run: npm run setup"
  }
  $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
  if (-not $npmCmd) {
    Write-Error "npm not found. Install Node.js 22+ and run: npm run setup"
  }
  $ver = & node -p "parseInt(process.versions.node.split('.')[0], 10)"
  if ([int]$ver -lt 22) {
    $v = & node -v
    Write-Error "Node.js 22+ required (found $v)."
  }
}

Require-Node

if (-not (Test-Path -LiteralPath (Join-Path $repo 'node_modules'))) {
  Write-Host 'running npm install...'
  npm install
} else {
  Write-Host 'node_modules present — skipping npm install'
}

$vbs = Join-Path $repo 'scripts\start-desktop-hidden.vbs'
$desktop = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desktop 'Lanepack.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnk)
$shortcut.TargetPath = $vbs
$shortcut.WorkingDirectory = $repo
$shortcut.WindowStyle = 7
$shortcut.Description = 'Start Lanepack task board'
$shortcut.Save()
Write-Host "installed $lnk"

npm run build
if ($LASTEXITCODE -ne 0) { throw 'build failed' }

$conn = Get-NetTCPConnection -LocalPort 43123 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  $conn | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} }
  Start-Sleep -Seconds 1
}

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'cmd.exe'
$psi.Arguments = '/c npx --yes vite preview --host 127.0.0.1 --port 43123 --strictPort'
$psi.WorkingDirectory = $repo
$psi.WindowStyle = 'Hidden'
$psi.CreateNoWindow = $true
$psi.UseShellExecute = $true
[Diagnostics.Process]::Start($psi) | Out-Null

$ok = $false
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:43123/' -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch {}
}
Write-Host ('server_ok=' + $ok)
Write-Host 'Double-click the Lanepack shortcut on your Desktop to open the board later.'
