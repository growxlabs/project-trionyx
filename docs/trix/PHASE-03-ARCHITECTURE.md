# Phase 03 pre-implementation inspection

- Dealer services: listDealers, getDealerById, getDealerHistory; mutation and portal-user methods remain outside TRIX.
- Distributor services: listDistributors, getDistributorById, listDistributorDealers; mutation and notes methods remain outside TRIX.
- Dealer repository: findById, findByCode, list, countActive, getDistributorHistory; distributor repository: findById, findByCode, list, countActive/listAllActive where available.
- Separate dealer/distributor tables; both statuses: ACTIVE, INACTIVE, SUSPENDED. UUID IDs, TRX-DLR-/TRX-DST- codes with six digits.
- dealers.distributor_id is nullable; NULL means unassigned. FK uses ON DELETE SET NULL. Dealer users reference dealers separately; credentials and personal contacts are excluded from TRIX output.
- Real dealer_distributor_history stores initial assignment and reassignments, previous/new IDs, changed_at, changed_by and reason. Actor names and reason are omitted from tool results. Deleted distributor references may be NULL; historical names cannot be reconstructed.
- Stored location fields: address_line1/2, city, district, state, postal_code, country. Distributor territory exists but is excluded from this capability.
- Existing pagination is page/limit with a count, not cursors. Extend filters for exact ID/code, city, name matching, assignment presence and hasDealers.
- Existing business audit logs remain separate from agent_execution_logs. Extend execution response constraint through a new migration, preserving old rows.
- Existing runtime uses getModel('trix'), five Phase 01/02 tools, fresh authorization per call, two calls per request, one model step, summary-only telemetry.
- Missing prerequisite document: TRIX-02-INVENTORY-BACKEND.md is absent. PHASE-02-INVENTORY-BACKEND-REPORT.md and existing implementation/tests serve as inspection evidence; live acceptance of prior phases is not established by the report alone.

## Planned changes

Reuse the domain services/repositories. Add read-only name resolution, filters, paginated history, bounded network aggregation and deterministic exceptions. Register seven strict tools and extend the response union without changing the UI. Keep two total tool calls and existing Phase 01/02 behavior. Add isolated fixture tests and runtime security tests. No business-data migration or new indexes without query-plan evidence. Production migration and live MD acceptance must be explicitly verified before claiming phase completion.
