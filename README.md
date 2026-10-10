# The Emissary — Retention Intelligence frontend (pre-deployment starter)

This is a standalone React + TypeScript + Vite frontend scaffold for the planned `https://theemissary.dev/retention` app. It provides 12 navigable areas and renders initial observational metrics when the router API is wired. **Not deployed. Not a claim that the eventual data pipelines already exist.**

## API requirements
The site calls only same-origin `/api/retention/*`: the four Stage 1A routes (`overview`, `observed-span`, `last-known-progress`, `capabilities`) and three Stage 1B proposed scenario routes (`scenario-return`, `scenario-outcomes`, `scenario-groups`). Source endpoints are in the draft `emissary-tools/killboard-scenario-stats` PR #25 under `/retention/*` and are not live until reviewed/deployed and routed by `theemissary-router`.

## Next steps
1. Provision independent `emissary-tools/ror-retention` repository and trevrcates Cloudflare Pages project, keeping production router unchanged until the frontend and API pass checks.
2. Add package lock with `npm install`, run `npm run build`, add tests/accessibility checks and confirm bundle uses `base: '/retention/'`.
3. Codex checks exact Ultra routing rewrite behavior; then wire `/api/retention` and `/retention` on the router, update service registry, navigation and system health checks.
4. Existing planned panels intentionally show their data dependencies instead of fabricated results. Extend them only after coverage-qualified daily/cohort data is available. No direct RoR GraphQL fetches.

Current spec: https://github.com/emissary-tools/theemissary-router/blob/main/RETENTION_PRODUCT_SPEC.md.

## 2026-10-10 frontend improvements
- CSV exports for provisional observed-span cohorts and last-known progression, with spreadsheet formula neutralization.
- URL-persisted cohort-month and inactivity-day selector values.
- Report calculation timestamps displayed explicitly and not treated as verified ingestion completeness.
- Local TypeScript/TSX transpile syntax checks and pure CSV sanitization tests passed. Full Vite build requires installing package dependencies in an online or cached environment.
- API-ready Scenario Retention, Scenario Experience, and Groups & Premades tabs. Unsupported endpoints show a clear unavailable state rather than pretending the metrics exist. Percentages are suppressed when source coverage is unverified.
- Proposed typed API contract: https://github.com/emissary-tools/theemissary-router/blob/main/RETENTION_API_CONTRACT.md. Codex must verify real PostgreSQL semantics before implementing payloads.
- Run `npm test` for CSV export safety checks; run `npm run build` after installing dependencies. Initial tests pass locally.
