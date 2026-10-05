# TRIX Phase 04 — Enquiries Backend

Date: 2026-10-04. Status: backend implemented; automated/engineering verification complete, authenticated model acceptance partial and blocked by OpenRouter HTTP 402. Phase 05 has not started. No business data was changed.

## Architecture and domain reuse

Pre-implementation findings are recorded in PHASE-04-ARCHITECTURE.md. Reused contactEnquiriesRepository.list, joined user/product relationships, existing contactEnquiriesService reads, canonical ContactEnquiry types, audit event semantics, MD guards, getModel('trix'), internal versioned route, response validation and execution telemetry. Existing create/update/assign/note methods never enter TRIX's tool facade.

Extended the existing page/limit list filters through shared enquiryWhere: ID/code, city, pincode, assignment presence and created date/cutoff. Existing type/status/state/search/assignedTo semantics remain. Lists now have deterministic created_at DESC plus ID ordering. Dates map PostgreSQL Date and SQLite text to ISO, preserving milliseconds.

Added enquiryReadsRepository.owners (bounded exact internal user lookup), summary (server counts and paginated groups), attention (server conditions/counts), changes (bounded audit projection). Added createEnquiryIntelligenceService/enquiryIntelligenceService facade for controlled owner/detail resolution and history failure handling. SQL is repository-owned and parameterized; grouping expressions and audit paths are fixed application constants.

Canonical types: PRODUCT_ENQUIRY, DEALER_ENQUIRY, DISTRIBUTION_ENQUIRY, PRODUCT_SUPPORT, GENERAL_ENQUIRY. Current canonical statuses: NEW, IN_PROGRESS, CLOSED. Stored unique codes are TRX-ENQ-six-digit values, with UUID IDs; ENQ-1048 is not invented or expanded. Conflicting ID/code identifiers must intersect and otherwise return not found.

The PostgreSQL schema's legacy constraint permits REVIEWED/RESPONDED as well. No such rows were observed in current live data. TRIX does not add these to current business semantics: unsupported stored statuses/history fail controlled validation, without renaming them. A future domain migration for legacy records would need separate review.

## Tools and contracts

Inputs are strict Zod objects, parsed again on direct invocation. Strings are trimmed, bounded and reject controls. Pagination defaults to page 1/limit 20, maximum limit 50 and page 100000. No model-supplied role/session/user identity, SQL, sorting expression or external URL argument exists. Owner IDs are domain filters, never authenticated identity.

| Tool | Accepted inputs | Response |
| --- | --- | --- |
| searchEnquiries | query?, enquiryId?, enquiryCode?, type?, status?, ownerId?, ownerName?, hasOwner?, city?, state?, pincode?, createdFrom?, createdTo?, createdPeriod=today?, olderThanHours?, page?, limit? | enquiry_list; allowed records, calculated age, asOf, pageInfo |
| getEnquiryDetails | enquiryId?, enquiryCode?; at least one | enquiry_detail; allowed record, real phone/email, bounded message, messageTruncated, asOf |
| getEnquirySummary | same operational filters without query/record identifiers; groupBy=status/type/assignment_status/state, page?, limit? | enquiry_summary; exact global filtered total, bounded groups, filtersApplied, asOf and group pagination |
| getEnquiryAttention | rule=NEW_UNASSIGNED/MISSING_OWNER?, page?, limit? | enquiry_attention; real IDs/codes, deterministic rule/severity, age, asOf and pagination |
| getRecentEnquiryChanges | enquiryId?, changeType=CREATED/STATUS_CHANGED/ASSIGNED/NOTE_ADDED?, from?, to?, period=today?, page?, limit? | enquiry_changes; real audit events, previous/new safe values, occurrence time and pagination |

Response schemas form a strict discriminated union appended to all earlier Phase 01–03 kinds. Lists/groups/events are capped at 50. List fields omit phone/email/message; details expose those existing MD-visible contact fields only, cap message at 4000 characters and explicitly flag truncation. Field lengths are bounded. No notes bodies, actor contact data, IP/user agent, unrelated audit metadata, credentials, hot-lead classifications, conversion predictions, revenue or AI scores are exposed. Model prose/HTML cannot replace validated server results. The final renderer is unchanged; new response kinds are backend contracts, with activity visible in the existing UI.

## Dates, age, ownership and history

