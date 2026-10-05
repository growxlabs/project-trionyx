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
  searchInventoryInputSchema,
  inventoryListResponseSchema,
  type SearchInventoryResult,
} from '../responses/schema';
import type { z } from 'zod';

export type SearchInventoryInput = z.input<typeof searchInventoryInputSchema>;

export async function searchInventory(
  input: SearchInventoryInput,
  user: Pick<SafeUser, 'id' | 'role' | 'status'> | null,
  listSerials = serialsRepository.list,
  productResolver?: ProductResolver,
  locationResolver?: LocationResolver
): Promise<SearchInventoryResult> {
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
  if (input.query) {
    filtersApplied.query = input.query;
  }

  const page = input.page ?? 1;
  const limit = input.limit ?? 20;

  const result = await listSerials({
    productId: targetProductId,
    locationId: targetLocationId,
    status: input.status as SerialStatus | undefined,
    search: input.query,
    page,
    limit,
  });

  const items = result.items.map((item) => ({
    id: item.id,
    serialNumber: item.serialNumber,
    product: {
      id: item.product?.id ?? item.productId,
      name: item.product?.name ?? 'Unknown Product',
    },
    status: item.status,
    location: item.location ? { id: item.location.id, name: item.location.name } : null,
    lastMovementAt: item.lastMovementAt ?? null,
  }));

  const response = inventoryListResponseSchema.parse({
    type: 'inventory_list',
    items,
    pageInfo: {
      total: result.total,
      page,
      limit,
      hasMore: page * limit < result.total,
    },
    filtersApplied,
  });

  return { success: true, response };
}
