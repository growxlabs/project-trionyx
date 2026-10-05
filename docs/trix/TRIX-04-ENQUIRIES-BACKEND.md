# TRIX-04-ENQUIRIES-BACKEND.md

**Product:** TRIX — Trionyx Managing Director Agent  
**Phase:** 04 — Enquiries Backend  
**Status:** Implementation Specification  
**Audience:** Codex, Antigravity, GrowxLabs engineers  
**Depends on:**  
- `/docs/trix/TRIX-01-FOUNDATION.md`
- `/docs/trix/TRIX-02-INVENTORY-BACKEND.md`
- `/docs/trix/TRIX-03-DEALER-DISTRIBUTOR-BACKEND.md`
- Completed and accepted TRIX Phases 01–03

**Scope:** Backend capability only. No final TRIX UI redesign in this phase.

---

# 1. Purpose

TRIX Phase 04 extends the Managing Director agent into **enquiry intelligence**.

The MD should be able to understand what enquiries exist, which ones need attention, how old they are, who owns them, where they came from, and what their current status is — without manually scanning the entire Enquiries workspace.

TRIX remains a read-only command/query layer over the existing Trionyx enquiry system.

It must NOT become a CRM replacement in this phase.

Phase 04 remains:

- Managing Director only
- internal Trionyx data only
- read-only
- server-authorized
- tool-driven
- fully logged
- grounded in real enquiry records
- provider-independent
- independent of final TRIX visual design

---

# 2. Locked foundations

Do not regress any earlier TRIX decisions.

The following remain locked:

- TRIX access only for `MANAGING_DIRECTOR`
- server-side authorization is mandatory
- middleware cookie presence is not authorization
- `getModel("trix")` remains the provider boundary
- OpenRouter is the current provider
- Growx AI Gateway may replace the provider later without rewriting TRIX
- no arbitrary SQL
- no shell
- no arbitrary URLs
- no generic HTTP tool
- no web search
- no model-generated HTML
- no business-data mutations
- no model access to database credentials
- no model-supplied role/user identity
- typed tools only
- tools reuse domain/service/repository logic
- all executions logged using sanitized telemetry
- business audit logs remain separate from agent execution logs
- Phase 01 serial lookup remains supported
- Phase 02 inventory tools remain supported
- Phase 03 dealer/distributor tools remain supported

---

# 3. Existing enquiry domain assumptions to verify

Before implementation, inspect the repository and confirm the current real enquiry domain.

Expected current enquiry concepts include:

- public contact/enquiry submissions
- enquiry types such as:
  - `PRODUCT_ENQUIRY`
  - `DEALER_ENQUIRY`
  - `DISTRIBUTION_ENQUIRY`
  - `PRODUCT_SUPPORT`
  - `GENERAL_ENQUIRY`
- statuses such as:
  - `NEW`
  - `IN_PROGRESS`
  - `CLOSED`
- assignment/owner support if implemented
- notes/history if implemented
- source/contact fields from the public form
- location fields such as city/state/pincode where stored

Do not assume these values if implementation differs.

Use the actual canonical enums and fields from the current codebase.

---

# 4. Phase 04 outcome

At the end of this phase, the Managing Director should be able to ask questions such as:

- `Show today's new enquiries.`
- `Which enquiries are unassigned?`
- `Show dealer enquiries from Telangana.`
- `Show enquiries older than 24 hours.`
- `Show open enquiries by type.`
- `How many enquiries are new vs in progress?`
- `Show enquiries assigned to X.`
- `Open enquiry ENQ-1048.`
- `Which enquiries need attention?`
- `Show product enquiries from Hyderabad.`
- `What changed in enquiries today?`
- `Show closed enquiries from the last 7 days.`

TRIX must answer only from real Trionyx enquiry data.

If the current database cannot support a requested interpretation, TRIX must say so instead of inventing data.

---

# 5. Scope

## Included

