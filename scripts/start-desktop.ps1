$ErrorActionPreference = "Continue"
$repo = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:43123/"

Set-Location $repo

function Test-BoardUp {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
    return ($r.StatusCode -eq 200)
  } catch { return $false }
}

if (-not (Test-BoardUp)) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "cmd.exe"
  $psi.Arguments = "/c npx --yes vite preview --host 127.0.0.1 --port 43123 --strictPort"
  $psi.WorkingDirectory = $repo
  $psi.WindowStyle = "Hidden"
  $psi.CreateNoWindow = $true
  $psi.UseShellExecute = $true
  [Diagnostics.Process]::Start($psi) | Out-Null
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 1
    if (Test-BoardUp) { break }
  }
}

Start-Process $url
