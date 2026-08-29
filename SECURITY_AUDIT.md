# Security & Production-Readiness Audit — Rahi

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Neon Postgres · Better Auth (self-hosted) · Gemini (LLM)
**Date:** 2026-08-29
**Scope:** Static review of the working tree, full git-history secret scan, dependency audit, and a production build. This documents what was tested and what was addressed. It does not claim the app is "secure" — no such claim can be made.

---

## Summary table

| # | Category | Finding | Severity | Status |
|---|----------|---------|----------|--------|
| 1 | Secrets & credentials | No `.env` ever committed; history holds only placeholder connection strings; all secrets read from env | — | **Pass** |
| 2 | Dependency vulns | 5 high (transitive: `postcss` ×3, `sharp`, `nanoid`) via `next@16.2.12` | High | **Fixed** |
| 3 | Auth & sessions | Password hashing (scrypt), cookie flags, and auth rate-limiting are Better Auth defaults; DB-backed sessions, no JWT | Low | **Pass** |
| 3b | IDOR | Ownership checked via session `user_id`; anon path keyed on a random-UUID device token | Low | **Flagged** |
| 4 | SQL injection | Parameterized tagged-template queries everywhere; no string-built SQL | — | **Pass** |
| 4b | XSS / eval / cmd injection | No `dangerouslySetInnerHTML`, `eval`, `child_process`; React auto-escapes LLM output | — | **Pass** |
| 4c | SSRF | Outbound requests target a hardcoded Gemini host + env-set Ollama only; no user-controlled URLs | — | **Pass** |
| 5 | Security headers | Baseline headers were absent | Medium | **Fixed** |
| 5b | Rate limiting (AI endpoints) | `/api/chat`, `/api/summary`, `/api/why` are unauthenticated + uncapped | Medium | **Flagged** |
| 5c | CORS / HTTPS | Same-origin only (no CORS headers); HTTPS + HSTS enforced | — | **Pass** |
| 6 | Errors & logging | Generic client errors, no stack traces, no PII/secret logging | — | **Pass** |
| 7 | Data protection | Neon encrypts at rest; DB role is not least-privilege | Low | **Flagged** |
| 8 | Config & deploy hygiene | dev/CI/prod configs separated; `.gitignore` complete; README clean | — | **Pass** |
| 9 | Code-quality signals | Playwright E2E + node self-checks + CI on push; lint not gated; thin unit coverage | Low | **Flagged** |

---

## What was fixed

### 2 — Dependency vulnerabilities (High → resolved)
**What was wrong:** `npm audit` reported 5 high-severity advisories, all in transitive dependencies pulled in by `next@16.2.12`: three `postcss` source-map path-traversal issues, a `sharp`/libvips image-processing chain (CVE-2026-33327 and siblings), and a `nanoid` infinite-loop-on-zero-size issue.
**Why it matters:** Even transitive vulnerabilities ship in the deployed bundle. The `sharp` chain is the loudest on paper, though its real exposure here is low (see Known Limitations #7). Leaving known-high advisories unaddressed is the first thing a reviewer greps for.
**Fix applied:** Bumped `next` and `eslint-config-next` from `16.2.12` → `16.3.3` (a patch-level move inside the same major, so no breaking-change risk) and ran `npm audit fix` for `nanoid`. Post-fix: **0 vulnerabilities**, and `npm run build` still compiles all 15 routes.
**Interview explanation:** *"The audit flagged five high-severity issues, every one of them transitive through Next itself rather than a dependency I chose directly. I upgraded Next within the same major version — a safe patch bump, not a breaking upgrade — which cleared four of them, and a standard `audit fix` cleared the last. I re-ran the audit to confirm zero remaining and rebuilt to confirm the upgrade didn't break anything, rather than trusting the tool's summary."*

### 5 — Missing security headers (Medium → resolved)
**What was wrong:** Next.js sends no security response headers by default. Requests came back without `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS, or `Permissions-Policy`.
**Why it matters:** No `X-Frame-Options`/`frame-ancestors` means the app can be iframed into a clickjacking page. No `nosniff` lets a browser MIME-sniff a response into an unexpected content type. No HSTS lets a first request downgrade to plaintext HTTP.
**Fix applied:** Added a `headers()` block in [`next.config.ts`](next.config.ts) applying to every route: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, and a `Permissions-Policy` denying camera/microphone/geolocation (features the app never uses). A full Content-Security-Policy was deliberately **not** added here (see Known Limitations #2).
**Interview explanation:** *"Next doesn't add security headers on its own, so I set a baseline in the config: deny framing to stop clickjacking, `nosniff` to stop MIME-type confusion, a conservative referrer policy, HSTS to lock the site to HTTPS, and a permissions policy that turns off device APIs the app doesn't use. I stopped short of a full CSP on purpose — doing CSP properly with Next's inline styles and the OG-image renderer needs a nonce pipeline, and a careless CSP silently breaks the page, so I flagged it as follow-up rather than shipping a broken one."*

---

## What passed (verified, no change needed)

- **Secrets (Cat 1):** A full-history scan (`git log --all -p`) found no committed `.env` and no real credentials — only placeholder strings (`user:pass@localhost`, `USER:PASSWORD@HOST`) in the CI config and `.env.example`. Every secret (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_*`, `GEMINI_API_KEY`) is read from `process.env` with no real value baked in as a default. `.env*` is git-ignored with an `!.env.example` opt-in. **No key rotation or history scrub is required.**
- **SQL injection (Cat 4):** Every query uses Neon's `sql\`…\`` tagged template, which sends `${…}` as bound parameters, never string concatenation — checked across `save`, `reports`, `r/[code]`, and the OG image route.
- **XSS / command injection (Cat 4):** No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `child_process` anywhere in the codebase. Streamed LLM text is rendered as a React text node (`{m.content}`), which is auto-escaped.
- **SSRF (Cat 4):** The only outbound requests go to a hardcoded `generativelanguage.googleapis.com` host and an env-configured Ollama URL. No request target is derived from user input.
- **Auth & sessions (Cat 3):** Passwords are hashed with scrypt (Better Auth default — salted and memory-hard, not plaintext/MD5/SHA1). Sessions are database-backed via a signed, `HttpOnly`, `SameSite=Lax`, `Secure`-in-production cookie — no JWT and no sensitive data in any token. Better Auth's built-in rate limiter covers the auth endpoints in production.
- **Errors & logging (Cat 6):** API routes return generic messages (`"Something went wrong"`, `{ slug: null }`) and never leak stack traces; production Next does the same by default. The only `console.log` in the codebase is in a dev-only self-check script — no PII or secrets are logged.
- **CORS / HTTPS (Cat 5):** No route sets `Access-Control-Allow-Origin`, so the API is same-origin only — there is no `*`-with-credentials misconfiguration. Vercel enforces HTTPS at the edge, now backed by the HSTS header.
- **Config hygiene (Cat 8):** Real secrets live in Vercel; CI uses throwaway placeholders; `.env.example` documents the shape with obvious non-secrets. `.gitignore` covers `node_modules`, `.env*`, `.next`, build output, `*.pem`, `.vercel`, and Playwright artifacts.
- **Code-quality signals (Cat 9):** There is a Playwright E2E test driving the full 48-question assessment through to a shared report, plus node self-checks for the scoring/encoding logic, both run by GitHub Actions on every push and PR. Commit history is a real progression of nine messages, not a single squashed "final commit."