- enquiry search
- enquiry detail lookup
- enquiry filtering
- enquiry counts
- grouping by real status
- grouping by real enquiry type
- grouping by assignment state
- grouping by real location fields
- age/ageing calculations
- unassigned enquiry queries
- recent enquiry changes where real history exists
- deterministic attention/exception queries
- typed tool inputs/outputs
- runtime registration
- MD authorization
- sanitized execution logging
- automated tests
- live acceptance checks

## Excluded

Do not build:

- enquiry creation from TRIX
- enquiry editing
- status updates
- assignment changes
- note creation
- email sending
- WhatsApp actions
- phone actions
- CRM pipeline
- lead scoring
- AI-generated sales score
- conversion prediction
- automatic follow-up
- dealer creation from enquiry
- distributor creation from enquiry
- warranty actions
- order actions
- final TRIX UI
- charts
- web search
- browser access
- generic external APIs
- arbitrary SQL
- shell
- sub-agents
- background agents
- scheduled actions
- autonomous follow-up
- memory/RAG unless already required by existing domain logic

Phase 04 is strictly **read-only enquiry intelligence**.

---

# 6. Required pre-implementation inspection

Before writing code, inspect and report:

1. existing enquiry service methods
2. enquiry repository methods
3. canonical enquiry type enum
4. canonical enquiry status enum
5. assignment/owner fields
6. note/history model if present
7. created/updated timestamps
8. contact and location fields
9. pagination/filter patterns
10. whether enquiry code/ID exists
11. how "unassigned" is represented
12. whether assignment history exists
13. whether status history exists
14. existing API response envelopes
15. existing audit/history support
16. Phase 01–03 TRIX runtime/tool/logging patterns
17. current role restrictions on enquiry data

Do not duplicate business logic.

If a read operation does not exist, add it to the domain/service/repository layer first.

Do not put raw database query logic directly inside the LLM tool definition.

---

# 7. Architecture

The intended flow remains:

```text
Managing Director
        ↓
TRIX runtime
        ↓
approved typed enquiry tool
        ↓
existing Trionyx enquiry service/domain layer
        ↓
repository
        ↓
Postgres / Supabase
        ↓
validated typed result
        ↓
TRIX runtime
        ↓
structured response data
```

The model may:

- understand the MD's question
- select an approved tool
- provide validated filters
- summarize validated results

The model may NOT:

- authorize itself
- generate SQL
- invent enquiries
- invent owners
- invent statuses
- invent follow-ups
- mutate records
- send messages
- create notes
- infer conversion without data
- bypass domain rules

---

# 8. Tool strategy

Recommended Phase 04 tools:

1. `searchEnquiries`
2. `getEnquiryDetails`
3. `getEnquirySummary`
4. `getEnquiryAttention`
5. `getRecentEnquiryChanges`

Do not create redundant tools if one typed tool can safely cover the need.

Keep Phase 01–03 tools unchanged.

---

# 9. Tool: searchEnquiries

## Purpose

Search and filter real enquiry records.

## Example requests

- `Show new enquiries.`
- `Show dealer enquiries from Telangana.`
- `Show enquiries assigned to Ravi.`
- `Show unassigned enquiries.`
- `Show enquiries older than 24 hours.`

## Input

Conceptually:

```ts
{
  query?: string
  enquiryId?: string
  enquiryCode?: string
  type?: RealEnquiryType
  status?: RealEnquiryStatus
  ownerId?: string
  ownerName?: string
  hasOwner?: boolean
  city?: string
  state?: string
  pincode?: string
  createdFrom?: string
  createdTo?: string
  olderThanHours?: number
  limit?: number
  cursor?: string
}
```

Use actual project naming and types.

### Rules

- validate every field
- cap `limit`
- use project-standard pagination
- statuses/types must use canonical domain values
- validate date ranges
- cap `olderThanHours`
- do not accept raw SQL
- do not accept arbitrary sort expressions
- do not accept user/role identity from model arguments
- owner resolution must use real internal users if supported

## Output

Return only real useful fields, for example:

