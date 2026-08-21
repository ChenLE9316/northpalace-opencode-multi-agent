#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
OVERLAY="$ROOT/compat/v2/opencode.overlay.jsonc"

if ! command -v opencode2 >/dev/null 2>&1; then
  printf '%s\n' 'NorthPalace V2 launcher: opencode2 was not found in PATH.' >&2
  exit 127
fi
if [[ ! -f "$OVERLAY" || ! -f "$ROOT/opencode.jsonc" ]]; then
  printf '%s\n' 'NorthPalace V2 launcher: canonical config or compatibility overlay is missing.' >&2
  exit 2
fi
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'NorthPalace V2 launcher: Node.js is required for deterministic preflight.' >&2
  exit 127
fi

if [[ -n "${OPENCODE_CONFIG_DIR:-}" ]]; then
  if [[ ! -d "$OPENCODE_CONFIG_DIR" ]]; then
    printf '%s\n' 'NorthPalace V2 launcher: OPENCODE_CONFIG_DIR does not resolve to a directory.' >&2
    exit 2
  fi
  REQUESTED_ROOT="$(cd -- "$OPENCODE_CONFIG_DIR" && pwd -P)"
  if [[ "$REQUESTED_ROOT" != "$ROOT" ]]; then
    printf '%s\n' 'NorthPalace V2 launcher: refusing to validate one config root while loading another.' >&2
    exit 2
  fi
fi

node "$ROOT/scripts/validate-governance.mjs" --deployment --project "$PWD"
node "$ROOT/scripts/validate-model-routing.mjs"
node "$ROOT/scripts/validate-desktop-contract.mjs"
node "$ROOT/scripts/check-project-overrides.mjs" --project "$PWD"

export OPENCODE_CONFIG_DIR="$ROOT"
export OPENCODE_CONFIG="$OVERLAY"
export NORTHPALACE_RUNTIME_TARGET="v2"
exec opencode2 "$@"
