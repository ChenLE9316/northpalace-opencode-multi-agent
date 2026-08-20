#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
OVERLAY="$ROOT/compat/v2/opencode.overlay.jsonc"

if ! command -v opencode2 >/dev/null 2>&1; then
  printf '%s\n' 'NorthPalace V2 launcher: opencode2 was not found in PATH.' >&2
  exit 127
fi

if [[ ! -f "$OVERLAY" ]]; then
  printf '%s\n' 'NorthPalace V2 launcher: compatibility overlay is missing.' >&2
  exit 2
fi

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'NorthPalace V2 launcher: Node.js is required for governance preflight.' >&2
  exit 127
fi

node "$ROOT/scripts/validate-governance.mjs" --deployment --project "$PWD"
node "$ROOT/scripts/check-project-overrides.mjs" --project "$PWD"

export OPENCODE_CONFIG="$OVERLAY"
export NORTHPALACE_RUNTIME_TARGET="v2"
exec opencode2 "$@"
