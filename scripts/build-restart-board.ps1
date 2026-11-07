$ErrorActionPreference = 'Continue'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

npx vite build 2>&1 | Out-Host
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
try {
  $j = Invoke-WebRequest -Uri 'http://127.0.0.1:43123/latest-board.json' -UseBasicParsing -TimeoutSec 2
  Write-Host ('board_json=' + $j.StatusCode)
} catch { Write-Host ('board_json_err=' + $_.Exception.Message) }