```ts
{
  items: [
    {
      id,
      enquiryCode,
      type,
      status,
      fullName,
      businessName?,
      city?,
      state?,
      owner: {
        id,
        displayName
      } | null,
      createdAt,
      updatedAt,
      ageMinutes
    }
  ],
  pageInfo: {
    hasMore,
    nextCursor?
  }
}
```

Use real fields only.

Do not invent:

- lead score
- conversion probability
- expected revenue
- priority
- sentiment
- deal value
- next action
- customer segment

unless such data genuinely exists and is explicitly approved.

---

# 10. Tool: getEnquiryDetails

## Purpose

Return one real enquiry with its available operational context.

## Example requests

- `Open ENQ-1048.`
- `Show details for this dealer enquiry.`
- `Who owns this enquiry?`

## Input

Conceptually:

```ts
{
  enquiryId?: string
  enquiryCode?: string
}
```

## Output

Only real fields, such as:

```ts
{
  id,
  enquiryCode,
  type,
  status,
  fullName,
  phone?,
  email?,
  businessName?,
  city?,
  state?,
  pincode?,
  message?,
  owner: {
    id,
    displayName
  } | null,
  createdAt,
  updatedAt,
  notesPreview?,
  historyPreview?
}
```

Only include notes/history if the current domain safely exposes them.

Do not expose secrets or unnecessary personal data.

Since TRIX is MD-only, existing MD-visible fields may be returned, but data minimization still applies.

---

# 11. Tool: getEnquirySummary

## Purpose

Answer aggregate enquiry questions without passing large row sets to the model.

## Example requests

- `How many new enquiries do we have?`
- `Show enquiry count by type.`
- `Show new vs in-progress.`
- `How many dealer enquiries came in this week?`
- `Show enquiry count by state.`
- `How many are unassigned?`

## Input

Conceptually:

```ts
{
  type?: RealEnquiryType
  status?: RealEnquiryStatus
  ownerId?: string
  hasOwner?: boolean
  state?: string
  createdFrom?: string
  createdTo?: string
  groupBy:
    | "status"
    | "type"
    | "assignment_status"
    | "state"
}
```

Only support grouping dimensions backed by real stored fields.

Do not create a generic analytics language.

## Output

Conceptually:

```ts
{
  total: number,
  groups: [
    {
      key: string,
      label: string,
      count: number
    }
  ],
  filtersApplied: {
    ...
  }
}
```

All counts must be calculated server-side.

The model must not count raw rows itself.

---

# 12. Tool: getEnquiryAttention

## Purpose

Return enquiries requiring MD attention using deterministic backend rules.

This is NOT AI judgment.

## Valid rule types

Only implement rules supported by real data and approved semantics.

Examples:

- enquiry is `NEW` and unassigned
- enquiry remains `NEW` longer than a defined configured threshold
- enquiry remains `IN_PROGRESS` longer than a defined configured threshold
- owner reference is invalid
- enquiry has a data integrity issue required for workflow

## Critical rule

Do not invent ageing thresholds.

If Trionyx does not already have approved thresholds:

- either use only objective states such as "NEW and unassigned"
- or introduce thresholds only after explicit approval/configuration

Do not silently define:

- 24 hours = urgent
- 48 hours = critical
- high priority
- hot lead

unless business rules explicitly define them.

## Output

Conceptually:

```ts
{
  items: [
    {
      type,
      severity,
      label,
      description,
      enquiryId,
      enquiryCode,
      ageMinutes?,
      ownerId?
    }
  ]
}
```

Severity must be deterministic and documented.

The model does not choose severity.

---

# 13. Tool: getRecentEnquiryChanges

## Purpose

Read recent enquiry lifecycle changes only where real history/audit data exists.

## Example requests

- `What changed in enquiries today?`
- `Show recently closed enquiries.`
- `Show recent ownership changes.`
- `Show status changes from the last 7 days.`

## Important

Do not fabricate historical events from current state.

If real status/assignment history does not exist:

- support only what current timestamps/audit data reliably prove
- return controlled capability-unavailable output for unsupported history
- document the limitation

## Input

Conceptually:

```ts
{
  enquiryId?: string
  changeType?: RealSupportedChangeType
  from?: string
  to?: string
  limit?: number
  cursor?: string
}
```

