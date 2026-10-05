# TRIX-05-WARRANTY-EXECUTIVE-ANALYSIS-BACKEND.md

**Product:** TRIX — Trionyx Managing Director Agent  
**Phase:** 05 — Warranty & Executive Analysis Backend  
**Status:** Implementation Specification  
**Depends on:** TRIX Phases 01–04 completed and accepted  
**Scope:** Read-only backend capability only. No final TRIX UI redesign.

---

# 1. Purpose

Phase 05 extends TRIX from individual operational modules into two read-only capabilities:

1. Warranty intelligence
2. Cross-module executive analysis

The objective is to let the Managing Director ask high-level operational questions across inventory, dealers, distributors, enquiries, and warranties while keeping every answer grounded in deterministic backend data.

TRIX remains a read-only intelligence layer over the existing Trionyx platform.

---

# 2. Locked foundations

Preserve all earlier rules:

- `MANAGING_DIRECTOR` only
- server-side authorization on every request/tool
- `getModel("trix")` provider abstraction
- OpenRouter remains temporary provider
- no arbitrary SQL
- no shell
- no browser/web search
- no arbitrary HTTP
- no business-data writes
- no model-generated HTML
- typed tools only
- existing services/repositories remain source of truth
- bounded tool execution
- no invented business metrics
- no invented thresholds
- no hidden background work

---

# 3. Phase 05 outcome

The MD should be able to ask:

- `Check warranty for serial TRX-8392.`
- `Show active warranties registered this month.`
- `Show warranties by dealer.`
- `Which warranties were voided recently?`
- `How many warranties were registered this week?`
- `What needs my attention today?`
- `What changed today across Trionyx?`
- `Give me today's operational summary.`
- `Show inventory, enquiries and warranty activity for the last 7 days.`
- `Which dealers have open enquiries and recent warranty activity?`

Answers must come from real current data.

---

# 4. Scope

## Included

- warranty lookup by serial
- warranty search/filtering
- warranty detail
- warranty summaries
- warranty grouping by real status/dealer/product/date
- recent warranty events where real history exists
- deterministic warranty exceptions
- executive operational summary
- cross-module deterministic summaries
- "what changed" queries
- "what needs attention" queries using approved deterministic rules
- typed outputs
- logging
- tests
- live acceptance

## Excluded

- warranty creation
- warranty approval
- warranty void
- claims processing
- write actions
- lead scoring
- revenue estimation
- profitability inference
- AI-generated risk scoring
- predictive forecasting
- web research
- final TRIX UI
- prepared actions
- autonomous execution
- background monitoring

---

# 5. Pre-implementation inspection

Inspect and report:

1. canonical warranty service
2. warranty repository
3. warranty policy model
4. warranty statuses
5. warranty registration fields
6. warranty-dealer relationship
7. warranty-product/serial relationship
8. warranty date fields
9. void/history/audit support
10. existing overview service
11. inventory summary services
12. enquiry summary services
13. dealer network summary services
14. existing TRIX tool schemas
15. actual data available for cross-module analysis

Do not create synthetic data joins that the domain does not support.

---

# 6. Recommended tools

Add only:

1. `getWarrantyBySerial`
2. `searchWarranties`
3. `getWarrantySummary`
4. `getWarrantyExceptions`
5. `getExecutiveOverview`
6. `getRecentOperationalChanges`

Reuse earlier tools where possible.

---

# 7. getWarrantyBySerial

Purpose: retrieve the warranty associated with a real serial number.

Input:

```ts
{
  serialNumber: string
}
```

Output should contain only real fields, for example:

```ts
{
  warrantyId,
  serialNumber,
  productName,
  status,
  dealerName?,
  startDate?,
  expiryDate?,
  registeredAt?,
  voidedAt?
}
```

Do not invent coverage, duration, eligibility, or expiry when not stored.

If no warranty exists, return a typed not-found result.

---

# 8. searchWarranties

Support typed filters only where real domain fields exist:

```ts
{
  warrantyId?: string
  serialNumber?: string
  dealerId?: string
  dealerName?: string
  productId?: string
  productName?: string
  status?: RealWarrantyStatus
  registeredFrom?: string
  registeredTo?: string
  limit?: number
  cursor?: string
}
```

Rules:

- bounded results
- canonical status enum
- real dealer/product resolution
- ambiguity returns clarification
- no arbitrary sorting expressions
- no model-provided auth identity

---

# 9. getWarrantySummary

Server-side aggregates only.

Supported grouping should be limited to real dimensions such as:

```ts
groupBy:
  | "status"
  | "dealer"
  | "product"
  | "registration_period"
```

Do not send thousands of warranties to the model for counting.

---

# 10. getWarrantyExceptions

This tool returns deterministic conditions only.