Age is max(0, floor((trusted server now - createdAt)/60000)); it measures time since creation, not time in current status. olderThanHours uses a strict createdAt cutoff on the server, accepts 0–87600 hours and does not imply urgency. Each list/detail/summary/attention response carries asOf.

Explicit date-only ranges cover complete UTC days; UTC timestamps are normalized. Invalid dates/reversed ranges/conflicting filters are rejected. Today is resolved in the server helper using Asia/Kolkata midnight boundaries, including the previous UTC date at 18:30. The model receives current server UTC time for relative-date interpretation, not live enquiry records in the system prompt.

assigned_to NULL means unassigned. A non-null unresolved owner is an integrity condition, never silently treated as unassigned. Natural-language owners use exact trimmed case-insensitive names among real MD/ADMIN/STAFF users; inactive existing users can still be resolved for historical/current assignment filters. Duplicate names produce TRIX_OWNER_AMBIGUOUS and require an ID. Unknown/non-internal owners return TRIX_OWNER_NOT_FOUND. Combined name/ID must match the same record.

Audit logs are the source of lifecycle changes. Creation, status, assignment and note-addition events are supported. Only previous/new status or owner IDs are exposed; creation/note events carry null previous/new values. Notes bodies and actor identifiers are unnecessary and excluded. Names are not reconstructed historically. Existing enquiry identities/codes are joined; deleted enquiries are omitted. Current updatedAt is never converted into an invented event. Empty real audit results are valid; unavailable/malformed audit reads return TRIX_ENQUIRY_HISTORY_UNAVAILABLE. The existing business services write audit events separately, so this read is evidence of recorded events, not a guarantee of a transactional/exhaustive lifecycle ledger.

## Deterministic attention

| Rule | Severity | Stored condition |
| --- | --- | --- |
| NEW_UNASSIGNED | WARNING | status=NEW and assigned_to IS NULL |
| MISSING_OWNER | CRITICAL | assigned_to is non-null and does not resolve to a user |

WARNING identifies an objective attention state, not sales quality or urgency. CRITICAL identifies broken workflow identity. No approved ageing SLA exists, so no 24/48-hour urgency threshold or IN_PROGRESS ageing rule was introduced. A user-requested older-than filter remains available.

## Authorization, limits, refusals and logging

POST /api/v1/internal/trix continues to verify the real MD session and same-origin request. Each tool independently enforces ACTIVE MANAGING_DIRECTOR; the runtime obtains fresh session authorization per call and rejects changed identity before domain reads. Portal visibility or cookie presence is never authorization. Existing enquiry workspace permissions remain unchanged and are broader than TRIX.

MAX_TOOL_CALLS remains 2 total across all inventory/network/enquiry tools; lookupSerial remains limited to 1. Normal requests use one model step, allowing at most two calls from that step; earlier named dealer history retains its tightly gated second step. Owner/code resolution happens in the server facade without a model loop. Zero retries and the existing 30-second timeout remain. No third call was justified. Excess/unsupported/invalid calls are logged.

Mutations including assignment, status marking/closure and email actions are refused; no write/email/web/SQL/shell tools exist. Enquiry SQL execution requests are explicitly refused while the earlier safe serial-lookup behavior remains supported. Hot-lead/scoring/conversion and secret requests return an explicit unsupported explanation without model/tool calls. Stored enquiry messages are treated as untrusted data.

Sanitized telemetry retains execution/conversation association, authenticated MD ID, hashed session, provider/model/time, tool status/duration, filter names, counts/group dimensions and controlled errors. No raw query/owner name, message, contact values, raw session or system prompt is logged. Logging failure remains TRIX_LOGGING_FAILED and blocks unlogged execution. Business audit logs remain separate.

## Migration and efficiency

0014_trix_enquiry_logs extends only the execution response CHECK constraint. PostgreSQL uses transactional ALTER/RLS/marker operations; SQLite transactionally rebuilds only telemetry and preserves old rows. The readiness path invokes this forward migration after Phase 03. Prior migration files were unchanged. The live PostgreSQL migration was explicitly applied through the verification script; enquiry_summary support was verified. No business-table migration, analytics datastore, new index, environment variable or provider change was added.

Real PostgreSQL EXPLAIN inspected the four aggregates, createdAt cutoff search, unassigned search, attention and audit history. Current population is one enquiry and two audit events; inexpensive scans/aggregates and existing createdAt/user/product/audit-event indexes are used. No evidence justifies another index at this size; larger populations should be re-profiled. Owner joins avoid application N+1 reads. Lists, previews, groups and events are bounded.

