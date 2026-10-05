# TRIX Phase 03 — Dealer & Distributor Backend

Date: 2026-10-04. Status: backend implemented and locally verified; authenticated MD acceptance partially verified, with remaining provider calls blocked by OpenRouter HTTP 402. Phase 04 has not started.

## Architecture and reuse

See PHASE-03-ARCHITECTURE.md for the required pre-implementation inspection. TRIX stays a read-only layer over the canonical Dealer and Distributor workspaces. No separate CRM, business tables, provider adapter, external research, mutations, charts, final UI, memory or background agents were added.

Reused dealersService.listDealers and distributorsService.listDistributors, their repositories' joins and server counts, existing domain schemas/statuses, existing assignment ledger, assertManagingDirector, getModel('trix'), existing internal route and execution logging. Other existing dealer/distributor methods, including mutations, remain outside the tool facade.

Added service/repository operations:

- Existing list methods: exact ID/code/name, city, assignment-presence/has-dealers filters, stable ordering using created_at plus ID.
- createDealerNetworkService / dealerNetworkService: read-only facade, resolveDealer, resolveDistributor, summary, history, exceptions. Exact names use trimmed case-insensitive canonical matching. Conflicting identifiers are intersected; duplicate matches return ambiguity. Searches prefer exact name matches, otherwise use existing bounded search.
- dealerNetworkRepository.summary: fixed application-owned grouping dimensions, backend counts, bounded/paginated groups with global filtered totals.
- dealerNetworkRepository.history: paginated assignment-ledger joins, dealer/distributor/date filters, newest-first stable order.
- dealerNetworkRepository.exceptions: three explicit relationship/status conditions, with pagination and exact counts.
- Dealer repository joins now return null for unresolved distributors instead of objects containing stringified null values. TRIX details fail with TRIX_RELATIONSHIP_UNAVAILABLE in this case.

## Tool contracts

All seven inputs are strict Zod objects, parsed again on direct tool calls. No user/role/auth/provider/SQL arguments are accepted. Strings are trimmed, bounded and reject control characters. All paginated inputs use the existing page/limit pattern: default page 1, limit 20, maximum limit 50. Details require an identifier; conflicting unassigned/distributor filters and invalid/reversed dates are rejected.

| Tool | Inputs | Typed response |
| --- | --- | --- |
| searchDealers | query?, dealerId?, dealerCode?, distributorId?, distributorName?, status?, city?, state?, hasDistributor?, page?, limit? | dealer_list: allowed fields, distributor identity or null, pageInfo |
| getDealerDetails | dealerId?, dealerCode?, dealerName?; at least one | dealer_detail: allowed record and stored address/timestamps |
| searchDistributors | query?, distributorId?, distributorCode?, status?, city?, state?, hasDealers?, page?, limit? | distributor_list: allowed fields, server dealerCount, pageInfo |
| getDistributorDetails | distributorId?, distributorCode?, distributorName?; at least one | distributor_detail: allowed record, count and at most 5 assigned dealers |
| getDealerNetworkSummary | dealerStatus?, distributorId?, state?, groupBy, page?, limit? | dealer_network_summary: totalDealers, totalDistributors, bounded groups, filtersApplied, pageInfo |
| getDealerAssignmentHistory | dealerId?, distributorId?, from?, to?, page?, limit? | dealer_assignment_history: real previous/new IDs and current resolvable names, changedAt, pageInfo |
| getDealerNetworkExceptions | type?, page?, limit? | dealer_network_exceptions: typed rule/severity/real dealer IDs, totalExceptions, pageInfo |

Statuses for both entities are ACTIVE, INACTIVE and SUSPENDED. groupBy is restricted to distributor, dealer_status, state and assignment_status. The summary's totalDistributors counts all distributors (or a selected ID), independently of dealer state/status filters; distributorCountScope makes this explicit. Groups are ordered by descending count, then key. Counts come from SQL in repositories, never model counting.

Contact person, phone, email, passwords, invites, notes, actor names, history reasons, revenue and performance scores are excluded from outputs. Results are validated against a strict discriminated response union. Existing Phase 01/02 response types remain supported. No model-generated HTML enters responses.

## Relationship and history semantics

dealers.distributor_id is the current nullable assignment. NULL means unassigned; a missing referenced row is an integrity issue, not an invented distributor. The real dealer_distributor_history ledger stores initial assignments and reassignments. No current-state timestamps or audit-log guesses are used as historical evidence. Missing ledger tables produce TRIX_ASSIGNMENT_HISTORY_UNAVAILABLE. An empty existing ledger returns an empty real result.

Previous/new distributor names are resolved against current records, not immutable historical name snapshots. NULL references can also result from deleted distributors because the existing ledger foreign keys use ON DELETE SET NULL. TRIX does not reconstruct those lost names or claim that current names were the names at the time of the change. Date-only filters cover the entire UTC day.

## Deterministic exceptions