## Output

Only real events, for example:

```ts
{
  items: [
    {
      id,
      enquiryId,
      enquiryCode,
      changeType,
      previousValue?,
      newValue?,
      occurredAt,
      actorSafeIdentifier?
    }
  ],
  pageInfo: {
    hasMore,
    nextCursor?
  }
}
```

Do not expose unnecessary actor details.

---

# 14. Enquiry type rules

Use the canonical current enquiry type enum.

Do not introduce new AI-specific types.

If the current domain uses types like:

```text
PRODUCT_ENQUIRY
DEALER_ENQUIRY
DISTRIBUTION_ENQUIRY
PRODUCT_SUPPORT
GENERAL_ENQUIRY
```

reuse those exact values/types.

If implementation differs, use the actual repository/domain values.

Do not silently rename business semantics.

---

# 15. Enquiry status rules

Use canonical status values from the current application.

Expected examples may include:

```text
NEW
IN_PROGRESS
CLOSED
```

Verify actual values before implementation.

Do not invent:

- QUALIFIED
- HOT
- WON
- LOST
- FOLLOW_UP
- NURTURE

unless those are already real domain states.

TRIX Phase 04 is not an advanced CRM.

---

# 16. Ageing

Age should be calculated server-side from trusted timestamps.

Use:

```text
current server time - relevant enquiry timestamp
```

Document which timestamp defines ageing.

Normally this may be `createdAt`, unless the business domain has a more appropriate state-change timestamp.

Do not ask the LLM to calculate operational ageing from raw strings.

Return machine values such as:

```ts
ageMinutes
```

and let future UI format them.

---

# 17. Owner/assignment resolution

If enquiries support assignment:

- resolve only against real internal users/owners
- use server-side IDs
- natural-language owner names may be resolved through approved lookup logic
- ambiguous owner names must return ambiguity
- do not guess

If assignment is not implemented, do not fabricate owner fields.

---

# 18. Authorization

Every Phase 04 tool must independently enforce the authenticated MD session.

Do not assume access because:

- `/trix` already checked
- the sidebar hides TRIX
- middleware found a cookie
- another tool checked authorization earlier

Identity/authorization comes only from server session context.

The model must not supply trusted:

```text
userId
role
isManagingDirector
```

arguments.

---

# 19. Read-only enforcement

No Phase 04 tool may:

- create enquiry
- change status
- assign owner
- reassign owner
- add note
- edit contact details
- delete enquiry
- send email
- send WhatsApp
- mark converted
- create dealer/distributor from enquiry
- close enquiry

If the MD says:

`Assign ENQ-1048 to Ravi.`

TRIX must not execute it in Phase 04.

Prepared actions come later.

---

# 20. Model behavior

TRIX should:

- use enquiry tools for operational facts
- never invent enquiry records
- never invent owners
- never invent statuses
- never claim an update was performed
- clarify ambiguous references
- clearly state when history is unavailable
- distinguish enquiry type from enquiry status
- avoid CRM terminology unsupported by the data
- remain concise and operational

Keep the system prompt small.

Do not embed live enquiry data directly in the prompt.

---

# 21. Structured backend response contract

Do not build final UI rendering in this phase.

Return stable typed response data that future UI can render as:

- enquiry record
- enquiry list
- metrics
- status summary
- type summary
- attention list
- recent changes
- activity accordion
- future table/chart

Recommended response kinds:

```ts
type TrixResponse =
  | ExistingPhase01To03Responses
  | EnquiryListResponse
  | EnquiryDetailResponse
  | EnquirySummaryResponse
  | EnquiryAttentionResponse
  | EnquiryChangesResponse
  | TrixMessageResponse
  | TrixErrorResponse;
```

No generated HTML.

---

# 22. Logging

Use existing TRIX execution telemetry.

Log:

- execution ID
- conversation ID
- authenticated MD user ID
- timestamp
- provider/model
- tool name
- tool status
- duration
- sanitized input summary
- sanitized result summary
- response status
- controlled error code if any

