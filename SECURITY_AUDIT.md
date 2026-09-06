# Security & Production-Readiness Audit — Rahi

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Neon Postgres · Better Auth (self-hosted) · Google Gemini (LLM)
**Date:** 2026-09-06
**Scope:** Static review of the working tree, full git-history secret scan, dependency audit (`npm audit`), a production build, and a review of the container/CI configuration. This documents what was tested and what was addressed. It does **not** claim the app is "secure" or "leakproof" — no such claim can be made; it records specific checks and specific changes.

---

## Summary table

| # | Category | Finding | Severity | Status |
|---|----------|---------|----------|--------|
| 1 | Secrets & credentials | No `.env` ever committed; history holds only placeholder connection strings; every secret read from `process.env`, no baked-in defaults | — | **Pass** |
| 2 | Dependency vulnerabilities | `npm audit` → **0 vulnerabilities** (5 earlier high advisories, all transitive via Next, cleared by a same-major bump to `next@16.3.3`) | — | **Pass** |
| 3 | Auth & sessions | scrypt password hashing, DB-backed sessions, `HttpOnly`/`Secure`/`SameSite=Lax` cookie, no JWT; assessment now login-gated, and data routes validate the session **server-side** | Low | **Pass** |
| 3b | IDOR / BOLA | Authenticated reads scoped to session `user_id`; anonymous path is a bearer-capability model keyed on a random device UUID | Low | **Flagged** |
| 4 | SQL injection | Neon parameterized tagged-template queries everywhere; no string-concatenated SQL | — | **Pass** |
| 4b | XSS / eval / cmd injection | No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `child_process`; React auto-escapes streamed LLM text | — | **Pass** |
| 4c | SSRF | Outbound calls target a hardcoded Gemini host + an env-set Ollama URL only; no user-controlled request targets | — | **Pass** |
| 5 | Security headers | Full baseline set + a partial CSP (`base-uri`/`form-action`/`object-src`/`frame-ancestors`); only the script/style-src nonce pipeline is deferred | Low | **Pass** |
| 5b | Rate limiting | Per-IP fixed-window limiter added to the three public LLM endpoints; best-effort per instance on serverless | Medium | **Fixed** |
| 5c | CORS / HTTPS | Same-origin only (no `Access-Control-Allow-Origin`); HTTPS + HSTS enforced | — | **Pass** |
| 6 | Errors & logging | Generic client errors, no stack traces, no PII/secret logging; the only `console.log` is a dev self-check | — | **Pass** |
| 7 | Data protection | Neon encrypts at rest; DB role is not least-privilege; PII stored is minimal (email/name + non-sensitive assessment answers) | Low | **Flagged** |
| 8 | Config & deploy hygiene | dev/CI/prod configs separated; `.gitignore` + `.dockerignore` complete; README carries no live secrets | — | **Pass** |
| 9 | Code-quality signals | Playwright E2E + node self-checks + CI (lint now gated) on every push; 29-commit real history; thin unit coverage | Low | **Pass / Flagged** |
| 10 | Container & infra hygiene | Non-root user, pinned base image, `.dockerignore`; `deploy/k8s.yaml` ships resource requests/limits, `/healthz` probes, and a non-root `securityContext` | — | **Pass** |
| 11 | Frontend & build-time secrets | No `NEXT_PUBLIC_*` vars exist → no secret compiled into the bundle; production source maps not enabled | — | **Pass** |
| 12 | Business logic & data integrity | Explicit-column inserts (no mass assignment); `user_id` from session, never the client body; idempotent save with slug-collision retry | Low | **Pass** |
| 13 | Dependency & repo integrity | `package-lock.json` committed; CI installs via `npm ci`; GitHub Actions token scoped to `contents: read` | — | **Pass** |
| 14 | Vibecoding artifact sweep | No `TODO`/`FIXME` debt, no dead duplicate components, no "Claude/ChatGPT/AI-generated" strings in code or history | — | **Pass** |
| 15 | Misc production leaks | No Swagger/GraphQL introspection; open-redirect-guarded login; no file uploads; `X-Powered-By` stripped; `/healthz` leaks nothing | — | **Pass** |

---

## What was fixed / addressed

