import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  dealersRepository,
  productsRepository,
  serialsRepository,
  contactEnquiriesRepository,
  warrantiesRepository,
  auditLogsRepository,
  usersRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../components/shell/InternalShell';
import {
  WorkspaceHeader,
  OperationalSummaryStrip,
  AttentionQueue,
  ActivityLedger,
  type AttentionItem,
  type ActivityEntry,
  type SummaryMetric,
} from '../../components/workspace';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;
  await ensureDatabaseReady();

  // Fetch real authoritative data across all operational domains
  const [
    dealersRes,
    productsRes,
    inventorySummaries,
    enquiriesRes,
    warrantiesRes,
    auditLogs,
    allUsers,
  ] = await Promise.all([
    dealersRepository.list({ limit: 500 }),
    productsRepository.list({ limit: 500 }),
    serialsRepository.listProductInventorySummaries().catch(() => []),
    contactEnquiriesRepository.list({ limit: 500 }).catch(() => ({ items: [], total: 0 })),
    warrantiesRepository.list({ limit: 500 }).catch(() => ({ items: [], total: 0 })),
    auditLogsRepository.list({ limit: 12 }),
    usersRepository.listInternalUsers().catch(() => []),
  ]);

  // Compute Dealer metrics
  const activeDealers = dealersRes.items.filter((d) => d.status === 'ACTIVE').length;
  const unassignedDealers = dealersRes.items.filter((d) => !d.distributorId).length;
  const inactiveDealers = dealersRes.items.filter((d) => d.status === 'INACTIVE').length;

  // Compute Inventory metrics
  const availableUnits = inventorySummaries.reduce((sum, s) => sum + s.availableCount, 0);
  const outOfStockProducts = inventorySummaries.filter((s) => s.availableCount === 0);
  const lowStockProducts = inventorySummaries.filter((s) => s.availableCount > 0 && s.availableCount <= 5);

  // Compute Enquiry metrics
  const newEnquiries = enquiriesRes.items.filter((e) => e.status === 'NEW').length;

  // Compute Warranty metrics
  const activeWarranties = warrantiesRes.items.filter((w) => w.status === 'ACTIVE').length;
  const voidWarranties = warrantiesRes.items.filter((w) => w.status === 'VOID').length;

  // 1. Summary Strip Metrics
  const summaryMetrics: SummaryMetric[] = [
    {
      label: 'ACTIVE DEALERS',
      value: activeDealers,
      detail: `${dealersRes.total} total`,
      tone: 'default',
    },
    {
      label: 'PRODUCTS',
      value: productsRes.length,
      detail: 'Registered formulas',
      tone: 'default',
    },
    {
      label: 'AVAILABLE UNITS',
      value: availableUnits,
      detail: 'In stock',
      tone: availableUnits > 0 ? 'positive' : 'alert',
    },
    {
      label: 'NEW ENQUIRIES',
      value: newEnquiries,
      detail: 'Awaiting triage',
      tone: newEnquiries > 0 ? 'warning' : 'default',
    },
  ];

  // 2. Attention Required Queue
  const attentionItems: AttentionItem[] = [];

  if (outOfStockProducts.length > 0) {
    attentionItems.push({
      id: 'out-of-stock-alert',
      priority: 'HIGH',
      area: 'Inventory',
      issue: `${outOfStockProducts.length} ${outOfStockProducts.length === 1 ? 'product is' : 'products are'} completely out of stock`,
      actionLabel: 'Review →',
      actionHref: '/inventory',
    });
  }

  if (unassignedDealers > 0) {
    attentionItems.push({
      id: 'unassigned-dealers-alert',
      priority: 'HIGH',
      area: 'Dealers',
      issue: `${unassignedDealers} ${unassignedDealers === 1 ? 'dealer lacks' : 'dealers lack'} an assigned wholesale distributor`,
      actionLabel: 'Assign →',
      actionHref: '/dealers',
    });
  }

  if (newEnquiries > 0) {
    attentionItems.push({
      id: 'new-enquiries-alert',
      priority: 'MEDIUM',
      area: 'Enquiries',
      issue: `${newEnquiries} new inbound ${newEnquiries === 1 ? 'enquiry requires' : 'enquiries require'} operator review`,
      actionLabel: 'Review →',
      actionHref: '/enquiries',
    });
  }

  if (voidWarranties > 0) {
    attentionItems.push({
      id: 'void-warranties-alert',
      priority: 'MEDIUM',
      area: 'Warranty',
      issue: `${voidWarranties} customer ${voidWarranties === 1 ? 'warranty is' : 'warranties are'} flagged as voided`,
      actionLabel: 'Review →',
      actionHref: '/warranty',
    });
  }

  if (lowStockProducts.length > 0 && outOfStockProducts.length === 0) {
    attentionItems.push({
      id: 'low-stock-alert',
      priority: 'LOW',
      area: 'Inventory',
      issue: `${lowStockProducts.length} ${lowStockProducts.length === 1 ? 'product has' : 'products have'} low inventory (≤ 5 units)`,
      actionLabel: 'Check →',
      actionHref: '/inventory',
    });
  }

  // 3. Activity Ledger (Real Persisted Audit Events)
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));
  const activities: ActivityEntry[] = auditLogs.map((log) => {
    const dateObj = new Date(log.createdAt);
    const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });

    // Parse event details
    let recordLabel = 'System Event';
    let recordHref: string | undefined = undefined;

    if (log.metadata) {
      try {
        const meta = JSON.parse(log.metadata);
        if (meta.productName || meta.productCode) {
          recordLabel = meta.productName || meta.productCode;
          if (meta.productId) recordHref = `/products/${meta.productId}`;
        } else if (meta.businessName || meta.dealerCode) {
          recordLabel = meta.businessName || meta.dealerCode;
          if (meta.dealerId) recordHref = `/dealers/${meta.dealerId}`;
        } else if (meta.enquiryCode) {
          recordLabel = meta.enquiryCode;
          if (meta.enquiryId) recordHref = `/enquiries/${meta.enquiryId}`;
        } else if (meta.serialNumber) {
          recordLabel = meta.serialNumber;
        } else if (meta.email) {
          recordLabel = meta.email;
        }
      } catch {
        // ignore
      }
    }

    const eventName = log.event
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const actor = log.userId ? userMap.get(log.userId) || 'Operator' : 'System';

    return {
      id: log.id,
      time: timeFormatted,
      event: eventName,
      record: recordLabel,
      recordHref,
      actor,
    };
  });

  const todayDateString = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  return (
    <InternalShell user={user}>
      {/* Workspace Header */}
      <WorkspaceHeader
        eyebrow="OPERATIONS CONTEXT"
        title="Operations Overview"
        meta={<span className="font-mono text-[13px] text-[var(--text-muted)]">{todayDateString}</span>}
        description="Unified operational control room tracking network health, physical inventory positions, inbound enquiries, and warranty activations."
      />

      {/* 1. Operating Metrics Strip */}
      <OperationalSummaryStrip metrics={summaryMetrics} />

      {/* 2. Attention Required Queue */}
      <AttentionQueue
        items={attentionItems}
        title="ATTENTION REQUIRED"
        subtitle="Priority operational items requiring management decisions or operator action."
        emptyMessage="All operations are currently running within normal thresholds."
      />

      {/* 3. Today's Operations Ledger */}
      <ActivityLedger
        activities={activities}
        title="TODAY'S OPERATIONS"
        subtitle="Chronological audit stream of internal and network events."
      />

      {/* 4. Network / Stock Snapshot */}
      <section aria-labelledby="snapshot-heading" className="mb-8">
        <h2 id="snapshot-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2.5">
          NETWORK &amp; STOCK SNAPSHOT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dealer Network Snapshot */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] m-0">
              Dealer Network
            </h3>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5 mb-4">
              Regional partner network coverage and wholesale assignments
            </p>
            <dl className="grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4 text-center sm:text-left">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">Active</dt>
                <dd className="mt-1.5 text-[24px] font-semibold text-[var(--status-success)] leading-none">{activeDealers}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">Unassigned</dt>
                <dd className="mt-1.5 text-[24px] font-semibold text-[var(--status-warning)] leading-none">{unassignedDealers}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">Inactive</dt>
                <dd className="mt-1.5 text-[24px] font-semibold text-[var(--text-muted)] leading-none">{inactiveDealers}</dd>
              </div>
            </dl>
          </div>

          {/* Inventory Snapshot */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] m-0">
              Physical Inventory
            </h3>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5 mb-4">
              Warehouse stock positions and critical replenishment thresholds
            </p>
            <dl className="grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4 text-center sm:text-left">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">Available Units</dt>
                <dd className="mt-1.5 text-[24px] font-semibold text-[var(--status-success)] leading-none">{availableUnits}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">Low Stock</dt>
                <dd className="mt-1.5 text-[24px] font-semibold text-[var(--status-warning)] leading-none">{lowStockProducts.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">Out of Stock</dt>
                <dd className="mt-1.5 text-[24px] font-semibold text-[var(--status-danger)] leading-none">{outOfStockProducts.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </InternalShell>
  );
}
