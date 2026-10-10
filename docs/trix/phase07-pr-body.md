TRIX gives Managing Directors grounded operational answers across inventory, dealer/distributor relationships, enquiries, warranties, and executive analysis. Four preparation tools create pending workflow previews; business changes require explicit application confirmation and authorization checks at execution.

This PR adds the portal conversation and action UI, server-only model adapter, typed tool registry, repository/service integrations, transaction-backed workflows, migrations 0012–0018, and phase specifications/handover documentation. Readiness hardening includes shared database rate limits, bounded request bodies and outputs, safe numeric telemetry, session revocation/role-change tests, verified PostgreSQL TLS, and the Next.js 16.3.6 security update. The existing product-specification schema compatibility fix is included because the platform SQLite regression suite requires it.

Validation:

- 361 TRIX tests and 54 platform tests pass against the staged source (415 total), including 47 Phase 07 evaluations.
- Changed-package typechecks, targeted lint, and portal production build passed.
- Production dependency audit reports zero known advisories.
- Synthetic fixture benchmarks and read-only PostgreSQL readiness checks are documented in docs/trix/TRIX-07-EVALS-SECURITY-PRODUCTION-READINESS.md.

Production acceptance remains on HOLD. The authenticated live portal returns PROVIDER_LIMIT_REACHED; successful live model-selection evaluation, the remaining Phases 03–06 MD acceptance/confirmation checks, and deployed HTTPS/origin/cookie verification remain pending. The approved gate is 100% authorization, grounding, and action-safety cases plus at least 95% tool-selection cases. Controlled model fixtures do not establish live provider acceptance. No deployment or merge is requested by this draft.

Unrelated local warranty-policy migration, UI edits, user guides, screenshots, and raw execution logs are excluded.
