import { z } from 'zod';
import type { ContactEnquiryStatus, ContactEnquiryType } from '@trionyx/types';
const text = z.string().trim().min(1).max(120).regex(/^[^\u0000-\u001f\u007f]*$/);
export const enquiryTypeSchema = z.enum(['PRODUCT_ENQUIRY', 'DEALER_ENQUIRY', 'DISTRIBUTION_ENQUIRY', 'PRODUCT_SUPPORT', 'GENERAL_ENQUIRY'] satisfies ContactEnquiryType[]);
export const enquiryStatusSchema = z.enum(['NEW', 'IN_PROGRESS', 'CLOSED'] satisfies ContactEnquiryStatus[]);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/).refine(value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value.slice(0, 10));
const pagination = { page: z.number().int().min(1).max(100000).default(1), limit: z.number().int().min(1).max(50).default(20) };
const filters = { type: enquiryTypeSchema.optional(), status: enquiryStatusSchema.optional(), ownerId: text.optional(), ownerName: text.optional(), hasOwner: z.boolean().optional(), city: text.optional(), state: text.optional(), pincode: text.optional(), createdFrom: date.optional(), createdTo: date.optional(), olderThanHours: z.number().min(0).max(87600).optional(), createdPeriod: z.literal('today').optional() };
const validFilters = (value: { ownerId?: string; ownerName?: string; hasOwner?: boolean; createdFrom?: string; createdTo?: string; createdPeriod?: string }) => !(value.hasOwner === false && (value.ownerId || value.ownerName)) && !(value.createdPeriod && (value.createdFrom || value.createdTo)) && (!value.createdFrom || !value.createdTo || Date.parse(value.createdFrom) <= Date.parse(value.createdTo));
export const searchEnquiriesInputSchema = z.object({ ...filters, ...pagination, query: text.optional(), enquiryId: text.optional(), enquiryCode: text.optional() }).strict().refine(validFilters, 'Conflicting enquiry filters or invalid dates.');
export const enquiryDetailsInputSchema = z.object({ enquiryId: text.optional(), enquiryCode: text.optional() }).strict().refine(value => !!(value.enquiryId || value.enquiryCode));
export const enquirySummaryInputSchema = z.object({ ...filters, ...pagination, groupBy: z.enum(['status', 'type', 'assignment_status', 'state']) }).strict().refine(validFilters);
export const enquiryAttentionInputSchema = z.object({ rule: z.enum(['NEW_UNASSIGNED', 'MISSING_OWNER']).optional(), ...pagination }).strict();
export const enquiryChangesInputSchema = z.object({ enquiryId: text.optional(), changeType: z.enum(['CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'NOTE_ADDED']).optional(), from: date.optional(), to: date.optional(), period: z.literal('today').optional(), ...pagination }).strict().refine(value => !(value.period && (value.from || value.to)) && (!value.from || !value.to || Date.parse(value.from) <= Date.parse(value.to)));
const pageInfo = z.object({ total: z.number().int().nonnegative(), page: z.number().int().positive(), limit: z.number().int().min(1).max(50), hasMore: z.boolean() }).strict();
const item = z.object({ id: text, enquiryCode: text, type: enquiryTypeSchema, status: enquiryStatusSchema, fullName: z.string().max(500), companyName: z.string().max(500).nullable(), city: z.string().max(200), state: z.string().max(200), pincode: z.string().max(30), owner: z.object({ id: text, displayName: z.string().max(500) }).strict().nullable(), createdAt: date, updatedAt: date, ageMinutes: z.number().int().nonnegative() }).strict();
export const enquiryResponseSchemas = [
  z.object({ type: z.literal('enquiry_list'), items: z.array(item).max(50), pageInfo, asOf: date }).strict(),
  z.object({ type: z.literal('enquiry_detail'), enquiry: item.extend({ phone: z.string().max(100), email: z.string().max(320).nullable(), message: z.string().max(4000), messageTruncated: z.boolean() }).strict(), asOf: date }).strict(),
  z.object({ type: z.literal('enquiry_summary'), total: z.number().int().nonnegative(), groupBy: enquirySummaryInputSchema.shape.groupBy, groups: z.array(z.object({ key: z.string().max(200), label: z.string().max(200), count: z.number().int().nonnegative() }).strict()).max(50), filtersApplied: z.object(filters).strict(), pageInfo, asOf: date }).strict(),
  z.object({ type: z.literal('enquiry_attention'), items: z.array(z.object({ enquiryId: text, enquiryCode: text, rule: z.enum(['NEW_UNASSIGNED', 'MISSING_OWNER']), severity: z.enum(['WARNING', 'CRITICAL']), label: z.string(), description: z.string(), ageMinutes: z.number().int().nonnegative() }).strict()).max(50), pageInfo, asOf: date }).strict(),
  z.object({ type: z.literal('enquiry_changes'), items: z.array(z.object({ id: text, enquiryId: text, enquiryCode: text, changeType: enquiryChangesInputSchema.shape.changeType.unwrap(), previousValue: text.nullable(), newValue: text.nullable(), occurredAt: date }).strict()).max(50), pageInfo }).strict(),
] as const;
export const enquiryResponseSchema = z.discriminatedUnion('type', enquiryResponseSchemas);
export type EnquiryResponse = z.infer<typeof enquiryResponseSchema>;
export type EnquiryResult = { success: true; response: EnquiryResponse } | { success: false; errorCode: string; message: string };