Examples, only if supported by real schema/domain rules:

- warranty references a missing serial
- warranty references an inactive/missing dealer
- duplicate active warranty relationship where domain forbids it
- expiry date earlier than start date
- policy relationship missing where required
- invalid status transition visible in persisted records

Do not invent fraud likelihood, risk score, or dealer quality judgments.

---

# 11. getExecutiveOverview

Purpose: provide a compact MD-level snapshot across existing modules.

Possible sections, only if data exists:

```ts
{
  inventory: {
    availableSerials,
    totalSerials,
    exceptions
  },
  dealers: {
    activeDealers,
    unassignedDealers,
    exceptions
  },
  enquiries: {
    new,
    inProgress,
    unassigned,
    attentionCount
  },
  warranties: {
    active,
    registeredToday,
    voidedRecently,
    exceptions
  },
  generatedAt
}
```

Do not add revenue, sales, margin, forecast, or conversion metrics unless those are real platform data.

---

# 12. getRecentOperationalChanges

Purpose: answer:

- `What changed today?`
- `What happened this week?`
- `Show recent operational activity.`

Use real audit/history/event sources only.

Potential sources:

- serial movements
- dealer assignment/status history
- enquiry status/assignment history
- warranty registration/void history
- business audit log

Return normalized safe event records.

Do not infer history from current state when no history exists.

---

# 13. What-needs-attention behavior

This is a deterministic aggregation of existing exception tools.

It is NOT freeform AI judgment.

The backend may combine:

- inventory exceptions
- dealer network exceptions
- enquiry attention rules
- warranty exceptions

The model may summarize but cannot create new reasons.

---

# 14. Cross-module correlation

Allow cross-module relationships only through real identifiers.

Examples:

- warranty → serial → product
- warranty → dealer
- dealer → distributor
- enquiry → owner
- serial → inventory location

Do not perform fuzzy joins on names when IDs exist.

If two modules have no reliable relationship, state that the system cannot correlate them safely.

---

# 15. Authorization

Every new tool revalidates MD access.

No trusted identity fields come from the model.

No warranty data is exposed through public tools.

---

# 16. Read-only enforcement

No Phase 05 tool may:

- register warranty
- approve warranty
- void warranty
- change warranty policy
- edit serial
- reassign dealer
- change enquiry
- perform any mutation

---

# 17. Logging

Log execution ID, conversation ID, MD user ID, provider/model, tool, duration, status, sanitized filters, result counts, and controlled error code.

Do not store full warranty/customer payloads unless necessary.

Never log secrets.

---

# 18. Required tests

Test:

- valid warranty lookup
- no warranty for serial
- invalid serial
- warranty status filter
- dealer/product filter
- date filter
- pagination
- warranty summary counts
- warranty deterministic exceptions
- executive overview exact fixture counts
- operational change ordering
- unsupported cross-module correlation
- non-MD denied
- inactive MD denied
- prompt injection blocked
- no mutation tool exists
- logging created
- secret exclusion

---

# 19. Live acceptance

Verify with real MD session:

1. `Check warranty for <real serial>.`
2. `Show warranties registered this month.`
3. `Show warranty count by dealer.`
4. `What needs my attention today?`
5. `What changed today across Trionyx?`
6. `Void this warranty.` → must not execute.

---

# 20. Completion criteria

Phase 05 is complete only when:

- Phases 01–04 still pass
- warranty reads use real domain logic
- executive overview is server-computed
- attention results are deterministic
- operational changes come from real event/history sources
- no mutation tools exist
- authorization/logging remain intact
- tests/typecheck/lint pass
- live MD checks pass
- implementation record is appended to this canonical file
- Phase 06 has NOT started

---

# 21. Agent execution order

```text
1. Read TRIX-01 through TRIX-05
2. Inspect warranty + overview/history architecture
3. Give short architecture report
4. Implement Phase 05 only
5. Add tests
6. Run tests/typecheck/lint
7. Perform available live/local verification
8. Append implementation record to this file
9. STOP
```

**Phase 05 ends at reliable read-only warranty and executive operational intelligence.**


---

# 22. Implementation record - 2026-10-04

**Backend implemented; final live acceptance remains blocked by the configured provider allowance. Phase 06 has not started.** Earlier phase regressions pass; prior Phase 03/04 live limitations are not retroactively accepted. Original Phase 02 specification is absent; its report/runtime/tests were inspected.

Inspection: `PHASE-05-ARCHITECTURE.md`. Added exactly six tools: getWarrantyBySerial, searchWarranties, getWarrantySummary, getWarrantyExceptions, getExecutiveOverview, getRecentOperationalChanges. The API read facade delegates to fixed repository queries. No activation/void/public warranty functions, self-healing policy lookup, model SQL, raw audit metadata, actors, notes or customer fields are exposed.

