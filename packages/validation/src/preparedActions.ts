import { z } from 'zod';
const text = z.string().trim().min(1).max(256).regex(/^[^\u0000-\u001f\u007f]*$/);
const reason = z.string().trim().min(3).max(500).regex(/^[^\u0000-\u001f\u007f<>]*$/).refine(value=>!(/\b(password|api[_ -]?key|bearer|access[_ -]?token|session[_ -]?token|secret|credentials?)\b|sk-[A-Za-z0-9_-]{8,}|-----BEGIN.*PRIVATE KEY/i.test(value)),'Credentials cannot be included in a preparation reason.');
export const actionReferenceSchema = z.object({ id: text.optional(), code: text.optional(), name: text.optional() }).strict().refine(value => !!(value.id || value.code || value.name));
export const prepareDealerDistributorInputSchema = z.object({ dealerReference: actionReferenceSchema, distributorReference: actionReferenceSchema, reason: reason.optional() }).strict();
export const prepareEnquiryAssignmentInputSchema = z.object({ enquiryReference: actionReferenceSchema, ownerReference: actionReferenceSchema }).strict();
export const prepareEnquiryStatusInputSchema = z.object({ enquiryReference: actionReferenceSchema, proposedStatus: z.enum(['NEW','IN_PROGRESS','CLOSED']) }).strict();
export const prepareInventoryTransferInputSchema = z.object({ serialNumbers: z.array(text.min(2)).min(1).max(20), destinationLocationReference: actionReferenceSchema, reason: reason.optional() }).strict().refine(value => new Set(value.serialNumbers.map(serial => serial.toUpperCase())).size === value.serialNumbers.length, 'Duplicate serials are invalid.');
export const actionTypeSchema = z.enum(['DEALER_DISTRIBUTOR_ASSIGNMENT','ENQUIRY_ASSIGNMENT','ENQUIRY_STATUS_CHANGE','INVENTORY_TRANSFER']);
export const actionStateSchema = z.enum(['PREPARED','CONFIRMED','EXECUTED','CANCELLED','EXPIRED','FAILED']);
export const actionSnapshotSchema = z.object({ id: text, label: text, status: z.enum(['ACTIVE','INACTIVE','SUSPENDED','AVAILABLE','TRANSFERRED','NEW','IN_PROGRESS','CLOSED','DISABLED']), updatedAt: z.string().datetime(), assignmentId: text.nullable(), assignmentLabel: text.nullable(), locationId: text.nullable(), locationLabel: text.nullable() }).strict();
export const preparedActionSchema = z.object({ preparationId: z.string().uuid(), actionType: actionTypeSchema, requestedBy: text, conversationId: z.string().uuid(), createdAt: z.string().datetime(), expiresAt: z.string().datetime(), state: actionStateSchema, title: text,
  target: z.object({ kind: z.enum(['dealer','enquiry','inventory']), records: z.array(z.object({ id: text,label: text }).strict()).min(1).max(20) }).strict(),
  currentState: z.array(actionSnapshotSchema).min(1).max(20),
  proposedChange: z.object({ destination: actionSnapshotSchema.nullable(), status: z.enum(['NEW','IN_PROGRESS','CLOSED']).nullable(), reason: z.string().max(500).nullable() }).strict(),
  consequences: z.string().max(800), confirmationRequired: z.literal(true), previewDigest: z.string().regex(/^[a-f0-9]{64}$/), errorCode: z.string().max(80).nullable(),
}).strict();
export type PreparedAction = z.infer<typeof preparedActionSchema>;
export type ActionReference = z.infer<typeof actionReferenceSchema>;
export type ActionSnapshot = z.infer<typeof actionSnapshotSchema>;
export const confirmPreparedActionSchema = z.object({ preparationId: z.string().uuid(), confirm: z.literal(true), previewDigest: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const cancelPreparedActionSchema = z.object({ preparationId: z.string().uuid() }).strict();
