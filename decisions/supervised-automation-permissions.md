# Decision: Supervised Automation Permission Model

**Status:** Accepted
**Date:** 2026-08-22

## Context

OpenCode Desktop is used both for coding and Human-supervised / optionally auto-approved computer operation. A baseline with broad Bash `allow` gives too little normal-mode supervision, while converting every risky capability to hard `deny` prevents the operator from using Desktop permission UI and Auto Mode as intended.

OpenCode Auto Mode automatically approves actions that would otherwise be `ask`, while explicit `deny` remains blocked. Therefore `ask` cannot be treated as a hard security boundary.

## Decision

NorthPalace uses three permission classes:

- `allow`: low-risk/high-frequency action; no approval friction.
- `ask`: supervised capability in normal mode; Human-preauthorized when Auto Mode is intentionally enabled.
- `deny`: hard runtime boundary that Auto Mode cannot bypass.

Canonical changes:

1. Global Bash fallback becomes `ask`; exact low-risk Git inspection stays `allow`.
2. Raw deletion, push/publish/deploy, selected infrastructure apply/destroy, disk/power destruction remain `deny`.
3. `cargo clean` becomes `ask` rather than hard deny.
4. Native `read` and `edit` both deny sensitive env/auth/SSH/cloud/credential/private-key paths; `.env.example` remains allowed.
5. Plan noncanonical Task fallback becomes `deny`; its 17 reviewed read-only L2 routes remain `allow`.
6. Build and NorthPace Loop noncanonical Task fallback remain `ask`.
7. NorthPace Loop hard-denies `doom_loop` while keeping no repository `steps` ceiling.
8. Global Playwright/CUA remain denied. Build/Loop re-enable bounded browser/CUA as `ask`; selected UI/E2E/Desktop specialists re-enable browser automation with narrower exceptions.
9. Playwright/CUA MCP transports remain disabled-by-default until Human Operator verifies local availability and intentionally enables them.
10. Human direct primary switching, `@agent`, `/command`, manual edit, and standalone work remain outside the model-autonomous Task DAG.

## Consequences

Normal Desktop use gains visible supervision for general shell/browser/computer actions. Trusted Auto Mode can run `ask` capabilities without repeated clicks, but hard-denied operations still stop.

Plan remains mechanically read-only even under Auto Mode. Review/security/read-only specialists retain Bash/edit denies.

Native sensitive-file denies are not a process sandbox. Shell-capable agents can have broader filesystem reach through permitted processes, so Auto Mode is treated as broad Human shell preauthorization.

## Deferred environment work

Do not auto-upgrade `@opencode-ai/plugin`, localize LSP/MCP binaries, or enable optional Playwright/CUA transports solely from static repo evidence. Those changes require the actual Desktop environment, binary availability, and target-runtime smoke.
