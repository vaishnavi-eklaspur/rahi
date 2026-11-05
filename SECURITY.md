# Security Policy

Rahi takes security seriously. This document explains how to report a vulnerability
and what to expect. For a record of what has already been tested and hardened, see
[`SECURITY_AUDIT.md`](SECURITY_AUDIT.md).

## Supported versions

Rahi is a continuously deployed web application with a single active line of
development. Security fixes are applied to the latest `main` (and the live deployment);
there are no maintained older release branches.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| older commits | ❌ |

## Reporting a vulnerability

**Please do not open a public issue, pull request, or discussion for a security
vulnerability.** Public disclosure before a fix puts users at risk.

Instead, report it privately through GitHub's built-in mechanism:

1. Go to the repository's **Security** tab →
   **[Report a vulnerability](https://github.com/vaishnavi-eklaspur/rahi/security/advisories/new)**.
2. Describe the issue, the affected area (route, component, or module), and clear steps
   to reproduce.
3. Include impact and any proof-of-concept if you have one.

This routes the report to the maintainer privately via a GitHub Security Advisory.

## What to expect

- **Acknowledgement:** within about 5 business days.
- **Assessment:** the maintainer will confirm the issue, determine severity, and keep
  you updated on progress.
- **Fix & disclosure:** once a fix is ready, the advisory is resolved and — with your
  permission — your contribution is credited.

As a solo, non-commercial educational project, Rahi has no formal bug-bounty or
guaranteed SLA; these are best-effort timelines.

## Scope

In scope: the application code in this repository (routes, authentication, assessment
and scoring logic, AI integration, report sharing).

Out of scope: vulnerabilities in third-party platforms the project merely uses (Vercel,
Neon, Google, GitHub) — report those to the respective vendor.

## Security best practices for contributors

- Never commit secrets. `.env*` is git-ignored (except `.env.example`); keep real
  values out of code, commits, and logs.
- Use parameterized queries (tagged-template SQL) — never build SQL by string
  concatenation.
- Validate and bound all external input in route handlers.
- Don't weaken existing controls (security headers, rate limiting, session validation,
  ownership checks on report access) without discussion.
- Run `npm audit` and address high/critical advisories in dependency changes.
