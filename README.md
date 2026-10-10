# The Emissary — Retention Intelligence frontend

This is the standalone React + TypeScript + Vite frontend for the planned `https://theemissary.dev/retention` app. It provides 12 navigable areas and renders only metrics returned by the retention API. The independent Cloudflare preview is deployed at `https://ror-retention.theemissary-router.workers.dev`; the canonical router route remains pending backend review and routing changes.

## API requirements
The site calls only same-origin `/api/retention/*`: the four Stage 1A routes (`overview`, `observed-span`, `last-known-progress`, `capabilities`) and three Stage 1B proposed scenario routes (`scenario-return`, `scenario-outcomes`, `scenario-groups`). The current backend implementation is in `emissary-tools/killboard-scenario-stats` PR #27 under `/retention/*`; it is not live on the canonical router until reviewed, deployed, and routed.

## Next steps
1. Review and deploy backend PR #27 after the PostgreSQL plan, index, latency, and coverage-quality gates pass.
2. Wire `/api/retention` and `/retention` on the router, update service registry, navigation, and system health checks.
3. Complete the source-empty-day audit before enabling cohort rates. Until then, the UI shows unknown/unverified states rather than fabricated results.
4. Extend Scenario Experience and Groups & Premades only after their coverage-qualified endpoints exist. No direct RoR GraphQL fetches.

Current spec: https://github.com/emissary-tools/theemissary-router/blob/main/RETENTION_PRODUCT_SPEC.md.

## 2026-10-10 frontend improvements
- CSV exports for provisional observed-span cohorts and last-known progression, with spreadsheet formula neutralization.
- URL-persisted cohort-month and inactivity-day selector values.
- Report calculation timestamps displayed explicitly and not treated as verified ingestion completeness.
- Local TypeScript/TSX transpile syntax checks and pure CSV sanitization tests passed. Full Vite build requires installing package dependencies in an online or cached environment.
- API-ready Scenario Retention, Scenario Experience, and Groups & Premades tabs. Unsupported endpoints show a clear unavailable state rather than pretending the metrics exist. Percentages are suppressed when source coverage is unverified.
- Proposed typed API contract: https://github.com/emissary-tools/theemissary-router/blob/main/RETENTION_API_CONTRACT.md. Codex must verify real PostgreSQL semantics before implementing payloads.
- Run `npm test` for CSV export safety checks; run `npm run build` after installing dependencies. Initial tests pass locally.
