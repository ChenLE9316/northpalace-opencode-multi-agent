
param(
  [Alias("InstallDependencies")]
  [switch]$InstallClient,
  [switch]$Online
)
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runtime = Join-Path $repo "runtime"
$env:NPM_CONFIG_CACHE = Join-Path $runtime "npm-cache"
$env:NP_WORKSPACE = $repo
$env:NP_STATE_DIR = Join-Path $runtime "state/northpalace"
$env:NP_WORKTREE_ROOT = Join-Path (Split-Path $repo) "northpalace-worktrees"
$env:TEMP = Join-Path $runtime "tmp"
$env:TMP = $env:TEMP
New-Item -ItemType Directory -Path $env:NPM_CONFIG_CACHE -Force | Out-Null
New-Item -ItemType Directory -Path $env:NP_STATE_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw "Node.js >=22 missing; provision a workspace-local Node runtime or provide node on PATH." }
$version = & node -p "parseInt(process.versions.node.split('.')[0])"
if ([int]$version -lt 22) { throw "Node.js >=22 required." }

if ($InstallClient) {
  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if (-not $npm) { throw "npm executable not available." }
  foreach ($packageDirectory in @("coordinator", ".opencode")) {
    Push-Location (Join-Path $repo $packageDirectory)
    try {
      & npm install --no-audit --no-fund
      if ($LASTEXITCODE -ne 0) { throw "npm install failed in $packageDirectory" }
    } finally { Pop-Location }
  }
}

Push-Location (Join-Path $repo "coordinator")
try {
  & node --test
  if ($LASTEXITCODE -ne 0) { throw "Node tests failed" }
} finally {
  Pop-Location
}

if ($Online) {
  Push-Location $repo
  try {
    & node .\coordinator\cli.mjs doctor
    if ($LASTEXITCODE -ne 0) { throw "OpenCode online doctor failed" }
  } finally { Pop-Location }
}
Write-Host "Completed offline checks; online OpenCode V2 runtime remains separate unless -Online was used."
