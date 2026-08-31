# Public Release Policy

This repository is a **projection for demonstration and review**, not a byte-for-byte export of a private development environment.

## Allowed public surfaces

- Public agent role contracts and bounded delegation rules.
- Representative commands and skills.
- Architecture and governance documentation.
- Generic JSON schemas for task/result/evidence exchange.
- Public-safe example OpenCode configuration.
- Deterministic validation scripts and CI.

## Forbidden public surfaces

- Secrets, tokens, keys, cookies, authentication material, private URLs with credentials, or private certificates.
- Personal names used only in private contexts, personal email/phone/address data, user-home paths, device names, local shares, or private IP addresses.
- Raw conversations, session databases, screenshots, browser history, clipboard data, logs, telemetry dumps, crash dumps, or private artifacts.
- Real private backlog items, runtime evidence bundles, internal traceability snapshots, or private operational timestamps when they are not required for demonstration.
- Global workstation configuration or mirror state.
- Private model routing, private quotas, private provider accounts, credential-bearing plugins, or private MCP endpoints.
- Backup files, exported config snapshots, `.env` files, SSH/cloud credentials, or private repository references.

## Publication workflow

1. Curate only the surfaces needed to demonstrate architecture.
2. Replace runtime-specific values with public-safe examples or omit them.
3. Run `npm run validate`.
4. Require Human review of the diff.
5. Publish only after privacy/security checks are clean.

## History rule

Deleting a sensitive file in a later commit is not sufficient. If sensitive content was committed, treat reachable Git history as exposed and rewrite/remove affected history as appropriate.