---

## Known Limitations (not fixed — by scope or decision)

1. **No rate limiting on the AI endpoints.** `/api/chat`, `/api/summary`, and `/api/why` are unauthenticated and call a paid LLM. On Vercel's serverless model an in-memory limiter is useless — instances don't share memory — so a real fix needs a shared store (Upstash Redis or Vercel KV). I chose to flag this rather than ship an in-memory limiter that looks like protection but isn't. *Risk: cost/abuse if the endpoint is scripted.*
2. **No full Content-Security-Policy.** Baseline headers are in place, but a real CSP requires a nonce pipeline for Next's inline styles/scripts and the `next/og` renderer, plus per-route testing to avoid silently breaking rendering. Deferred deliberately.
3. **Database role is not least-privilege.** The `DATABASE_URL` uses Neon's default owner-level role. A hardened setup would use a role scoped to `SELECT/INSERT` on the `reports` table (and the Better Auth tables). Acceptable for a portfolio app; noted as the upgrade path.
4. **Lint is not in the CI gate.** Three pre-existing lint errors exist; lint was kept out of the required checks so builds stay green. The honest fix is to clear them, then add `npm run lint` to CI.
5. **Thin unit-test coverage.** E2E and self-checks exist, but the pure scoring modules (`riasec`, `aptitude`, `eq`, `careers`) would benefit from direct unit tests.
6. **No startup assertion for required env vars.** A missing `DATABASE_URL` or `BETTER_AUTH_SECRET` fails at request time rather than at boot. A fail-fast check on startup would surface misconfiguration sooner.
7. **`sharp` advisory has low real exposure here.** It was patched anyway, but the app never processes user-uploaded images — OG images are text-only via `next/og`, and other images are static SVGs — so the libvips CVEs had little attack surface to begin with.
8. **Gemini API key travels as a URL query parameter.** This is Google's documented REST auth mechanism and happens server-to-server over HTTPS, so the key is never exposed to the client. Switching to header-based/Vertex auth would keep it out of any upstream request logs.
9. **Anonymous "My reports" is a bearer-capability model.** Without login, reports are listed by a `crypto.randomUUID()` device id stored in `localStorage`. Anyone holding that UUID could list that device's reports — but the data is non-sensitive career-assessment results that are shareable by design, so the risk is low.

---

## Manual follow-ups for the maintainer

- **Secrets:** none required — history is clean, so there is nothing to scrub with BFG/filter-repo and no leaked key to rotate.
- **Re-verify the dependency fix yourself:** `npm audit` should print `found 0 vulnerabilities`.
- **Verify the headers at runtime after deploy:** `curl -I https://rahi-fawn.vercel.app` and confirm the five headers above are present.
- **Verify cookie flags:** in browser DevTools → Application → Cookies, confirm the Better Auth session cookie shows `HttpOnly`, `Secure`, and `SameSite=Lax`.