## Files created

- docs/trix/TRIX-04-ENQUIRIES-BACKEND.md (supplied specification)
- docs/trix/PHASE-04-ARCHITECTURE.md
- docs/trix/PHASE-04-ENQUIRIES-BACKEND-REPORT.md
- packages/database/src/repositories/enquiryReads.ts
- packages/database/migrations/0014_trix_enquiry_logs.sql
- packages/api/src/services/enquiryIntelligence.ts
- packages/ai/src/responses/enquiries.ts
- packages/ai/src/tools/enquiries.ts
- packages/ai/src/__tests__/trix-phase04.test.ts
- scripts/verify-trix-phase04.ts

## Files modified

- packages/database/src/repositories/contactEnquiries.ts
- packages/database/src/repositories/agentLogs.ts
- packages/database/src/agentLogSchema.ts
- packages/database/src/agentLogMigration.ts
- packages/database/src/db.ts
- packages/database/src/index.ts
- packages/api/src/services/contactEnquiries.ts
- packages/api/src/index.ts
- packages/ai/src/responses/schema.ts
- packages/ai/src/trix-agent.ts
- packages/ai/src/index.ts
- apps/portal/src/app/api/v1/internal/trix/route.ts (input guidance only)

Pre-existing uncommitted changes were preserved; no commits/merges or unrelated design changes were made.

## Verification

- Full Phase 01–04 AI test suite: 186/186 passed (116 earlier tests plus 70 Phase 04 tests). Covers all new tools, filters/date/age/pagination, exact counts, both attention rules, real history and unavailable capability, canonical validation, owner ambiguity, missing/conflicting enquiry identity, all tools' MD checks, revoked auth, runtime contracts/telemetry, refusals, old-log-preserving migration, output bounds and timestamp precision. Business snapshots prove no enquiry/audit/note mutation.
- Auth/platform suite: 50/50 passed using DATABASE_URL=file::memory:.
- Changed database/API/AI/portal typechecks passed again after final changes.
- Targeted lint passed without warnings after final changes; git diff --check passed.
- Full workspace pnpm typecheck failed in pre-existing malformed apps/dealer/.next/dev/types/routes.d.ts and validator.ts, as in Phase 03. Changed packages were checked separately; no unrelated generated files were edited.
- Live engineering data: 1 PRODUCT_ENQUIRY with NEW status; all four groupings total=1; olderThan24Hours=1; unassigned dealer enquiries=0; attention=0; real audit events=2. Stored timestamp mapping validated; plans inspected. These reads do not substitute for authenticated model/tool acceptance.

## Live acceptance and remaining work

Authenticated existing MD session was used in the portal:

| Scenario | Result |
| --- | --- |
| A: today's new enquiries | Attempted 08:16:19 UTC; sanitized PROVIDER_ERROR, zero tool events; not accepted |
| F: Assign ENQ-1048 to Ravi | 08:17:22 UTC; read-only refusal visible, message response, zero tool events, persisted telemetry; passed |
| G: hot leads | 08:18:19 UTC; explicit absence of verified classification/scoring visible, message response, zero tool events, persisted telemetry; passed |

The provider probe with maxOutputTokens=1024 still returned AI_APICallError HTTP 402. No credits were bought or credentials/provider settings changed. Repeated blocked model calls were stopped. Scenario A must be retried, and B–E plus model-selected detail/attention/history and newly persisted successful enquiry tool events remain to be accepted after provider access is restored. Automated fixtures and direct PostgreSQL reads verify these backend operations, but live natural-language selection is not claimed.

The original TRIX-02-INVENTORY-BACKEND.md is absent; the Phase 02 report/runtime/tests were read. Phase 03 live acceptance was partial before this request and remains so. User explicitly requested Phase 04 implementation; earlier phases are not retrospectively marked accepted. Existing page/limit pagination was reused rather than introducing cursors. Summary groups are paginated. Detail notes/history previews were omitted for minimization; the dedicated bounded changes tool exposes supported history.

Phase 04 is not marked fully complete until the blocked live checks and full-workspace typecheck limitation are resolved. STOP: no Phase 05, warranty, cross-module executive analysis, prepared actions, final UI, charts, web tools, subagents, memory or background work.
