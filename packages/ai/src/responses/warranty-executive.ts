import { z } from 'zod';
const text = z.string().trim().min(1).max(256).regex(/^[^\u0000-\u001f\u007f]*$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/).refine(value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value.slice(0, 10));
const status = z.enum(['ACTIVE', 'EXPIRED', 'VOID']);
const period = z.enum(['today', 'this_week', 'this_month', 'last_7_days']);
const pagination = { page: z.number().int().min(1).max(100000).default(1), limit: z.number().int().min(1).max(50).default(20) };
const filters = { warrantyId: text.optional(), serialNumber: text.min(2).optional(), dealerId: text.optional(), dealerName: text.optional(), productId: text.optional(), productName: text.optional(), status: status.optional(), registeredFrom: date.optional(), registeredTo: date.optional(), registeredPeriod: period.optional() };
const valid = (v: { registeredFrom?: string; registeredTo?: string; registeredPeriod?: string }) => !(v.registeredPeriod && (v.registeredFrom || v.registeredTo)) && (!v.registeredFrom || !v.registeredTo || Date.parse(v.registeredFrom) <= Date.parse(v.registeredTo));
export const warrantySerialInputSchema = z.object({ serialNumber: text.min(2) }).strict();
export const warrantySearchInputSchema = z.object({ ...filters, ...pagination }).strict().refine(valid);
export const warrantySummaryInputSchema = z.object({ ...filters, ...pagination, groupBy: z.enum(['status', 'dealer', 'product', 'registration_period']) }).strict().refine(valid);
const rule = z.enum(['MISSING_SERIAL', 'MISSING_PRODUCT', 'MISSING_DEALER', 'INACTIVE_DEALER', 'DUPLICATE_ACTIVE', 'INVALID_DATE_ORDER', 'INVALID_VOID_STATE']);
export const warrantyExceptionsInputSchema = z.object({ rule: rule.optional(), ...pagination }).strict();
const window = { from: date.optional(), to: date.optional(), period: period.optional() };
const validWindow = (v: { from?: string; to?: string; period?: string }) => !(v.period && (v.from || v.to)) && (!v.from || !v.to || Date.parse(v.from) <= Date.parse(v.to));
export const executiveInputSchema = z.object(window).strict().refine(validWindow);
const moduleSchema = z.enum(['inventory', 'dealers', 'distributors', 'enquiries', 'warranties']);
export const operationalChangesInputSchema = z.object({ ...window, module: moduleSchema.optional(), ...pagination }).strict().refine(validWindow);
const number = z.number().int().nonnegative();
const pageInfo = z.object({ total: number, page: z.number().int().positive(), limit: z.number().int().min(1).max(50), hasMore: z.boolean() }).strict();
const item = z.object({ warrantyId: text, serialRecordId: text, serialNumber: text, productId: text, productName: text, dealerId: text.nullable(), dealerName: text.nullable(), status, storedStatus: z.enum(['ACTIVE', 'VOID']), installationDate: date, startDate: date, expiryDate: date, registeredAt: date, voidedAt: date.nullable() }).strict();
const attentionItem = z.object({ recordId: text, rule: text, severity: z.enum(['WARNING', 'CRITICAL']) }).strict();
const attention = z.object({ total: number, items: z.array(attentionItem).max(5) }).strict();
const change = z.object({ id: text, module: moduleSchema, recordId: text, event: z.enum(['RECEIVED', 'TRANSFERRED', 'ADJUSTED', 'DEALER_DISTRIBUTOR_ASSIGNED', 'DEALER_CREATED', 'DEALER_UPDATED', 'DEALER_STATUS_CHANGED', 'DISTRIBUTOR_CREATED', 'DISTRIBUTOR_UPDATED', 'DISTRIBUTOR_STATUS_CHANGED', 'CONTACT_ENQUIRY_CREATED', 'CONTACT_ENQUIRY_STATUS_CHANGED', 'CONTACT_ENQUIRY_ASSIGNED', 'CONTACT_ENQUIRY_NOTE_ADDED', 'WARRANTY_ACTIVATED', 'WARRANTY_VOIDED']), occurredAt: date }).strict();
const resolvedWindow = z.object({ from: date, to: date }).strict();
export const warrantyExecutiveResponseSchemas = [
  z.object({ type: z.literal('warranty_record'), warranty: item, asOf: date }).strict(),
  z.object({ type: z.literal('warranty_list'), items: z.array(item).max(50), pageInfo, asOf: date }).strict(),
  z.object({ type: z.literal('warranty_summary'), total: number, groupBy: warrantySummaryInputSchema.shape.groupBy, groups: z.array(z.object({ key: text, label: text, count: number }).strict()).max(50), pageInfo, asOf: date, filtersApplied: z.object(filters).strict() }).strict(),
  z.object({ type: z.literal('warranty_exceptions'), items: z.array(attentionItem.extend({ rule })).max(50), pageInfo, asOf: date }).strict(),
  z.object({ type: z.literal('operational_changes'), items: z.array(change).max(50), pageInfo, window: resolvedWindow }).strict(),
  z.object({ type: z.literal('executive_overview'),
    inventory: z.object({ totalSerials: number, availableSerials: number }).strict(),
    dealers: z.object({ totalDealers: number, totalDistributors: number, activeDealers: number, unassignedDealers: number }).strict(),
    enquiries: z.object({ total: number, new: number, inProgress: number, closed: number, unassigned: number }).strict(),
    warranties: z.object({ total: number, active: number, expired: number, void: number, registeredToday: number }).strict(),
    attention: z.object({ inventory: attention, dealers: attention, enquiries: attention, warranties: attention }).strict(),
    activity: z.object({ total: number, items: z.array(change).max(5), window: resolvedWindow, hasMore: z.boolean() }).strict(),
    generatedAt: date, snapshotSemantics: z.literal('Current counts from separate reads; activity is limited to the explicit window.') }).strict(),
] as const;
export const warrantyExecutiveResponseSchema = z.discriminatedUnion('type', warrantyExecutiveResponseSchemas);
export type WarrantyExecutiveResponse = z.infer<typeof warrantyExecutiveResponseSchema>;
export type WarrantyExecutiveResult = { success: true; response: WarrantyExecutiveResponse } | { success: false; errorCode: string; message: string };
