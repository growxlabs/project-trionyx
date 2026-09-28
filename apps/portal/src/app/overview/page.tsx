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

  // Compute Inventory metrics
  const availableUnits = inventorySummaries.reduce((sum, s) => sum + s.availableCount, 0);
  const outOfStockProducts = inventorySummaries.filter((s) => s.availableCount === 0);
  const lowStockProducts = inventorySummaries.filter((s) => s.availableCount > 0 && s.availableCount <= 5);

  // Compute Enquiry metrics
  const newEnquiries = enquiriesRes.items.filter((e) => e.status === 'NEW').length;

  // Compute Warranty metrics
  const voidWarranties = warrantiesRes.items.filter((w) => w.status === 'VOID').length;

  // 1. Summary Strip Metrics (tightened, no filler secondary text)
  const summaryMetrics: SummaryMetric[] = [
    {
      label: 'ACTIVE DEALERS',
      value: activeDealers,
      tone: 'default',
    },
    {
      label: 'PRODUCTS',
      value: productsRes.length,
      tone: 'default',
    },
    {
      label: 'AVAILABLE UNITS',
      value: availableUnits,
      tone: availableUnits > 0 ? 'positive' : 'alert',
    },
    {
      label: 'NEW ENQUIRIES',
      value: newEnquiries,
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

  // 3. Activity Ledger (Audit Events)
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));
  const activities: ActivityEntry[] = auditLogs.map((log) => {
    const dateObj = new Date(log.createdAt);
    const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });

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
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  return (
    <InternalShell user={user}>
      {/* 1. Simplified Single-Line Header */}
      <WorkspaceHeader
        title="Operations Overview"
        meta={<span className="font-mono text-[11.5px] text-[var(--text-muted)]">{todayDateString} · IST (UTC+05:30)</span>}
      />

      {/* 2. Tightened Integrated Operating Metrics Ribbon */}
      <OperationalSummaryStrip metrics={summaryMetrics} />

      {/* 3. Workspace Flow */}
      <div className="space-y-4">
        {/* Attention Required Queue */}
        <AttentionQueue
          items={attentionItems}
          title="ATTENTION REQUIRED"
          emptyMessage="All operations are currently running within normal thresholds."
        />

        {/* Today's Operations Ledger */}
        <ActivityLedger
          activities={activities}
          title="TODAY'S OPERATIONS"
        />
      </div>
    </InternalShell>
  );
}
