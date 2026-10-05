import { warrantyExecutiveService, WarrantyExecutiveReadError } from '@trionyx/api';
import type { SafeUser } from '@trionyx/types';
import { z } from 'zod';
import { assertManagingDirector } from './lookup-serial';
import { normalizeSerial } from '../responses/schema';
import { warrantySerialInputSchema, warrantySearchInputSchema, warrantySummaryInputSchema, warrantyExceptionsInputSchema, executiveInputSchema, operationalChangesInputSchema, warrantyExecutiveResponseSchema, type WarrantyExecutiveResult } from '../responses/warranty-executive';
export type WarrantyExecutiveService = typeof warrantyExecutiveService;
type User = Pick<SafeUser, 'id' | 'role' | 'status'> | null;
type Period = 'today' | 'this_week' | 'this_month' | 'last_7_days';
export function operationalWindow(query: { from?: string; to?: string; period?: Period }, now: Date) {
  const local = new Date(now.getTime() + 330 * 60000);
  const end = Date.parse(`${local.toISOString().slice(0, 10)}T00:00:00Z`) - 330 * 60000 + 86400000 - 1;
  let start = end - 86400000 + 1;
  if (query.period === 'last_7_days') start -= 6 * 86400000;
  if (query.period === 'this_week') start -= ((local.getUTCDay() + 6) % 7) * 86400000;
  if (query.period === 'this_month') start = Date.parse(`${local.toISOString().slice(0, 7)}-01T00:00:00Z`) - 330 * 60000;
  const from = query.from ? dateBound(query.from) : new Date(start).toISOString();
  const to = query.to ? dateBound(query.to, true) : new Date(end).toISOString();
  if (Date.parse(from) > Date.parse(to)) throw new WarrantyExecutiveReadError('TRIX_INVALID_REQUEST', 'The resolved date window is reversed.');
  return { from, to };
}
function dateBound(value: string, end = false) { return value.length === 10 ? `${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z` : new Date(value).toISOString(); }
const pageInfo = (total: number, query: { page: number; limit: number }) => ({ total, page: query.page, limit: query.limit, hasMore: query.page * query.limit < total });
async function validated<S extends z.ZodType>(schema: S, input: z.input<S>, user: User, read: (query: z.output<S>) => Promise<unknown>): Promise<WarrantyExecutiveResult> {
  assertManagingDirector(user);
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, errorCode: 'TRIX_INVALID_REQUEST', message: 'The warranty or operational filters are invalid.' };
  try { return { success: true, response: warrantyExecutiveResponseSchema.parse(await read(parsed.data)) }; }
  catch (error) {
    if (error instanceof WarrantyExecutiveReadError) return { success: false, errorCode: error.code, message: error.message };
    return { success: false, errorCode: 'TRIX_OPERATIONAL_QUERY_UNAVAILABLE', message: 'The requested operational data could not be read reliably.' };
  }
}
async function filters(query: z.output<typeof warrantySearchInputSchema> | z.output<typeof warrantySummaryInputSchema>, service: WarrantyExecutiveService, now: Date) {
  const dealer = query.dealerId || query.dealerName ? await service.resolveTarget({ id: query.dealerId, name: query.dealerName }, 'dealer') : undefined;
  const product = query.productId || query.productName ? await service.resolveTarget({ id: query.productId, name: query.productName }, 'product') : undefined;
  const period = query.registeredPeriod ? operationalWindow({ period: query.registeredPeriod }, now) : undefined;
  return { warrantyId: query.warrantyId, serialNumber: query.serialNumber ? normalizeSerial(query.serialNumber) : undefined, dealerId: dealer?.id, productId: product?.id, status: query.status, registeredFrom: period?.from ?? (query.registeredFrom ? dateBound(query.registeredFrom) : undefined), registeredTo: period?.to ?? (query.registeredTo ? dateBound(query.registeredTo, true) : undefined), asOfDate: now.toISOString().slice(0, 10), page: query.page, limit: query.limit };
}
export async function getWarrantyBySerial(input: z.input<typeof warrantySerialInputSchema>, user: User, service = warrantyExecutiveService, now = new Date()) {
  return validated(warrantySerialInputSchema, input, user, async query => {
    const result = await service.list({ serialNumber: normalizeSerial(query.serialNumber), asOfDate: now.toISOString().slice(0, 10), limit: 2 });
    if (!result.total) throw new WarrantyExecutiveReadError('TRIX_WARRANTY_NOT_FOUND', 'No warranty exists for that serial number.');
    if (result.total !== 1) throw new WarrantyExecutiveReadError('TRIX_WARRANTY_RELATIONSHIP_INVALID', 'Multiple warranties reference this serial. Use warranty exceptions to inspect the stored relationship.');
    return { type: 'warranty_record', warranty: result.items[0], asOf: now.toISOString() };
  });
}
export async function searchWarranties(input: z.input<typeof warrantySearchInputSchema>, user: User, service = warrantyExecutiveService, now = new Date()) {
  return validated(warrantySearchInputSchema, input, user, async query => {
    const result = await service.list(await filters(query, service, now));
    return { type: 'warranty_list', items: result.items, pageInfo: pageInfo(result.total, query), asOf: now.toISOString() };
  });
}
export async function getWarrantySummary(input: z.input<typeof warrantySummaryInputSchema>, user: User, service = warrantyExecutiveService, now = new Date()) {
  return validated(warrantySummaryInputSchema, input, user, async query => {
    const result = await service.summary({ ...await filters(query, service, now), groupBy: query.groupBy });
    if (query.groupBy === 'status' && result.groups.some(group => !['ACTIVE', 'EXPIRED', 'VOID'].includes(group.key))) throw new Error('INVALID_STORED_WARRANTY_STATUS');
    const { page: _page, limit: _limit, groupBy: _group, ...filtersApplied } = query;
    void _page; void _limit; void _group;
    return { type: 'warranty_summary', total: result.total, groups: result.groups, groupBy: query.groupBy, pageInfo: pageInfo(result.groupsTotal, query), filtersApplied, asOf: now.toISOString() };
  });
}
export async function getWarrantyExceptions(input: z.input<typeof warrantyExceptionsInputSchema>, user: User, service = warrantyExecutiveService, now = new Date()) {
  return validated(warrantyExceptionsInputSchema, input, user, async query => {
    const result = await service.exceptions(query);
    return { type: 'warranty_exceptions', items: result.items, pageInfo: pageInfo(result.total, query), asOf: now.toISOString() };
  });
}
export async function getExecutiveOverview(input: z.input<typeof executiveInputSchema>, user: User, service = warrantyExecutiveService, now = new Date()) {
  return validated(executiveInputSchema, input, user, async query => ({ type: 'executive_overview', ...await service.overview(operationalWindow(query, now), operationalWindow({ period: 'today' }, now), now) }));
}
export async function getRecentOperationalChanges(input: z.input<typeof operationalChangesInputSchema>, user: User, service = warrantyExecutiveService, now = new Date()) {
  return validated(operationalChangesInputSchema, input, user, async query => {
    const window = operationalWindow(query, now);
    let result;
    try { result = await service.changes({ ...query, ...window }); }
    catch { throw new WarrantyExecutiveReadError('TRIX_OPERATIONAL_HISTORY_UNAVAILABLE', 'Real operational history is unavailable for this window. Current timestamps cannot reconstruct it.'); }
    return { type: 'operational_changes', items: result.items, pageInfo: pageInfo(result.total, query), window };
  });
}
