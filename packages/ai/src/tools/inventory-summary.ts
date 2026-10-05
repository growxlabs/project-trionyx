import { serialsRepository } from '@trionyx/database';
import type { SafeUser, SerialStatus } from '@trionyx/types';
import { assertManagingDirector } from './lookup-serial';
import {
  resolveProductTarget,
  resolveLocationTarget,
  type ProductResolver,
  type LocationResolver,
} from './resolvers';
import {
  inventorySummaryInputSchema,
  inventorySummaryResponseSchema,
  type InventorySummaryResult,
} from '../responses/schema';
import type { z } from 'zod';

export type InventorySummaryInput = z.infer<typeof inventorySummaryInputSchema>;

export async function getInventorySummary(
  input: InventorySummaryInput,
  user: Pick<SafeUser, 'id' | 'role' | 'status'> | null,
  readSummary = serialsRepository.getInventorySummary,
  productResolver?: ProductResolver,
  locationResolver?: LocationResolver
): Promise<InventorySummaryResult> {
  assertManagingDirector(user);

  let targetProductId = input.productId;
  let targetLocationId = input.locationId;
  const filtersApplied: Record<string, unknown> = {};

  if (input.productName) {
    const pRes = await resolveProductTarget(
      { productId: input.productId, productName: input.productName },
      productResolver
    );
    if (!pRes.success) {
      return { success: false, errorCode: pRes.errorCode, message: pRes.message };
    }
    targetProductId = pRes.productId;
    filtersApplied.productId = pRes.productId;
    filtersApplied.productName = pRes.productName;
  } else if (input.productId) {
    targetProductId = input.productId;
    filtersApplied.productId = input.productId;
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
    filtersApplied.locationId = lRes.locationId;
    filtersApplied.locationName = lRes.locationName;
  } else if (input.locationId) {
    targetLocationId = input.locationId;
    filtersApplied.locationId = input.locationId;
  }

  if (input.status) {
    filtersApplied.status = input.status;
  }

  const result = await readSummary({
    productId: targetProductId,
    locationId: targetLocationId,
    status: input.status as SerialStatus | undefined,
    groupBy: input.groupBy,
  });

  const response = inventorySummaryResponseSchema.parse({
    type: 'inventory_summary',
    total: result.total,
    groupBy: result.groupBy,
    groups: result.groups,
    filtersApplied,
  });

  return { success: true, response };
}
