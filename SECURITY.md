# Security Policy

## Public repository security boundary

This repository must never contain real credentials, private keys, access tokens, authentication cookies, personal email addresses, phone numbers, private network addresses, machine names, user-home paths, raw sessions/logs, private screenshots, or private repository/workspace identifiers.

## Configuration examples

All configuration in this repository is demonstrative. Private provider routing, credentials, plugins, MCP endpoints, global workstation state, and local deployment details belong outside the public repository.

## Reporting

If sensitive information is discovered, do not quote or redistribute it in a public issue. Remove the material from the current tree, rotate any affected credential, and rewrite reachable Git history when necessary.

## Validation

`npm run validate` includes public-safety and structure checks. CI uses a full Git checkout so deleted historical sensitive content is scanned as well.

A passing automated scan reduces risk but does not replace Human review before publication.
