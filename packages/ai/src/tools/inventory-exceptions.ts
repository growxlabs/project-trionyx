import { serialsRepository } from '@trionyx/database';
import type { SafeUser } from '@trionyx/types';
import { assertManagingDirector } from './lookup-serial';
import {
  inventoryExceptionResponseSchema,
  type InventoryExceptionsResult,
} from '../responses/schema';

export async function getInventoryExceptions(
  _input: Record<string, never>,
  user: Pick<SafeUser, 'id' | 'role' | 'status'> | null,
  readExceptions = serialsRepository.getInventoryExceptions
): Promise<InventoryExceptionsResult> {
  assertManagingDirector(user);

  const exceptions = await readExceptions();

  const response = inventoryExceptionResponseSchema.parse({
    type: 'inventory_exceptions',
    totalExceptions: exceptions.length,
    items: exceptions,
  });

  return { success: true, response };
}