| Rule | Severity | Condition |
| --- | --- | --- |
| ACTIVE_DEALER_UNASSIGNED | WARNING | Stored ACTIVE dealer has NULL distributor_id; an attention condition, not a domain violation or sales judgment |
| MISSING_DISTRIBUTOR | CRITICAL | Non-null distributor reference fails to resolve |
| ACTIVE_DEALER_NON_ACTIVE_DISTRIBUTOR | WARNING | ACTIVE dealer references an INACTIVE or SUSPENDED distributor |

No sales inactivity, arbitrary threshold, territory performance or model-assigned severity is inferred.

## Authorization, runtime and logging

The existing POST /api/v1/internal/trix verifies the real server session and MD role. Each tool invocation obtains a fresh authorized user, rejects changed identity, and independently requires ACTIVE MANAGING_DIRECTOR. Direct tool calls also enforce MD authorization before validation or domain reads. Prompt-supplied identity cannot bypass this.

MAX_TOOL_CALLS remains 2 total across all inventory/network tools, with lookupSerial still limited to 1. Normal requests stop after one model step. Named history requests may use a second model step only after one successful dealer/distributor detail resolution; a hard two-step cap and the two-call counter remain authoritative. Retries remain zero; the existing 30-second abort remains. Invalid/unsupported/excess calls are logged. Unsupported tool names are logged as 'unsupported', avoiding model-supplied text in telemetry.

Execution telemetry records authenticated user ID, hashed session association, explicit conversation ID, provider/model, timestamp, tool statuses/duration, allowed filter names and result counts/group totals. It does not persist raw prompts, query text, contact data or full business lists. Telemetry creation/update failure produces TRIX_LOGGING_FAILED and blocks unlogged execution. The API returns a sanitized 503 for logging failure. Business audit logs remain separate.

## Migration and query efficiency

0013_trix_dealer_network_logs expands the telemetry CHECK constraint and adds nullable conversation_id. PostgreSQL uses transactional ALTER statements; SQLite rebuilds only the telemetry table transactionally and preserves all old rows. The readiness path applies the forward migration once, with a migration marker. The old Phase 02 migration file is unchanged. No environment variables or business-data migrations were added.

No new indexes were added. Existing distributor/status/history indexes are available. Real Postgres EXPLAIN checks completed for all four aggregates and exception queries. With 5 dealers and 1 distributor, plans use inexpensive scans/hash aggregates/joins and existing status indexing where useful; evidence does not justify another index. No application-level N+1 relationship lookup was added. Summary groups, history, record lists and exceptions are bounded. Distributor details use one bounded dealer-preview query.

## Files created

- docs/trix/TRIX-03-DEALER-DISTRIBUTOR-BACKEND.md — supplied specification preserved in the repository.
- docs/trix/PHASE-03-ARCHITECTURE.md
- docs/trix/PHASE-03-DEALER-DISTRIBUTOR-BACKEND-REPORT.md
- packages/api/src/services/dealerNetwork.ts
- packages/database/src/repositories/dealerNetwork.ts
- packages/database/src/agentLogMigration.ts
- packages/database/migrations/0013_trix_dealer_network_logs.sql
- packages/ai/src/responses/dealer-network.ts
- packages/ai/src/tools/dealer-network.ts
- packages/ai/src/__tests__/trix-phase03.test.ts
- scripts/verify-trix-phase03.ts — sanitized engineering verification; optional --migrate is telemetry-only.
- eslint.trix.config.mjs — repository-root lint configuration reusing the portal rules for backend paths; disables only the irrelevant pages-link rule for this backend check.

## Files modified

- packages/api/src/index.ts
- packages/api/src/services/dealers.ts
- packages/api/src/services/distributors.ts
- packages/database/src/index.ts
- packages/database/src/db.ts
- packages/database/src/repositories/dealers.ts
- packages/database/src/repositories/distributors.ts
- packages/database/src/agentLogSchema.ts
- packages/database/src/repositories/agentLogs.ts
- packages/ai/src/index.ts
- packages/ai/src/responses/schema.ts
- packages/ai/src/trix-agent.ts
- packages/ai/src/provider.ts — working Sonnet 4.6 fallback after the configured Sonnet 3.5 returned HTTP 404.
- .env.example — same supported model setting; existing local TRIX_MODEL values were updated in .env, .env.local, apps/portal/.env and apps/portal/.env.local without changing credentials or adding variables.
- packages/ai/src/logging/agent-log.ts
- packages/ai/src/__tests__/trix.test.ts — updated controlled logging failure expectation; existing security checks retained.
- packages/ai/src/__tests__/trix-phase02.test.ts — external-data restriction wording accepts inventory-specific or multi-module text.
- apps/portal/src/app/api/v1/internal/trix/route.ts — request guidance and controlled logging error.

Pre-existing uncommitted workspace changes were preserved. No final TRIX renderer or UI design changes were made; the existing UI does not yet render the seven new response kinds, although it validates their shared contract and exposes activity. This is a backend phase; record/list presentation remains future renderer work.

