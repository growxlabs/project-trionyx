import { preparedActionResponseSchema } from './prepared-actions';
export * from './prepared-actions';
import { warrantyExecutiveResponseSchemas } from './warranty-executive';
export * from './warranty-executive';
import { enquiryResponseSchemas } from './enquiries';
import { z } from 'zod';
import { dealerNetworkResponseSchemas } from './dealer-network';
export * from './dealer-network';

export const serialInputSchema = z.object({ serialNumber: z.string().max(256) }).strict();

// Match the existing repository's normalization, without inventing a serial format.
export function normalizeSerial(value: string): string {
  const serial = value.trim().toUpperCase();
  if (serial.length < 2 || serial.length > 256 || /[\u0000-\u001f\u007f]/.test(serial)) throw new Error('INVALID_SERIAL');
  return serial;
}

export const serialRecordSchema = z.object({
  id: z.string().max(4000).min(1),
  serialNumber: z.string().max(4000).min(1),
  productName: z.string().max(4000),
  status: z.enum(['AVAILABLE', 'TRANSFERRED', 'INACTIVE']),
  locationName: z.string().max(4000).nullable(),
  lastMovementAt: z.string().max(4000).nullable(),
}).strict();

export const actionSchema = z.object({
  type: z.literal('open_serial'),
  serialId: z.string().max(4000).min(1),
  label: z.literal('Open serial'),
}).strict();

export const searchInventoryInputSchema = z.object({
  query: z.string().max(4000).trim().max(100).optional(),
  productId: z.string().max(4000).trim().min(1).max(100).optional(),
  productName: z.string().max(4000).trim().max(100).optional(),
  locationId: z.string().max(4000).trim().min(1).max(100).optional(),
  locationName: z.string().max(4000).trim().max(100).optional(),
  status: z.enum(['AVAILABLE', 'TRANSFERRED', 'INACTIVE']).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
  page: z.number().int().min(1).max(100000).optional().default(1),
}).strict();

export const inventorySummaryInputSchema = z.object({
  productId: z.string().max(4000).trim().min(1).max(100).optional(),
  productName: z.string().max(4000).trim().max(100).optional(),
  locationId: z.string().max(4000).trim().min(1).max(100).optional(),
  locationName: z.string().max(4000).trim().max(100).optional(),
  status: z.enum(['AVAILABLE', 'TRANSFERRED', 'INACTIVE']).optional(),
  groupBy: z.enum(['product', 'location', 'status']),
}).strict();

export const recentSerialMovementsInputSchema = z.object({
  productId: z.string().max(4000).trim().min(1).max(100).optional(),
  productName: z.string().max(4000).trim().max(100).optional(),
  locationId: z.string().max(4000).trim().min(1).max(100).optional(),
  locationName: z.string().max(4000).trim().max(100).optional(),
  movementType: z.enum(['RECEIVED', 'TRANSFERRED', 'ADJUSTED']).optional(),
  fromDate: z.string().max(4000).regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/).optional(),
  toDate: z.string().max(4000).regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
  page: z.number().int().min(1).max(100000).optional().default(1),
}).strict();

export const inventoryExceptionsInputSchema = z.object({}).strict();

// Response Subschemas
export const serialRecordResponseSchema = z.object({
  type: z.literal('serial_record'),
  serialRecord: serialRecordSchema,
  actions: z.array(actionSchema).length(1),
}).strict();

export const inventoryItemSchema = z.object({
  id: z.string().max(4000),
  serialNumber: z.string().max(4000),
  product: z.object({ id: z.string().max(4000), name: z.string().max(4000) }),
  status: z.enum(['AVAILABLE', 'TRANSFERRED', 'INACTIVE']),
  location: z.object({ id: z.string().max(4000), name: z.string().max(4000) }).nullable(),
  lastMovementAt: z.string().max(4000).nullable(),
}).strict();

export const inventoryListResponseSchema = z.object({
  type: z.literal('inventory_list'),
  items: z.array(inventoryItemSchema).max(50),
  pageInfo: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
  }),
  filtersApplied: z.record(z.string().max(4000), z.unknown()).optional(),
}).strict();

export const summaryGroupSchema = z.object({
  key: z.string().max(4000),
  label: z.string().max(4000),
  count: z.number(),
}).strict();

export const inventorySummaryResponseSchema = z.object({
  type: z.literal('inventory_summary'),
  total: z.number(),
  groupBy: z.enum(['product', 'location', 'status']),
  groups: z.array(summaryGroupSchema).max(500),
  filtersApplied: z.record(z.string().max(4000), z.unknown()).optional(),
}).strict();

