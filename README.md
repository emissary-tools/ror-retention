# The Emissary — Retention Intelligence frontend

This is the independent React + TypeScript + Vite frontend for the planned `https://theemissary.dev/retention` app. It provides 12 navigable areas, renders verified observational metrics when the router API is wired, and keeps unsupported panels explicit. It does not claim account retention or confirmed quitting.

## API requirements
The site calls only same-origin `/api/retention/*` routes. Current panels use `/overview`, `/observed-span`, `/last-known-progress`, `/capabilities`, and the Stage 1B `/coverage` and `/scenario-return` routes from the backend draft PR #27. The browser never calls RoR GraphQL directly.

## Next steps
1. Review backend PR #27 and run the authorized Ultra query-plan/performance gate before deployment.
2. Add frontend tests/accessibility checks and confirm the bundle uses `base: '/retention/'`.
3. Wire `/api/retention` and `/retention` on the router, update service registry, navigation, and system health checks.
4. Existing planned panels intentionally show their data dependencies instead of fabricated results. Extend them only after coverage-qualified data is available.

Current spec: https://github.com/emissary-tools/theemissary-router/blob/main/RETENTION_PRODUCT_SPEC.md.
