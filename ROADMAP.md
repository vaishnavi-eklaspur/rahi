# Roadmap

This roadmap shows where Rahi is headed. It is a statement of intent, not a
commitment to dates. Items may change based on feedback and contributions.

For how to propose or pick up work, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Already shipped (today)

So planned work is not confused with what already exists, here is what Rahi
does now:

- 48-item adaptive assessment: RIASEC interests, difficulty-adaptive aptitude, and
  emotional-intelligence domains, freshly sampled each attempt.
- Weighted fusion into ranked career matches across a curated set of careers, with a
  skill-gate that demotes poorly-matched careers.
- Fact-grounded AI narrative with a provider ladder (Google Gemini → local Ollama →
  deterministic fallback) that never invents facts.
- Database-optional, shareable reports encoded in the URL.
- Self-hosted authentication (email + Google OAuth) with first-party sessions.
- Per-IP rate limiting, baseline security headers, and a documented security audit.
- Container image + Kubernetes manifest; CI with lint, self-checks, build, and E2E.

## Now

Near-term focus — stability, trust, and contributor-readiness.

- **Documentation improvements** — keep README, CONTRIBUTING, and setup instructions
  accurate; add screenshots and clearer onboarding.
- **Assessment validation** — document and sanity-check the scoring model (item
  balance, reverse-keying, difficulty weighting) so results are defensible.
- **Bug fixes** — triage and resolve reported issues.
- **Test coverage** — grow beyond the current self-check + E2E toward per-module unit
  tests (e.g. a Vitest runner) for scoring, API validation, and fallback behavior.
- **Accessibility** — audit keyboard navigation, focus states, color contrast, and
  screen-reader labels across the assessment and report.

## Next

- **Improved career recommendation quality** — refine the fusion weights and the
  skill-gate, and validate rankings against real-world expectations.
- **Better student feedback workflows** — let students react to and refine their
  results, and capture that signal.
- **Performance improvements** — tighten first-load, streaming responsiveness, and
  bundle size.
- **Expanded career information** — broaden the curated career/enrichment data
  (more roles, regions, and up-to-date references).

## Future

- **Community contributions** — good-first-issues, discussions, and a contributor
  workflow that makes external contributions easy.
- **Additional assessment capabilities** — optional modules beyond RIASEC/aptitude/EQ.
- **Expanded educational resources** — richer, curated, free learning paths per career.
- **Internationalization and localization** — multi-language support, starting with
  the assessment and report.

---

*Have an idea? Open a [feature request](.github/ISSUE_TEMPLATE/feature_request.md) or
start a discussion.*