### 5b — Rate limiting on the public LLM endpoints (Medium)
**What was wrong:** `/api/why`, `/api/summary`, and `/api/chat` are unauthenticated and each call a paid LLM. Uncapped, a single scripted client could both run up the Gemini bill and degrade the service for everyone.
**Fix applied:** A per-IP fixed-window limiter (`lib/rate-limit.ts`, 30 requests/60s per endpoint) now guards all three routes; over the limit they return the same null/fallback shape the client already handles, so the UX degrades gracefully rather than erroring.
**Honest caveat:** the limiter is in-memory. On Vercel's serverless model, instances don't share memory, so this is **best-effort per instance** — it fully caps a client that keeps hitting one warm instance, and it's completely correct on a single-replica container deploy, but a distributed attacker spread across many cold starts isn't bounded by it. The robust cross-instance version needs a shared store (Upstash Redis / Vercel KV); that's the documented upgrade path.
**Interview explanation:** *"The three AI endpoints are public and cost money per call, so I added a per-IP fixed-window rate limiter that returns the graceful fallback instead of an error when tripped. I'm deliberately clear about its ceiling: it's in-memory, so on serverless it's per-instance rather than global — it stops the obvious single-client abuse and is exact on a single-replica container, but true distributed limiting would need a shared Redis/KV store. I'd rather ship an honest best-effort control and name its limit than pretend an in-memory limiter is a global one."*

### 9 / 13 — CI gate hardening
**What was wrong:** Lint wasn't in the CI gate (three pre-existing lint errors were being tolerated), and the GitHub Actions workflow had no `permissions:` block, so its `GITHUB_TOKEN` defaulted to broad write access it never needs.
**Fix applied:** Cleared the lint errors and added `npm run lint` to the build job, so lint failures now block merges. Added a top-level `permissions: contents: read` to `.github/workflows/ci.yml`, scoping the token to read-only.
**Interview explanation:** *"CI ran the build and tests but not lint, and its token was write-all by default. I fixed the outstanding lint issues and made lint a required check, then scoped the Actions token down to `contents: read` — the pipeline only needs to read the repo to test it, so there's no reason to hand it write permissions a compromised action could abuse."*

### 15 / 10 — Framework version disclosure (`X-Powered-By`)
**What was wrong:** Next.js sends `X-Powered-By: Next.js` by default. Vercel's edge strips it in production, but the app now also ships as a container (Kubernetes/OpenShift), where nothing would strip it — leaking the framework to anyone reading response headers.
**Fix applied:** Set `poweredByHeader: false` in `next.config.ts`, so the header is gone on **both** the Vercel and container deployment paths.
**Interview explanation:** *"Version/framework banners give an attacker a free hint about what to target. Vercel already stripped `X-Powered-By`, but once I containerized the app that stripping no longer applies, so I turned the header off at the framework level to cover both deployment targets."*

