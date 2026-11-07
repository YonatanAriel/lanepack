$ErrorActionPreference = 'Continue'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'cmd.exe'
$psi.Arguments = '/c npx --yes vite preview --host 127.0.0.1 --port 43123 --strictPort'
$psi.WorkingDirectory = $repo
$psi.WindowStyle = 'Hidden'
$psi.CreateNoWindow = $true
$psi.UseShellExecute = $true
[Diagnostics.Process]::Start($psi) | Out-Null
$ok = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:43123/' -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch {}
}
Write-Host ('server_ok=' + $ok)
