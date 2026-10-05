import { serialMovementsRepository } from '@trionyx/database';
import type { SafeUser, SerialMovementType } from '@trionyx/types';
import { assertManagingDirector } from './lookup-serial';
import {
  resolveProductTarget,
  resolveLocationTarget,
  type ProductResolver,
  type LocationResolver,
} from './resolvers';
import {
  recentSerialMovementsInputSchema,
  serialMovementResponseSchema,
  type SerialMovementsResult,
} from '../responses/schema';
import type { z } from 'zod';

export type RecentSerialMovementsInput = z.input<typeof recentSerialMovementsInputSchema>;

export async function getRecentSerialMovements(
  input: RecentSerialMovementsInput,
  user: Pick<SafeUser, 'id' | 'role' | 'status'> | null,
  listMovements = serialMovementsRepository.listWithDetailsAndCount,
  productResolver?: ProductResolver,
  locationResolver?: LocationResolver
): Promise<SerialMovementsResult> {
  assertManagingDirector(user);

  let targetProductId = input.productId;
  let targetLocationId = input.locationId;

  if (input.productName) {
    const pRes = await resolveProductTarget(
      { productId: input.productId, productName: input.productName },
      productResolver
    );
    if (!pRes.success) {
      return { success: false, errorCode: pRes.errorCode, message: pRes.message };
    }
    targetProductId = pRes.productId;
  } else if (input.productId) {
    targetProductId = input.productId;
  }

  if (input.locationName) {
    const lRes = await resolveLocationTarget(
      { locationId: input.locationId, locationName: input.locationName },
      locationResolver
    );
    if (!lRes.success) {
      return { success: false, errorCode: lRes.errorCode, message: lRes.message };
    }
    targetLocationId = lRes.locationId;
  } else if (input.locationId) {
    targetLocationId = input.locationId;
  }

  if (input.fromDate && input.toDate) {
    if (new Date(input.fromDate).getTime() > new Date(input.toDate).getTime()) {
      return {
        success: false,
        errorCode: 'TRIX_INVALID_REQUEST',
        message: 'Invalid date range: fromDate cannot be after toDate.',
      };
    }
  }

  const page = input.page ?? 1;
  const limit = input.limit ?? 20;

  const result = await listMovements({
    productId: targetProductId,
    locationId: targetLocationId,
    type: input.movementType as SerialMovementType | undefined,
    fromDate: input.fromDate,
    toDate: input.toDate,
    page,
    limit,
  });

  const items = result.items.map((m) => ({
    id: m.id,
    serialId: m.serialRecordId,
    serialNumber: m.serialNumber ?? 'Unknown Serial',
    productName: m.productName ?? 'Unknown Product',
    movementType: m.type,
    fromLocationName: m.fromLocationName ?? null,
    toLocationName: m.toLocationName ?? null,
    actorDisplayName: m.actorName ?? null,
    occurredAt: m.createdAt,
  }));

  const response = serialMovementResponseSchema.parse({
    type: 'serial_movements',
    items,
    pageInfo: {
      total: result.total,
      page,
      limit,
      hasMore: page * limit < result.total,
    },
  });

  return { success: true, response };
}