### 5 — Partial Content-Security-Policy (defense-in-depth)
**What was wrong:** No CSP at all. A full CSP was deferred because Next injects inline hydration scripts and styles, which need per-request nonces — a careless CSP silently breaks rendering.
**Fix applied:** Added the CSP directives that harden *without* a nonce pipeline: `base-uri 'self'` (blocks `<base>`-tag injection that hijacks relative URLs), `form-action 'self'` (a captured form can't POST off-site), `object-src 'none'` (no Flash/plugin embeds), `frame-ancestors 'none'` (defense-in-depth with `X-Frame-Options`). Deliberately **no** `default-src`/`script-src`/`style-src`, so nothing Next renders inline is blocked. Verified in-browser: the header is served and the pages load with zero CSP violations in the console.
**Interview explanation:** *"A full CSP is the right goal but the honest blocker is that Next's inline scripts and styles need a nonce pipeline, and a broken CSP fails silently. So I shipped the half that's safe today — base-uri, form-action, object-src, and frame-ancestors — which closes real classes of attack without touching script/style-src, and I verified in the browser that it doesn't break rendering. The nonce work for script/style-src is the documented remainder, not a pretend-complete CSP."*

### 10 — Kubernetes resource limits & pod hardening
**What was wrong:** The audit flagged that no orchestration manifest declared CPU/memory limits — on a shared cluster, an unbounded pod can starve neighbours.
**Fix applied:** Added `deploy/k8s.yaml` — a Deployment + Service with explicit `resources.requests`/`limits`, `livenessProbe`/`readinessProbe` on `/healthz`, a pod-level non-root `securityContext` (`runAsNonRoot`, `runAsUser: 1001`, `seccompProfile: RuntimeDefault`), and container-level `allowPrivilegeEscalation: false` + `capabilities: drop: [ALL]`. Secrets are referenced via `secretRef`, never committed.
**Interview explanation:** *"I turned the Dockerfile into a real deploy story: a Kubernetes manifest with CPU/memory requests and limits so the scheduler can place the pod and cap a runaway, liveness/readiness probes wired to the healthz endpoint, and a hardened security context — non-root, no privilege escalation, all capabilities dropped. Secrets come from a Kubernetes Secret by reference, so nothing sensitive lives in the repo."*

### 2 — Dependency vulnerabilities (earlier fix, re-verified)
**What was wrong:** `npm audit` had reported 5 high-severity advisories, all transitive through `next@16.2.12` (three `postcss` path-traversal issues, a `sharp`/libvips chain, a `nanoid` issue).
**Fix applied:** Bumped `next`/`eslint-config-next` to `16.3.3` (same-major patch move, no breaking change) and ran `npm audit fix`. **Re-verified this pass: `npm audit` → 0 vulnerabilities**, and the production build still compiles all routes.
**Interview explanation:** *"Every high was transitive through Next itself, so a same-major version bump cleared them without a breaking upgrade. I re-ran the audit during this review to confirm it's still zero rather than trusting the earlier result."*

### 5 — Security headers (earlier fix, still in place)
**What:** `next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (2-year, `includeSubDomains; preload`), and a `Permissions-Policy` denying camera/mic/geolocation. A full CSP is deliberately deferred (see Known Limitations).

---

## What passed (verified, no change needed)

- **Secrets (Cat 1):** Full-history scan found no committed `.env` and no real credentials — only placeholders (`user:pass@localhost`, `USER:PASSWORD@HOST`) in CI/`.env.example`. All secrets read from `process.env` with no baked-in default. `.env*` is git-ignored (`!.env.example` opt-in) and `.dockerignore` keeps `.env*` out of the image. **No key rotation or history scrub required.**
- **Auth & sessions (Cat 3):** Passwords hashed with scrypt (Better Auth default — salted, memory-hard). Sessions are DB-backed via a `HttpOnly`, `SameSite=Lax`, `Secure`-in-prod cookie; no JWT, no sensitive data in any token. The `/assessment` route is login-gated by `proxy.ts` (optimistic cookie-presence check), and — importantly — the data routes (`/api/save`, `/api/reports`) independently validate the session **server-side** via `auth.api.getSession()`, so the gate is convenience, not the security boundary.
- **SQL injection (Cat 4):** Every query uses Neon's `sql\`…\`` tagged template (bound `${…}` parameters), checked across `save`, `reports`, `r/[code]`, and the OG-image route. No string-built SQL.
- **XSS / cmd injection (Cat 4):** No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `child_process` anywhere. Streamed LLM text renders as a React text node (auto-escaped).
- **SSRF (Cat 4):** Outbound requests go only to a hardcoded `generativelanguage.googleapis.com` and an env-set Ollama URL — never a user-supplied target.
- **CORS / HTTPS (Cat 5):** No route sets `Access-Control-Allow-Origin`, so the API is same-origin only (no `*`-with-credentials footgun). HTTPS + HSTS enforced.
- **Errors & logging (Cat 6):** Routes return generic shapes (`"Something went wrong"`, `{ slug: null }`) and never leak stack traces; production Next hides them by default. The only `console.log` is in the dev-only self-check script — no PII/secrets logged.
- **Data protection (Cat 7):** Neon encrypts at rest. PII stored is minimal: email + display name (auth tables) and non-sensitive career-assessment answers; a report is a pure function of its answers and is shareable by design.
- **Config hygiene (Cat 8):** Real secrets live in Vercel; CI and Docker builds use throwaway placeholders; `.env.example` documents shape only. `.gitignore` covers `node_modules`, `.env*`, `.next`, build output, `*.pem`, `.vercel`, Playwright artifacts; `.dockerignore` excludes `.git`, `.env*`, `node_modules`.
- **Code-quality signals (Cat 9):** Playwright E2E drives the full 48-question flow to a shared report; node self-checks cover scoring/encoding; GitHub Actions runs lint + self-check + build + E2E on every push/PR. Commit history is a real 29-commit progression, not a squashed "final commit."
- **Container hygiene (Cat 10):** The `Dockerfile` runs as a non-root user (`USER nextjs`, uid 1001), pins its base image (`node:22-alpine`, not `latest`), and a `.dockerignore` keeps `.git`/`.env`/`node_modules` out of the image. `deploy/k8s.yaml` adds resource requests/limits, `/healthz` probes, and a hardened pod `securityContext`. Verified this pass: the image builds cleanly (0 warnings) and the running container serves `/healthz` + `/` and reports Docker `healthy`.
- **Frontend secrets (Cat 11):** There are **no** `NEXT_PUBLIC_*` variables, so nothing secret is compiled into the client bundle. Production browser source maps are not enabled (Next default off).
- **Business logic (Cat 12):** Inserts name explicit columns; `user_id` is taken from the validated session, never from the request body, so there's no mass-assignment/`is_admin`-style over-posting. Re-saving a report is idempotent (returns the existing slug), and slug generation retries on collision. No payment/booking/inventory surface exists to race.
- **Repo integrity (Cat 13):** `package-lock.json` is committed and CI installs with `npm ci` (locked, reproducible), not a fresh resolve. Actions token scoped to `contents: read`.
- **Vibecoding sweep (Cat 14):** No `TODO`/`FIXME`/"your code here" placeholders, no duplicate/dead components, and no "Claude/ChatGPT/AI-generated" strings in shipped code or commit messages.
- **Misc leaks (Cat 15):** No Swagger/OpenAPI or GraphQL introspection surface exists. The login redirect is open-redirect-guarded (same-origin `next` only). There are no file-upload endpoints. `/healthz` returns only `{"status":"ok"}` — no version, stack trace, or environment detail.

---

## Known Limitations (not fixed — by scope or decision)

1. **Rate limiter is in-memory (per-instance on serverless).** Meaningful against single-client abuse and exact on a single-replica container, but not a global limit across Vercel instances. Robust fix = shared store (Upstash Redis / Vercel KV). *See fix note 5b.*
2. **CSP is partial (no `script-src`/`style-src`).** The safe directives are shipped (`base-uri`, `form-action`, `object-src`, `frame-ancestors`); restricting scripts/styles needs a per-request nonce pipeline for Next's inline hydration output, so that piece is deferred rather than shipped broken.
3. **Database role is not least-privilege.** `DATABASE_URL` uses Neon's default owner-level role. A hardened setup would scope a role to `SELECT/INSERT` on the `reports` + Better Auth tables. Acceptable for a portfolio app; noted as the upgrade path.
4. **Anonymous "My reports" is a bearer-capability model.** Without login, reports are listed by a `crypto.randomUUID()` device id in `localStorage`; anyone holding that UUID could list that device's reports. The data is non-sensitive, shareable-by-design career results, so the risk is low.
5. **Tests live in one self-check script, not per-module test files.** Coverage of the pure logic is actually broad — `lib/riasec.selfcheck.ts` asserts RIASEC/aptitude/EQ scoring, adaptive difficulty, sampling balance, fusion/ranking, the skill-gate, enrichment coverage, and report-code round-trips — but it's a single framework-free script rather than granular `test_*` files with a coverage metric. A reviewer wanting per-module tests + coverage numbers would add a runner (Vitest); kept framework-free by design.
6. **No startup assertion for required env vars.** A missing `DATABASE_URL`/`BETTER_AUTH_SECRET` fails at request time, not at boot. A fail-fast startup check would surface misconfiguration sooner.
7. **Base image pinned to a tag, not a digest.** `deploy/k8s.yaml` now declares CPU/memory requests+limits and a hardened `securityContext`, so orchestration hygiene is covered. The one remaining nit: `node:22-alpine` is a tag, so it still receives upstream patches rather than being byte-for-byte reproducible — pin a digest (`node:22-alpine@sha256:…`) if fully reproducible builds are required (trade-off: you then have to bump it to get security patches).
8. **Gemini API key travels as a URL query parameter.** This is Google's documented REST auth mechanism, server-to-server over HTTPS, so the key never reaches the client. Header-based/Vertex auth would additionally keep it out of any upstream request logs.

---

## Manual follow-ups for the maintainer

- **Secrets:** none required — history is clean, nothing to scrub with BFG/filter-repo, no leaked key to rotate.
- **Re-verify the dependency fix yourself:** `npm audit` should print `found 0 vulnerabilities`.
- **Verify headers at runtime after deploy:** `curl -I https://rahi-fawn.vercel.app` — confirm the five security headers are present and `X-Powered-By` is absent.
- **Verify cookie flags:** DevTools → Application → Cookies — the Better Auth session cookie should show `HttpOnly`, `Secure`, `SameSite=Lax`.
- **Container smoke-test:** ✅ done in this pass — `docker build` produced a clean image (no warnings), and the running container served `/healthz` (`200 {"status":"ok"}`) and `/` (Rahi) with Docker reporting the container `healthy`. Re-run with `docker build -t rahi . && docker run --rm -p 3001:3000 -e BETTER_AUTH_URL=http://localhost:3001 -e BETTER_AUTH_SECRET=dev-smoke-secret rahi` (port 3001 to avoid clashing with a local dev server).