export const movementItemSchema = z.object({
  id: z.string().max(4000),
  serialId: z.string().max(4000),
  serialNumber: z.string().max(4000),
  productName: z.string().max(4000),
  movementType: z.enum(['RECEIVED', 'TRANSFERRED', 'ADJUSTED']),
  fromLocationName: z.string().max(4000).nullable(),
  toLocationName: z.string().max(4000).nullable(),
  actorDisplayName: z.string().max(4000).nullable(),
  occurredAt: z.string().max(4000),
}).strict();

export const serialMovementResponseSchema = z.object({
  type: z.literal('serial_movements'),
  items: z.array(movementItemSchema).max(50),
  pageInfo: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
  }),
}).strict();

export const exceptionItemSchema = z.object({
  type: z.enum(['ZERO_AVAILABLE_STOCK', 'INACTIVE_LOCATION_STOCK', 'ORPHAN_SERIAL_LOCATION']),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
  label: z.string().max(4000),
  description: z.string().max(4000),
  recordType: z.enum(['product', 'location', 'serial']),
  recordId: z.string().max(4000),
  count: z.number().optional(),
}).strict();

export const inventoryExceptionResponseSchema = z.object({
  type: z.literal('inventory_exceptions'),
  totalExceptions: z.number(),
  items: z.array(exceptionItemSchema).max(500),
}).strict();

export const messageResponseSchema = z.object({
  type: z.literal('message'),
  summary: z.string().max(4000),
  errorCode: z.string().max(4000).optional(),
}).strict();

export const responseSchema = z.discriminatedUnion('type', [
  serialRecordResponseSchema,
  inventoryListResponseSchema,
  inventorySummaryResponseSchema,
  serialMovementResponseSchema,
  inventoryExceptionResponseSchema,
  messageResponseSchema,
  ...dealerNetworkResponseSchemas,
  ...enquiryResponseSchemas,
  ...warrantyExecutiveResponseSchemas,
  preparedActionResponseSchema,
]);

export type TrixResponse = z.infer<typeof responseSchema>;
export type SerialRecord = z.infer<typeof serialRecordSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type SummaryGroup = z.infer<typeof summaryGroupSchema>;
export type MovementItem = z.infer<typeof movementItemSchema>;
export type ExceptionItem = z.infer<typeof exceptionItemSchema>;

export type LookupResult =
  | { found: true; serial: SerialRecord }
  | { found: false; serialNumber: string }
  | { errorCode: string };

export type SearchInventoryResult =
  | { success: true; response: z.infer<typeof inventoryListResponseSchema> }
  | { success: false; errorCode: string; message: string };

export type InventorySummaryResult =
  | { success: true; response: z.infer<typeof inventorySummaryResponseSchema> }
  | { success: false; errorCode: string; message: string };

export type SerialMovementsResult =
  | { success: true; response: z.infer<typeof serialMovementResponseSchema> }
  | { success: false; errorCode: string; message: string };

export type InventoryExceptionsResult =
  | { success: true; response: z.infer<typeof inventoryExceptionResponseSchema> }
  | { success: false; errorCode: string; message: string };

export type ActivityStep = {
  toolName: string;
  status: 'succeeded' | 'failed';
  durationMs: number;
  summary: string;
  inputSummary: string;
  resultSummary: string;
};

export type TrixExecution = {
  requestId: string;
  conversationId: string;
  response: TrixResponse;
  activity: ActivityStep[];
};

export const requestSchema = z.object({
  conversationId: z.string().max(4000).uuid(),
  message: z.string().max(4000).trim().min(1).max(2000),
}).strict();

export function serialRoute(action: unknown, record: SerialRecord): string {
  const parsed = actionSchema.parse(action);
  if (parsed.serialId !== record.id) throw new Error('INVALID_ACTION');
  return `/inventory/serials/${encodeURIComponent(parsed.serialId)}`;
}

export function responseFromLookup(result: LookupResult): TrixResponse {
  if ('errorCode' in result) return { type: 'message', summary: 'TRIX could not check that serial right now. Try again.', errorCode: result.errorCode };
  if (!result.found) return { type: 'message', summary: `No inventory record was found for serial ${result.serialNumber}.`, errorCode: 'SERIAL_NOT_FOUND' };
  const serialRecord = serialRecordSchema.parse(result.serial);
  return responseSchema.parse({
    type: 'serial_record',
    serialRecord,
    actions: [{ type: 'open_serial', serialId: serialRecord.id, label: 'Open serial' }],
  });
}