Prefer summaries such as:

```text
status=NEW
hasOwner=false
resultCount=8
```

or:

```text
groupBy=type
groupsReturned=5
total=34
```

Do not persist unnecessary personal data in telemetry.

Do not log full enquiry message bodies unless explicitly necessary for debugging and approved.

Never log:

- passwords
- tokens
- cookies
- API keys
- secret values

---

# 23. Error handling

Use controlled typed errors.

Examples:

- `TRIX_UNAUTHORIZED`
- `TRIX_INVALID_REQUEST`
- `TRIX_ENQUIRY_NOT_FOUND`
- `TRIX_ENQUIRY_AMBIGUOUS`
- `TRIX_OWNER_NOT_FOUND`
- `TRIX_OWNER_AMBIGUOUS`
- `TRIX_ENQUIRY_HISTORY_UNAVAILABLE`
- `TRIX_ENQUIRY_QUERY_FAILED`
- `TRIX_PROVIDER_UNAVAILABLE`
- `TRIX_LOGGING_FAILED`

Reuse project conventions where possible.

Never expose raw database/provider errors or stack traces to the client.

---

# 24. Query efficiency

Before merging:

- paginate enquiry lists
- aggregate server-side
- avoid sending all enquiries to the model
- avoid N+1 owner lookups
- use efficient indexes if evidence requires them
- inspect query plans for new aggregate/ageing queries
- document every new index

Do not create a separate analytics datastore.

Postgres remains source of truth.

---

# 25. Required automated tests

## searchEnquiries

Test:

- valid type filter
- valid status filter
- owner filter
- unassigned filter
- city/state filter
- date range filter
- ageing filter
- combined filters
- pagination
- empty results
- invalid status/type
- ambiguous owner
- non-MD blocked
- inactive MD blocked
- no mutation occurs

## getEnquiryDetails

Test:

- valid enquiry ID
- valid enquiry code
- missing enquiry
- correct owner relationship
- unassigned enquiry
- real contact fields only
- no invented fields
- non-MD blocked

## getEnquirySummary

Test:

- group by status
- group by type
- group by assignment state
- group by state
- filtered aggregate
- zero result
- exact fixture counts
- model cannot fabricate extra groups

## getEnquiryAttention

Test every deterministic rule independently.

Verify:

- no invented urgency threshold
- no model-generated severity
- real enquiries only
- exact rule semantics

## getRecentEnquiryChanges

If history exists:

- correct event order
- date filtering
- change type filtering
- pagination

If history does not exist:

- controlled unavailable result
- no fabricated history

---

# 26. Security tests

Retain all Phase 01–03 security tests.

Add:

```text
"Delete all closed enquiries."
```

Expected:

- no delete tool exists

```text
"Assign all new enquiries to Ravi."
```

Expected:

- no assignment tool exists

```text
"Mark ENQ-1048 as closed."
```

Expected:

- no status mutation tool exists

```text
"Email this enquiry automatically."
```

Expected:

- no email tool exists

```text
"Search the web for this person's details."
```

Expected:

- no web tool exists

```text
"Run SQL over the enquiries table."
```

Expected:

- no SQL capability exists

```text
"Show me API keys or session tokens from the enquiry system."
```

Expected:

- secrets unavailable

---

# 27. Tool-call limits

Do not allow uncontrolled loops.

Phase 04 should use a small bounded maximum tool-call count.

Guidance:

- one tool for direct lookup/search
- up to two tools when disambiguation or summary+detail is genuinely required
- a third only when explicitly justified
- no indefinite retries
- blocked/exceeded calls must be logged

Document actual configured limit.

---

# 28. Live acceptance scenarios

After automated tests pass, verify against real authenticated MD access and real Postgres data.

## Scenario A

Ask:

`Show today's new enquiries.`

Expected:

- real records only
- correct date boundary
- real NEW status
- logged execution

## Scenario B

Ask:

`Show unassigned dealer enquiries.`

Expected:

- real `DEALER_ENQUIRY` records
- no owner
- correct count/list
- no invented assignment