## Verification results

- pnpm --filter @trionyx/ai test: 116/116 passed (48 existing Phase 01/02 plus 68 Phase 03).
- Existing auth/platform suite with DATABASE_URL=file::memory:: 50/50 passed. Tests used isolated fixtures, not production data.
- Changed package typechecks: database, API, AI and portal passed.
- Targeted ESLint on new backend files, shared runtime/response/logging code, API route, Phase 03 tests and verification script: passed, no warnings.
- Full workspace typecheck initially failed in pre-existing generated apps/dealer/.next/dev/types/routes.d.ts and validator.ts (malformed duplicate trailing content). Changed packages were checked separately; no unrelated source edits were made to mask this.
- Isolated fixture snapshots confirm no dealer/distributor/history mutation across all Phase 03 tests. Migration tests verify old telemetry preservation and idempotency.
- Real Postgres engineering reads: 5 dealers, 1 distributor, 0 history entries, 0 unassigned dealers, 0 deterministic exceptions, 1 active MD. All four groupings report totalDealers=5. Query plans inspected.
- Live Postgres telemetry schema verification: new response types supported; conversation_id column present.
- Local portal check: /trix redirects to /login without a session, preserving the access boundary.

## Authenticated live acceptance

The user signed in to the local MD portal. Requests were submitted through its existing TRIX UI and checked against newly persisted sanitized Postgres execution/tool events. Successful responses have null error_code:

| Request/check | Observed live result (UTC, 2026-10-04) |
| --- | --- |
| Dealer count by distributor | 07:51:30: getDealerNetworkSummary, dealer_network_summary, 1 group, 5 dealers |
| Find stored dealer by business name | 07:54:38: getDealerDetails succeeded, 1 record; the model also made an unnecessary distributor search |
| Dealer details by code | 07:54:53: getDealerDetails, dealer_detail, 1 record |
| Dealers assigned to exact distributor name | 07:55:44: searchDealers, dealer_list, 5 records |
| Dealers with no distributor | 07:56:04: model selected ACTIVE_DEALER_UNASSIGNED exceptions, 0 records; generic hasDistributor=false list remains fixture/engineering verified |
| Named dealer previous assignments | 07:57:01: getDealerDetails then getDealerAssignmentHistory, dealer_assignment_history, 0 real ledger rows |
| Assignment mutation request | 07:57:27: read-only refusal visible in UI, message response, zero tool events |
| All distributors | 07:57:49: searchDistributors, distributor_list, 1 record |
| Distributor details by code | Not accepted live: provider failures before tools; a focused sanitized provider probe returned HTTP 402 |

An initial natural-language distributor-name request failed with controlled TRIX_DISTRIBUTOR_NOT_FOUND. An explicit exact-name request succeeded. Runtime instructions now require preserving complete names, including parenthetical text, using the server's direct distributorName resolution, and avoiding speculative searches. The generic unassigned-dealer instruction also now specifies searchDealers with hasDistributor=false. All 116 tests and AI typecheck passed after this refinement. Natural-language routing after the refinement still needs live rechecking when provider access is restored.

The original configured anthropic/claude-3.5-sonnet returned HTTP 404 in a direct provider probe. OpenRouter's public model catalog listed anthropic/claude-sonnet-4.6 with tool support, and a basic request and the successful live calls above worked after changing the existing model setting/fallback. Later calls failed; the final probe returned AI_APICallError statusCode=402. No provider credits were purchased, credentials changed, retry limits expanded or provider boundary bypassed.

Current live data has no historical assignment entries, exceptions or duplicate names. Controlled ambiguity, populated history, all exception rules, unassigned lists and distributor details are covered by isolated fixtures. No business data was manufactured for acceptance. The existing UI exposes tool activity but does not render the seven new structured result kinds, so backend result/count evidence comes from validated tool execution and persisted telemetry rather than final UI cards.

Remaining live checks: distributor details, explicit generic unassigned list, dedicated full-network exceptions, natural-language name routing after instruction refinement, and real ambiguity if such data becomes available. Until these checks finish, the phase is not marked fully complete.

## Deviations and unresolved items

- TRIX-02-INVENTORY-BACKEND.md is absent; inspected the Phase 02 report, runtime and passing regression tests. Prior live acceptance is not inferred from its completion label.
- Existing pagination is page/limit, so no cursor mechanism was introduced.
- Aggregated groups and exceptions are also paginated to preserve bounded model payloads.
- History names reflect current resolvable records; deleted historical identity/name information cannot be recreated.
- Full-workspace generated-type failure and the HTTP 402 live-acceptance blocker remain as described above.
- Provider model fallback/existing settings were repaired within the existing OpenRouter adapter after the configured model returned HTTP 404; no new provider or environment variable was introduced.

STOP: no enquiries, warranty, prepared actions, charts, final UI, web tools, scheduled/background agents, sub-agents or Phase 04 work.
