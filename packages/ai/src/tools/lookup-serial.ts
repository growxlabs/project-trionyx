import { inventoryService } from '@trionyx/api';
import type { SafeUser } from '@trionyx/types';
import { normalizeSerial, serialRecordSchema, type LookupResult } from '../responses/schema';

export function assertManagingDirector(user?: Pick<SafeUser, 'id' | 'role' | 'status'> | null): void {
  if (!user) throw new Error('UNAUTHENTICATED');
  if (user.role !== 'MANAGING_DIRECTOR' || user.status !== 'ACTIVE') throw new Error('FORBIDDEN');
}

export async function lookupSerial(
  input: { serialNumber: string },
  user: Pick<SafeUser, 'id' | 'role' | 'status'> | null,
  readSerial = inventoryService.getSerialByNumber,
): Promise<LookupResult> {
  assertManagingDirector(user);
  const serialNumber = normalizeSerial(input.serialNumber);
  const record = await readSerial(serialNumber);
  if (!record || !record.product?.name) return { found: false, serialNumber };
  return { found: true, serial: serialRecordSchema.parse({
    id: record.id, serialNumber: record.serialNumber, productName: record.product.name,
    status: record.status, locationName: record.location?.name ?? null,
    lastMovementAt: record.movements?.[0]?.createdAt ?? null,
  }) };
}
