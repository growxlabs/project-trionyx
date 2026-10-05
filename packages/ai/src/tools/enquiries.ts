import { enquiryIntelligenceService, EnquiryReadError } from '@trionyx/api';
import type { ContactEnquiry, SafeUser } from '@trionyx/types';
import { z } from 'zod';
import { searchEnquiriesInputSchema, enquiryDetailsInputSchema, enquirySummaryInputSchema, enquiryAttentionInputSchema, enquiryChangesInputSchema, enquiryResponseSchema, type EnquiryResponse, type EnquiryResult } from '../responses/enquiries';
export type EnquiryIntelligenceService = typeof enquiryIntelligenceService;
type User = Pick<SafeUser, 'id' | 'role' | 'status'> | null;
export function enquiryTodayBounds(now: Date) {
  const day = new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
  const start = Date.parse(`${day}T00:00:00.000Z`) - 330 * 60000;
  return { from: new Date(start).toISOString(), to: new Date(start + 86400000 - 1).toISOString() };
}
const bound = (value: string | undefined, end = false) => value ? value.length === 10 ? `${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z` : new Date(value).toISOString() : undefined;
const age = (createdAt: string, now: Date) => {
  const timestamp = Date.parse(createdAt);
  if (!Number.isFinite(timestamp)) throw new Error('INVALID_STORED_TIMESTAMP');
  return Math.max(0, Math.floor((now.getTime() - timestamp) / 60000));
};
const pageInfo = (total: number, query: { page: number; limit: number }) => ({ total, page: query.page, limit: query.limit, hasMore: query.page * query.limit < total });
function item(record: ContactEnquiry, now: Date) {
  if (record.assignedTo && !record.assignedUserName) throw new EnquiryReadError('TRIX_ENQUIRY_OWNER_UNAVAILABLE', 'The stored owner reference cannot be resolved.');
  return { id: record.id, enquiryCode: record.enquiryCode, type: record.type, status: record.status, fullName: record.fullName, companyName: record.companyName ?? null, city: record.city, state: record.state, pincode: record.pincode, owner: record.assignedTo ? { id: record.assignedTo, displayName: record.assignedUserName! } : null, createdAt: record.createdAt, updatedAt: record.updatedAt, ageMinutes: age(record.createdAt, now) };
}
async function filters(query: z.output<typeof searchEnquiriesInputSchema> | z.output<typeof enquirySummaryInputSchema>, service: EnquiryIntelligenceService, now: Date) {
  const owner = query.ownerId || query.ownerName ? await service.resolveOwner(query) : undefined;
  const today = query.createdPeriod ? enquiryTodayBounds(now) : undefined;
  return { type: query.type, status: query.status, assignedTo: owner?.id, hasOwner: query.hasOwner, city: query.city, state: query.state, pincode: query.pincode, createdFrom: today?.from ?? bound(query.createdFrom), createdTo: today?.to ?? bound(query.createdTo, true), createdBefore: query.olderThanHours === undefined ? undefined : new Date(now.getTime() - query.olderThanHours * 3600000).toISOString(), page: query.page, limit: query.limit };
}
async function validated<S extends z.ZodType>(schema: S, input: z.input<S>, user: User, read: (query: z.output<S>) => Promise<EnquiryResponse>): Promise<EnquiryResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, errorCode: 'TRIX_INVALID_REQUEST', message: 'The enquiry filters or identifiers are invalid.' };
  try { return { success: true, response: enquiryResponseSchema.parse(await read(parsed.data)) }; }
  catch (error) {
    if (error instanceof EnquiryReadError) return { success: false, errorCode: error.code, message: error.message };
    return { success: false, errorCode: 'TRIX_ENQUIRY_QUERY_FAILED', message: 'TRIX could not read the requested enquiry information.' };
  }
}
export async function searchEnquiries(input: z.input<typeof searchEnquiriesInputSchema>, user: User, service = enquiryIntelligenceService, now = new Date()) {
  return validated(searchEnquiriesInputSchema, input, user, async query => {
    const result = await service.list({ ...await filters(query, service, now), search: query.query, enquiryId: query.enquiryId, enquiryCode: query.enquiryCode });
    return { type: 'enquiry_list', items: result.items.map(record => item(record, now)), pageInfo: pageInfo(result.total, query), asOf: now.toISOString() };
  });
}
export async function getEnquiryDetails(input: z.input<typeof enquiryDetailsInputSchema>, user: User, service = enquiryIntelligenceService, now = new Date()) {
  return validated(enquiryDetailsInputSchema, input, user, async query => {
    const record = await service.detail(query);
    return { type: 'enquiry_detail', enquiry: { ...item(record, now), phone: record.phone, email: record.email ?? null, message: record.message.slice(0, 4000), messageTruncated: record.message.length > 4000 }, asOf: now.toISOString() };
  });
}
export async function getEnquirySummary(input: z.input<typeof enquirySummaryInputSchema>, user: User, service = enquiryIntelligenceService, now = new Date()) {
  return validated(enquirySummaryInputSchema, input, user, async query => {
    const result = await service.summary({ ...await filters(query, service, now), groupBy: query.groupBy });
    const { page: _page, limit: _limit, groupBy: _group, ...filtersApplied } = query;
    void _page; void _limit; void _group;
    return { type: 'enquiry_summary', total: result.total, groupBy: query.groupBy, groups: result.groups, filtersApplied, pageInfo: pageInfo(result.groupsTotal, query), asOf: now.toISOString() };
  });
}
export async function getEnquiryAttention(input: z.input<typeof enquiryAttentionInputSchema>, user: User, service = enquiryIntelligenceService, now = new Date()) {
  return validated(enquiryAttentionInputSchema, input, user, async query => {
    const result = await service.attention(query);
    return { type: 'enquiry_attention', items: result.items.map(({ createdAt, ...record }) => ({ ...record, severity: record.rule === 'MISSING_OWNER' ? 'CRITICAL' as const : 'WARNING' as const, label: record.rule === 'MISSING_OWNER' ? 'Unresolved owner' : 'New and unassigned', description: record.rule === 'MISSING_OWNER' ? 'The stored owner reference does not resolve to a user.' : 'The enquiry is NEW and has no assigned owner. This does not classify urgency or sales potential.', ageMinutes: age(createdAt, now) })), pageInfo: pageInfo(result.total, query), asOf: now.toISOString() };
  });
}
export async function getRecentEnquiryChanges(input: z.input<typeof enquiryChangesInputSchema>, user: User, service = enquiryIntelligenceService) {
  return validated(enquiryChangesInputSchema, input, user, async query => {
    if (query.enquiryId) await service.detail({ enquiryId: query.enquiryId });
    const today = query.period ? enquiryTodayBounds(new Date()) : undefined;
    let result;
    try { result = await service.changes({ ...query, from: today?.from ?? bound(query.from), to: today?.to ?? bound(query.to, true) }); }
    catch { throw new EnquiryReadError('TRIX_ENQUIRY_HISTORY_UNAVAILABLE', 'Enquiry audit history is unavailable. Current timestamps do not prove lifecycle changes.'); }
    return { type: 'enquiry_changes', items: result.items, pageInfo: pageInfo(result.total, query) };
  });
}