Warranty reads project stored identity/product/dealer/date fields. ACTIVE/VOID are stored; EXPIRED derives after the inclusive UTC end date. Missing warranty returns TRIX_WARRANTY_NOT_FOUND. Exact dealer/product name or ID resolution fails safely for ambiguity/conflicting identity. Supported typed filters: warranty ID, normalized serial, dealer/product, status and registration dates/periods. Database counts group by status/dealer/product/UTC registration month. Page/limit caps at 50 with stable timestamp/ID ordering. Relative today/week/month/last-seven-day windows use server Asia/Kolkata calendar and Monday week; explicit date-only bounds use UTC. PostgreSQL timestamps preserve milliseconds.

Persisted integrity rules: missing serial/product/dealer, non-active dealer, duplicate stored ACTIVE serial relationship, end before start, VOID without void timestamp, ACTIVE with void timestamp. Non-active dealer is a relationship condition, not invalid coverage. Current policy state cannot prove historical eligibility: no immutable policy/version link exists. Production unique serial relationship prevents duplicates; corruption rules use isolated fixtures only.

Executive counts reuse inventory status, dealer network summaries/exceptions and enquiry summaries/attention. Bounded inventory attention shares exact SQL sources with the canonical inventory exception reader. Each module has exact condition-instance totals and at most five previews. Current counts come from separate reads, not an atomic historical snapshot. Activity has an explicit window and at most five preview events. No invented revenue, sales, forecast, risk or urgency metrics.

Operational history uses primary serial movements/dealer assignment ledgers and an explicit warranty/enquiry/dealer/distributor audit allowlist. Ledger events are not duplicated from audit. Global UNION count/order/page occurs before results reach the model. Safe output: source-prefixed ID, module, record ID, event enum, ISO timestamp. Malformed selected metadata or missing real event identity fails closed; no reconstruction from updatedAt. Recent void queries read real events instead of registration-date filters.

Enquiries lack dealer_id. Dealer/open-enquiry/warranty correlation returns TRIX_CORRELATION_UNSUPPORTED before the model. Void/approve/register/policy-change requests are refused before the model. Every tool checks active MD authorization with fresh runtime session and same user. Strict schemas, getModel("trix") boundary, two total calls, zero retries, 30-second timeout and typed results remain intact. Model-authored HTML/prose/extra metrics cannot enter results.


## Verification

- 264/264 TRIX tests pass: all prior phases plus 75 Phase 05 checks for lookup/filter/date/page/count/integrity/history, malformed data, auth revocation/identity change, read-only snapshots, injection, logging, secret exclusion and migration preservation.
- 50/50 auth/platform regressions pass on explicitly isolated in-memory databases. An earlier run passed against default local SQLite fallback; final evidence uses explicit isolation. Tests did not populate configured PostgreSQL business tables.
- Targeted database/API/AI/portal typechecks and Phase 05 lint: final command results appended below. Broad workspace checks retain the previously observed malformed dealer-generated .next type files, outside this phase.
- Sanitized PostgreSQL evidence/query plans: phase05-postgres-verification.log, generated by scripts/verify-trix-phase05.ts. Current data: 1 available serial of 1, 5 active dealers of 5, 1 distributor, 1 NEW assigned enquiry, 1 ACTIVE warranty, 0 registrations today, 2 inventory attention conditions, no dealer/enquiry/warranty conditions, 0 events today, 7 events in last seven days. These are real counts, not fixtures.

## Authenticated live acceptance

Existing MD session at localhost:3002/trix used.

| Check | Result |
| --- | --- |
| Warranty for real serial TRX-CQ-2609-000001 | Blocked: PROVIDER_LIMIT_REACHED, zero tools |
| Warranties registered this month | Pending provider restoration; local/repository tests pass |
| Warranty count by dealer | Pending provider restoration; local/repository tests pass |
| Attention today | Blocked: PROVIDER_LIMIT_REACHED, zero tools |
| Changes today across Trionyx | Pending provider restoration; local/repository tests pass |
| Void this warranty | Passed: read-only refusal, zero tools |
| Dealer/open-enquiry/recent-warranty correlation | Passed: unsupported relationship, zero tools |

Evidence: phase05-live-refusal.jpg. Restore configured OpenRouter credit/token allowance before completing the five model-backed checks. No provider/model replacement, purchase, final UI redesign or Phase 06 work performed. Backend implementation does not imply final phase acceptance while the external dependency remains blocked.

Final command results: targeted database/API/AI/portal typecheck passed; lint passed with no diagnostics; final PostgreSQL read verification and EXPLAIN passed, with Phase 05 telemetry support confirmed. Total verified tests: 314/314 (264 TRIX + 50 isolated auth/platform).