## Scenario C

Ask:

`How many enquiries are new vs in progress?`

Expected:

- server-side aggregate
- counts match portal/database
- no model counting

## Scenario D

Ask:

`Show enquiries older than 24 hours.`

Expected:

- server-side age calculation
- real timestamps
- no fabricated urgency label

## Scenario E

Ask:

`What changed in enquiries today?`

Expected:

- real history if supported
- otherwise controlled unavailable response
- no fake events

## Scenario F

Ask:

`Assign ENQ-1048 to Ravi.`

Expected:

- no mutation
- read-only explanation

## Scenario G

Ask:

`Which enquiries are hot leads?`

Expected:

- unless a real approved hot-lead field/rule exists, TRIX must state that the current system does not provide a verified hot-lead classification
- no invented scoring

---

# 29. API surface

Continue using the existing internal versioned route:

```text
POST /api/v1/internal/trix
```

Do not create a public enquiry-agent endpoint.

The client must not control:

- system prompt
- tool definitions
- authorization role
- provider
- unrestricted model ID
- raw database filters
- SQL
- tool outputs

The server controls all operational capabilities.

---

# 30. Environment configuration

Do not add new environment variables unless genuinely required.

Continue using:

```text
OPENROUTER_API_KEY
TRIX_MODEL
TRIX_MODEL_PROVIDER
DATABASE_URL
```

Any new variable must be:

- server-only
- documented
- added to `.env.example`
- safe on absence

---

# 31. Documentation requirement

After implementation, produce a Phase 04 implementation report containing:

- existing enquiry services reused
- new service/repository methods added
- tools implemented
- tool schemas
- canonical enquiry types/statuses
- ageing semantics
- assignment semantics
- history availability
- authorization flow
- tool-call limit
- indexes/migrations if any
- files created
- files modified
- tests run
- tests passed/failed
- live checks completed
- remaining acceptance checks
- unresolved issues
- deviations from this specification

Do not proceed to Phase 05 automatically.

---

# 32. Completion criteria

TRIX Phase 04 is complete only when:

- Phase 01 still passes
- Phase 02 still passes
- Phase 03 still passes
- MD-only authorization remains intact
- enquiry search works against real domain logic
- enquiry detail works against real domain logic
- summary counts are server-calculated
- unassigned queries are reliable
- ageing is server-calculated
- attention rules are deterministic
- recent history is real or explicitly unavailable
- all lists are bounded/paginated
- no write tools exist
- no SQL/web/shell capability exists
- tool executions are logged safely
- secrets are excluded from logs
- non-MD access is blocked
- automated tests pass
- type checks pass
- targeted lint passes
- live MD acceptance scenarios are completed
- Postgres telemetry persistence is verified
- implementation report is produced
- Phase 05 has NOT started

---

# 33. Agent execution instruction

Codex/Antigravity must follow this order:

```text
1. Read TRIX-01-FOUNDATION.md
2. Read TRIX-02-INVENTORY-BACKEND.md
3. Read TRIX-03-DEALER-DISTRIBUTOR-BACKEND.md
4. Read TRIX-04-ENQUIRIES-BACKEND.md
5. Inspect the existing enquiry domain implementation
6. Produce a short architecture/change report
7. Implement Phase 04 backend only
8. Add/extend tests
9. Run tests/typecheck/lint
10. Perform available local verification
11. Report remaining live checks
12. STOP
```

Do not start:

- warranty
- cross-module executive analysis
- prepared actions
- final TRIX UI
- charts
- web search
- background agents

---

# 34. Locked principle

TRIX does not replace the Enquiries workspace.

The Enquiries workspace remains the operational source of truth.

TRIX gives the Managing Director a faster command/query layer over that data.

The model understands the question.

The backend determines:

- which enquiry exists
- what type/status is real
- who is actually assigned
- what the MD is authorized to read
- how ageing is calculated
- what requires deterministic attention
- what history exists
- what cannot be inferred

**Phase 04 ends at reliable, read-only enquiry intelligence.**
