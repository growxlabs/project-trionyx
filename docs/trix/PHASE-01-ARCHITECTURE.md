# TRIX Phase 01 architecture and review

Source: `TRIX-01-FOUNDATION.md`, copied unchanged from the previously saved pasted specification.

## Existing foundations

Internal login validates Argon2 credentials and internal role, creates an opaque HTTP-only cookie, and stores its SHA-256 hash. `requireRole` validates session expiry and active user state. The general portal allows DISTRIBUTOR, MANAGING_DIRECTOR and ADMIN; TRIX allows only MANAGING_DIRECTOR. Middleware cookie presence is not authorization.

`inventoryService.getSerialByNumber` is the canonical read service. It delegates to `serialsRepository.findBySerialNumber`, which trims/uppercases the serial and returns product/location joins and newest-first movement history. Phase 01 projects only ID, serial, product name, status, location name and newest movement timestamp. Missing product data fails validation; no invented fallback is shown.

API services live in `packages/api/src/services`; repositories and Postgres access live in `packages/database`. The portal uses versioned `/api/v1/internal` routes and `{data}`/`{error}` envelopes. Existing business audit events use `audit_logs`; agent telemetry uses a separate table.

## Implementation

`packages/ai` holds the Vercel AI SDK orchestration, `getModel('trix')`, read-only tool, schemas and logging. No eve dependency is needed for this bounded workflow. The runtime performs one model step with exactly one registered business tool and at most one inventory read. It ignores raw model prose and constructs the response from validated tool output. Thus no model HTML or invented inventory fields are rendered.

`getModel` owns the fixed OpenRouter endpoint and server-only key. A future Growx adapter changes this boundary. Runtime, tools, schema, logging and UI remain provider-independent. See [AI SDK tool calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling) and [compatible provider documentation](https://ai-sdk.dev/providers/openai-compatible-providers).

The `/trix` page, versioned POST route, runtime and tool check MD authorization. Tool execution revalidates the server session. Tool arguments cannot provide user identity. POST requires same-origin requests and bounded validated input; operational requests require Postgres configuration. There is no client-supplied model, system prompt, tool result, arbitrary URL or SQL.



Desktop/mobile navigation shows TRIX only for MD. The UI keeps conversation state locally, renders approved serial/message blocks, exposes collapsed Activity details, and validates Open serial actions against the returned record. Navigation is `/inventory/serials/<encoded record ID>`. That page resolves the real serial ID and reuses `SerialNumberLookupModal` for existing record details and lineage.

## Conflicts and prerequisites

- The requested spec path did not exist initially. The saved pasted document was used, then copied unchanged to this repository's `docs/trix/TRIX-01-FOUNDATION.md`.
- There was no canonical addressable serial page; Phase 01 adds one to the existing Inventory workspace.
- The existing write guard includes ADMIN and is unsuitable for TRIX; explicit MD role checks are used.
- Supabase is accessed through the existing `pg` adapter rather than a new Supabase SDK inventory client. SQLite remains available for isolated tests; TRIX operational API requires Postgres.
- OpenRouter key/model configuration was absent during implementation. Live model acceptance cannot be claimed until those values are configured.
- Existing uncommitted guide, warranty and navigation edits were preserved.

## Setup and review

In `apps/portal/.env.local`, configure server-only `OPENROUTER_API_KEY`, `TRIX_MODEL` (an explicit OpenRouter model supporting tools), and optionally `TRIX_MODEL_PROVIDER=openrouter`. Retain the existing Supabase Postgres `DATABASE_URL`. Do not use `NEXT_PUBLIC_` names for provider credentials. Restart the portal server after setting these values.

Review `/trix` signed in as MD. Ask for a real serial from Inventory, expand Activity, and click Open serial. Check not-found, provider unavailable and non-MD states. Inspect `/inventory/serials/<actual serial ID>` for the canonical tracker. No fake serial is provisioned in operational data.

Run `pnpm --filter @trionyx/ai test` for isolated in-memory inventory/log fixtures and AI SDK mock-model tests. These verify the runtime/tool security boundary; prompt cases with mock output do not establish a real model's intent accuracy. A live OpenRouter prompt evaluation remains necessary.

## Files

Created: `packages/ai/package.json`, `packages/ai/tsconfig.json`, `packages/ai/src/index.ts`, `provider.ts`, `trix-agent.ts`, `tools/lookup-serial.ts`, `responses/schema.ts`, `logging/agent-log.ts`, `__tests__/trix.test.ts`; `packages/database/src/agentLogSchema.ts`, `repositories/agentLogs.ts`, `migrations/0012_trix_execution_logs.sql`; `apps/portal/src/app/trix/page.tsx`, `TrixConversation.tsx`, `api/v1/internal/trix/route.ts`, `inventory/serials/[serialId]/page.tsx`, `SerialRecordView.tsx`; this report and the canonical foundation document.

Modified: portal `package.json`, `next.config.ts`, `src/components/shell/Sidebar.tsx`, `MobileNavigation.tsx`; database `src/index.ts`, `db.ts`, `postgresSchema.ts`; root `pnpm-lock.yaml`, `.env.example`.

Phase 02 is excluded.

## Verification results

- 27 automated tests passed using the actual inventory repository and agent-log repository against isolated in-memory SQLite data and AI SDK mock models.
- Cases cover real fixture lookup, normalization, malformed/not-found inputs, unauthorized and inactive roles, reauthorization, domain/provider failures, unknown tools, malformed model arguments, fabricated serials/fields/HTML, mutation/web refusal, record navigation, log persistence, secret exclusion, logging outage, missing product data and multiple tool attempts.
- Type checks passed for `@trionyx/ai`, `@trionyx/portal` and `@trionyx/database`.
- Targeted ESLint passed for TRIX pages/API, serial pages and modified navigation components.
- Local unauthenticated `POST /api/v1/internal/trix` returned HTTP 401 with a sanitized error. Guest `/trix` redirected to `/login`.

The revised brief adds explicit input/result summaries to Activity and persisted tool events. Summaries use allowlisted labels and omit serial values, preventing a secret supplied as a purported serial from entering telemetry. Activity reports Completed/Failed, latency, sanitized input and found/not-found/failure result summaries. An explicit injection test attempts an unregistered SQL tool and verifies that the SDK advertises only `lookupSerial`, no inventory read occurs, and neither SQL nor secret arguments enter logs.
