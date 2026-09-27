import type { SafeUser, InternalOverview, OverviewActivity, AuditEvent, AttentionItem } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import {
  auditLogsRepository,
  usersRepository,
  serialsRepository,
  dealersRepository,
  ensureDatabaseReady,
} from '@trionyx/database';

export { formatRoleLabel };

/**
 * Maps raw system audit event types to human-readable activity descriptions.
 */
export function formatActivityLabel(event: AuditEvent, metadataStr?: string | null): string {
  switch (event) {
    case 'LOGIN_SUCCESS':
      return 'Signed in to Operations';
    case 'LOGOUT':
      return 'Signed out';
    case 'USER_BOOTSTRAPPED':
      return 'Internal account provisioned via CLI';
    case 'ACCOUNT_LOCKED':
      return 'Temporary lockout triggered (security policy)';
    case 'LOGIN_FAILURE':
      return 'Failed sign-in attempt recorded';
    case 'PASSWORD_RESET_REQUESTED':
      return 'Password reset requested';
    case 'PASSWORD_RESET_COMPLETED':
      return 'Password reset completed';
    case 'PRODUCT_CREATED':
      return 'Product created';
    case 'PRODUCT_UPDATED':
      return 'Product updated';
    case 'PRODUCT_ARCHIVED':
      return 'Product archived';
    case 'SERIAL_RECEIVED':
      return 'Serial units received into inventory';
    case 'SERIAL_ADDED':
      return 'Serial unit registered';
    case 'SERIAL_STATUS_CHANGED':
      return 'Serial unit status adjusted';
    case 'SERIAL_TRANSFERRED':
      return 'Serial units transferred between facilities';
    case 'INVENTORY_LOCATION_CREATED':
      return 'Inventory location created';
    case 'INVENTORY_LOCATION_UPDATED':
      return 'Inventory location updated';
    case 'DEALER_CREATED':
      return 'Dealer registered';
    case 'DEALER_UPDATED':
      return 'Dealer details updated';
    case 'DEALER_STATUS_CHANGED':
      return 'Dealer status updated';
    case 'DEALER_DISTRIBUTOR_ASSIGNED':
      return 'Dealer assigned to distributor';
    case 'DEALER_DISTRIBUTOR_REASSIGNED':
      return 'Dealer distributor reassigned';
    case 'DISTRIBUTOR_CREATED':
      return 'Distributor registered';
    case 'DISTRIBUTOR_UPDATED':
      return 'Distributor details updated';
    case 'DISTRIBUTOR_STATUS_CHANGED':
      return 'Distributor status updated';
    case 'DEALER_REQUEST_CREATED':
      return 'Dealer request logged';
    case 'DEALER_REQUEST_UPDATED':
      return 'Dealer request updated';
    case 'DEALER_REQUEST_RESOLVED':
      return 'Dealer request resolved';
    case 'INTERNAL_NOTE_CREATED':
      return 'Internal note added';
    case 'DEALER_USER_INVITED':
      return 'Dealer user invited';
    case 'DEALER_USER_ACTIVATED':
      return 'Dealer user account activated';
    case 'DEALER_USER_DISABLED':
      return 'Dealer user access disabled';
    case 'DEALER_USER_ENABLED':
      return 'Dealer user access enabled';
    case 'DEALER_LOGIN_SUCCESS':
      return 'Dealer signed in';
    case 'DEALER_LOGIN_FAILURE':
      return 'Dealer sign-in failed';
    case 'DEALER_LOGOUT':
      return 'Dealer signed out';
    case 'DEALER_ACCOUNT_UPDATED':
      return 'Dealer account updated';
    case 'DEALER_PASSWORD_CHANGED':
      return 'Dealer password updated';
    case 'DEALER_PASSWORD_RESET_REQUESTED':
      return 'Dealer password reset requested';
    case 'DEALER_PASSWORD_RESET_COMPLETED':
      return 'Dealer password reset completed';
    case 'DEALER_REQUEST_MESSAGE_CREATED':
      return 'Dealer request message posted';
    default:
      return event;
  }
}

/**
 * Core domain service retrieving authoritative overview data for the authenticated operator.
 * Directives:
 * - Connect real live inventory low-stock count and attention alerts.
 * - Populate Recent Activity strictly from real persisted audit events.
 * - Keep unfinished modules (Dealers, Orders, Pending Actions) strictly null without fabrication.
 */
export async function getInternalOverview(user: SafeUser): Promise<InternalOverview> {
  await ensureDatabaseReady();

  // 1. Fetch real persisted audit events
  const rawLogs = await auditLogsRepository.list({ limit: 8 });

  // 2. Resolve actor details when possible
  const activities: OverviewActivity[] = [];
  for (const log of rawLogs) {
    let actorName: string | undefined = undefined;
    let actorEmail: string | undefined = undefined;

    if (log.userId) {
      if (log.userId === user.id) {
        actorName = user.name;
        actorEmail = user.email;
      } else {
        const actor = await usersRepository.findById(log.userId);
        if (actor) {
          actorName = actor.name;
          actorEmail = actor.email;
        }
      }
    } else if (log.metadata) {
      try {
        const meta = JSON.parse(log.metadata);
        if (meta.email) actorEmail = meta.email;
      } catch {
        // Ignore unparseable metadata
      }
    }

    activities.push({
      id: log.id,
      type: log.event,
      label: formatActivityLabel(log.event, log.metadata),
      actorName: actorName || actorEmail || 'System Operator',
      actorEmail,
      createdAt: log.createdAt,
    });
  }

  // 3. Real live zero-stock count from serial records
  let zeroStockCount: number | null = null;
  const attentionItems: AttentionItem[] = [];

  try {
    const summaries = await serialsRepository.listProductInventorySummaries();
    const zeroStockProducts = summaries.filter((s) => s.availableCount === 0);
    zeroStockCount = zeroStockProducts.length;

    for (const item of zeroStockProducts.slice(0, 5)) {
      attentionItems.push({
        id: `out-of-stock-${item.productId}`,
        type: 'OUT_OF_STOCK',
        label: `${item.productName} (${item.productCode}) — Out of stock (0 available serial units)`,
        href: `/products/${item.productId}`,
      });
    }
  } catch (err) {
    console.error('Failed to query inventory summaries for overview:', err);
  }

  // 4. Real live active dealers count (scoped if distributor role)
  let activeDealersCount: number | null = null;
  try {
    const distributorScope = user.role === 'DISTRIBUTOR' ? user.distributorId : null;
    activeDealersCount = await dealersRepository.countActive(distributorScope);
  } catch (err) {
    console.error('Failed to query active dealers for overview:', err);
  }

  // 5. Summary metrics: Unfinished modules remain null; lowStock and activeDealers reflect real data
  const summary = {
    activeDealers: activeDealersCount,
    orders: null,
    lowStock: zeroStockCount,
    pendingActions: null,
  };

  return {
    user,
    summary,
    recentActivity: activities,
    attentionItems,
  };
}
