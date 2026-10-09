param(
  [string]$Executable = "",
  [int]$Port = 4096
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runtime = Join-Path $repo "runtime"
$paths = @("bin", "config", "cache", "state", "data", "tmp", "logs")
foreach ($part in $paths) {
  $path = Join-Path $runtime $part
  New-Item -ItemType Directory -Path $path -Force | Out-Null
}
if ([string]::IsNullOrWhiteSpace($Executable)) {
  $candidate = Join-Path $runtime "bin/opencode.exe"
  if (Test-Path $candidate) {
    $Executable = $candidate
  } else {
    $command = Get-Command "opencode" -ErrorAction SilentlyContinue
    if (-not $command) {
      throw "OpenCode V2 executable not found. Place a standalone binary in runtime/bin/opencode.exe or specify -Executable."
    }
    $Executable = $command.Source
  }
}

# Workspace-oriented storage. Check effective paths with 'opencode debug paths'.
$env:XDG_CONFIG_HOME = Join-Path $runtime "config"
$env:XDG_CACHE_HOME = Join-Path $runtime "cache"
$env:XDG_DATA_HOME = Join-Path $runtime "data"
$env:XDG_STATE_HOME = Join-Path $runtime "state"
$env:TEMP = Join-Path $runtime "tmp"
$env:TMP = $env:TEMP
$env:OPENCODE_DB = Join-Path $runtime "data/opencode.sqlite"
$env:NP_WORKSPACE = $repo
$env:NP_STATE_DIR = Join-Path $runtime "state/northpalace"
$env:OPENCODE_URL = "http://127.0.0.1:$Port"

Write-Host "NorthPalace workspace: $repo"
Write-Host "OpenCode executable: $Executable"
Write-Host "Check runtime paths before trusting full confinement:"
Push-Location $repo
try {
  & $Executable debug paths
  & $Executable serve --hostname 127.0.0.1 --port $Port
} finally {
  Pop-Location
}
