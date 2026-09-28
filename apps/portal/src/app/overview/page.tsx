import React from 'react';
import Link from 'next/link';
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

  // Authoritative operational queries across all ERP master tables
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
    auditLogsRepository.list({ limit: 14 }),
    usersRepository.listInternalUsers().catch(() => []),
  ]);

  // Derived metrics
  const activeDealers = dealersRes.items.filter((d) => d.status === 'ACTIVE').length;
  const unassignedDealers = dealersRes.items.filter((d) => !d.distributorId).length;

  const availableUnits = inventorySummaries.reduce((sum, s) => sum + s.availableCount, 0);
  const outOfStockProducts = inventorySummaries.filter((s) => s.availableCount === 0);

  const newEnquiries = enquiriesRes.items.filter((e) => e.status === 'NEW').length;
  const voidWarranties = warrantiesRes.items.filter((w) => w.status === 'VOID').length;
  const totalWarranties = warrantiesRes.items.length;

  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  // Document journal stream
  const activities = auditLogs.map((log) => {
    const dateObj = new Date(log.createdAt);
    const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });

    let recordLabel = 'SYS_EVENT';
    let recordHref: string | undefined = undefined;

    if (log.metadata) {
      try {
        const meta = JSON.parse(log.metadata);
        if (meta.productCode || meta.productName) {
          recordLabel = meta.productCode || meta.productName;
          if (meta.productId) recordHref = `/products/${meta.productId}`;
        } else if (meta.dealerCode || meta.businessName) {
          recordLabel = meta.dealerCode || meta.businessName;
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

    const actor = log.userId ? userMap.get(log.userId) || 'OPERATOR' : 'SYSTEM';

    return {
      id: log.id,
      time: timeFormatted,
      event: log.event,
      record: recordLabel,
      recordHref,
      actor,
    };
  });

  const todayDateString = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  // NetSuite-style Reminders Portlet Items
  const reminders = [
    {
      id: 'rem-stock-out',
      count: outOfStockProducts.length,
      label: 'Products Out of Stock',
      severity: 'CRITICAL',
      badgeColor: 'text-[var(--status-danger)] bg-[var(--status-danger-soft)] border-[var(--status-danger-border)]',
      href: '/inventory',
    },
    {
      id: 'rem-dealers-unassigned',
      count: unassignedDealers,
      label: 'Studios Missing Distributor Hub',
      severity: 'ACTION',
      badgeColor: 'text-[var(--status-warning)] bg-[var(--status-warning-soft)] border-[var(--status-warning-border)]',
      href: '/dealers',
    },
    {
      id: 'rem-enquiries-new',
      count: newEnquiries,
      label: 'Partner Applications Pending Triage',
      severity: 'PENDING',
      badgeColor: 'text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent-soft-border)]',
      href: '/enquiries',
    },
    {
      id: 'rem-warranties-void',
      count: voidWarranties,
      label: 'Voided Customer Warranties',
      severity: voidWarranties > 0 ? 'ALERT' : 'CLEARED',
      badgeColor: voidWarranties > 0
        ? 'text-[var(--status-danger)] bg-[var(--status-danger-soft)] border-[var(--status-danger-border)]'
        : 'text-[var(--status-success)] bg-[var(--status-success-soft)] border-[var(--status-success-border)]',
      href: '/warranty',
    },
  ];

  return (
    <InternalShell user={user}>
      <div>
        {/* DUAL-COLUMN ERP WORK CENTER DESK */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
          {/* ======================================================== */}
          {/* LEFT COLUMN (4 COLS): REMINDERS + QUICK TRANSACTION LAUNCHPAD */}
          {/* ======================================================== */}
          <div className="xl:col-span-4 space-y-3.5">
            {/* PORTLET 1: OPERATIONAL REMINDERS (NetSuite Core Pattern) */}
            <div className="border border-[var(--border)] bg-[var(--surface-raised)] rounded-[3px] overflow-hidden">
              <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-3 py-2 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                  OPERATIONAL REMINDERS
                </span>
                <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded-[2px] bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-muted)]">
                  {reminders.filter((r) => r.count > 0).length} EXCEPTIONS
                </span>
              </div>

              <div className="p-1 space-y-0.5">
                {reminders.map((rem) => (
                  <Link
                    key={rem.id}
                    href={rem.href}
                    className="px-2.5 py-2 flex items-center justify-between gap-3 hover:bg-[var(--surface-subtle)] rounded-[2px] transition-colors group"
                  >
                    <span className="text-[12.5px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {rem.label}
                    </span>
                    <span className={`font-mono font-bold text-[12.5px] tabular-nums px-2 py-0.5 rounded-[2px] border ${rem.badgeColor}`}>
                      {rem.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* PORTLET 2: QUICK TRANSACTION LAUNCHPAD */}
            <div className="border border-[var(--border)] bg-[var(--surface-raised)] rounded-[3px] overflow-hidden">
              <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-3 py-2 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                  TRANSACTION LAUNCHPAD
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                  DIRECT ACTION
                </span>
              </div>

              <div className="p-2.5 grid grid-cols-2 gap-2 text-[12px]">
                <Link
                  href="/inventory"
                  className="btn-primary px-2.5 py-2 text-[12px] flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] font-bold text-white/90">[RCV]</span>
                  <span>Receive Serials</span>
                </Link>

                <Link
                  href="/dealers/new"
                  className="btn-secondary px-2.5 py-2 text-[12px] flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">[ONB]</span>
                  <span>Onboard Studio</span>
                </Link>

                <Link
                  href="/warranty"
                  className="btn-secondary px-2.5 py-2 text-[12px] flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">[VRF]</span>
                  <span>Verify Warranty</span>
                </Link>

                <Link
                  href="/distributors/new"
                  className="btn-secondary px-2.5 py-2 text-[12px] flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">[HUB]</span>
                  <span>Add Dist. Hub</span>
                </Link>

                <Link
                  href="/inventory/movements"
                  className="btn-secondary px-2.5 py-2 text-[12px] flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">[MOV]</span>
                  <span>Stock Movements</span>
                </Link>

                <Link
                  href="/enquiries"
                  className="btn-secondary px-2.5 py-2 text-[12px] flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">[TRG]</span>
                  <span>Triage Enquiries</span>
                </Link>
              </div>
            </div>

            {/* PORTLET 3: PHYSICAL WAREHOUSE CAPACITY SUMMARY */}
            <div className="border border-[var(--border)] bg-[var(--surface-raised)] rounded-[3px] overflow-hidden">
              <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-3 py-2 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                  PHYSICAL FACILITY POSITION
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                  RECONCILED
                </span>
              </div>
              <div className="p-3 space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Delhi Central Facility:</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{availableUnits} Units Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Stockout Formulas:</span>
                  <span className="font-mono font-bold text-[var(--status-danger)]">{outOfStockProducts.length} Breaches</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Master Catalog SKUs:</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{productsRes.length} Formulas</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)]/40 flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)]">Physical Inventory Health:</span>
                  <span className="font-semibold text-[var(--status-warning)]">REPLENISHMENT REQ.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (8 COLS): MASTER SCORECARD + DOCUMENT JOURNAL */}
          {/* ======================================================== */}
          <div className="xl:col-span-8 space-y-3.5">
            {/* PORTLET 4: MASTER OPERATIONAL SCORECARD (ERP Tabular Scorecard) */}
            <div className="border border-[var(--border)] bg-[var(--surface-raised)] rounded-[3px] overflow-hidden">
              <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-3.5 py-2 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                  MASTER OPERATING SCORECARD
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                  LIVE BALANCE RECONCILIATION
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      <th className="py-2 px-3.5">Operational Entity / Domain</th>
                      <th className="py-2 px-3.5 font-mono text-center w-28">Current Balance</th>
                      <th className="py-2 px-3.5 text-center w-36">Operating Status</th>
                      <th className="py-2 px-3.5 text-right w-36">Ledger Record</th>
                    </tr>
                  </thead>
                  <tbody className="font-normal">
                    <tr className="hover:bg-[var(--surface-subtle)] transition-colors h-[36px]">
                      <td className="py-2 px-3.5 font-medium text-[var(--text-primary)]">
                        Authorized Detailing Studios
                      </td>
                      <td className="py-2 px-3.5 font-mono font-bold text-center text-[var(--text-primary)] text-[12.5px]">
                        {activeDealers} <span className="text-[11px] font-normal text-[var(--text-muted)]">Studios</span>
                      </td>
                      <td className="py-2 px-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10.5px] font-semibold bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
                          ACTIVE (NORMAL)
                        </span>
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <Link href="/dealers" className="text-[11.5px] font-semibold text-[var(--accent)] hover:underline">
                          Studio Registry →
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-[var(--surface-subtle)] transition-colors h-[36px]">
                      <td className="py-2 px-3.5 font-medium text-[var(--text-primary)]">
                        Physical Serial Inventory
                      </td>
                      <td className="py-2 px-3.5 font-mono font-bold text-center text-[var(--status-danger)] text-[12.5px]">
                        {availableUnits} <span className="text-[11px] font-normal text-[var(--text-muted)]">Bottles</span>
                      </td>
                      <td className="py-2 px-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10.5px] font-semibold bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
                          CRITICAL LOW
                        </span>
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <Link href="/inventory" className="text-[11.5px] font-semibold text-[var(--accent)] hover:underline">
                          Stock Ledger →
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-[var(--surface-subtle)] transition-colors h-[36px]">
                      <td className="py-2 px-3.5 font-medium text-[var(--text-primary)]">
                        Registered Chemical Formulas
                      </td>
                      <td className="py-2 px-3.5 font-mono font-bold text-center text-[var(--text-primary)] text-[12.5px]">
                        {productsRes.length} <span className="text-[11px] font-normal text-[var(--text-muted)]">Formulas</span>
                      </td>
                      <td className="py-2 px-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10.5px] font-semibold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
                          CATALOG STABLE
                        </span>
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <Link href="/products" className="text-[11.5px] font-semibold text-[var(--accent)] hover:underline">
                          Product Master →
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-[var(--surface-subtle)] transition-colors h-[36px]">
                      <td className="py-2 px-3.5 font-medium text-[var(--text-primary)]">
                        Inbound Partner Enquiries
                      </td>
                      <td className="py-2 px-3.5 font-mono font-bold text-center text-[var(--status-warning)] text-[12.5px]">
                        {newEnquiries} <span className="text-[11px] font-normal text-[var(--text-muted)]">Pending</span>
                      </td>
                      <td className="py-2 px-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10.5px] font-semibold bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                          REQUIRES TRIAGE
                        </span>
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <Link href="/enquiries" className="text-[11.5px] font-semibold text-[var(--accent)] hover:underline">
                          Open Queue →
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-[var(--surface-subtle)] transition-colors h-[36px]">
                      <td className="py-2 px-3.5 font-medium text-[var(--text-primary)]">
                        Warranty Policies Under Coverage
                      </td>
                      <td className="py-2 px-3.5 font-mono font-bold text-center text-[var(--text-primary)] text-[12.5px]">
                        {totalWarranties} <span className="text-[11px] font-normal text-[var(--text-muted)]">Registered</span>
                      </td>
                      <td className="py-2 px-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10.5px] font-semibold bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
                          AUDITED
                        </span>
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <Link href="/warranty" className="text-[11.5px] font-semibold text-[var(--accent)] hover:underline">
                          Warranty Book →
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PORTLET 5: TRANSACTION AUDIT JOURNAL (ERP System of Record) */}
            <div className="border border-[var(--border)] bg-[var(--surface-raised)] rounded-[3px] overflow-hidden">
              <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-3.5 py-2 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                  TRANSACTION AUDIT JOURNAL · DOCUMENT FLOW
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                  APPEND-ONLY LEDGER
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      <th className="py-1.5 px-3.5 w-24">Timestamp</th>
                      <th className="py-1.5 px-3.5 w-52">Transaction Type</th>
                      <th className="py-1.5 px-3.5">Document / Record Ref</th>
                      <th className="py-1.5 px-3.5 w-36">Operator</th>
                      <th className="py-1.5 px-3.5 text-right w-24">Posting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05] font-normal">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[32px]">
                        <td className="py-1 px-3.5 font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                          {act.time}
                        </td>
                        <td className="py-1 px-3.5 font-semibold text-[var(--text-primary)] text-[11.5px] truncate">
                          {act.event}
                        </td>
                        <td className="py-1 px-3.5 text-[var(--text-secondary)]">
                          {act.recordHref ? (
                            <Link href={act.recordHref} className="font-mono text-[11px] text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline">
                              {act.record}
                            </Link>
                          ) : (
                            <span className="font-mono text-[11px] text-[var(--text-secondary)]">{act.record}</span>
                          )}
                        </td>
                        <td className="py-1 px-3.5 text-[var(--text-muted)] text-[11px] truncate">
                          {act.actor}
                        </td>
                        <td className="py-1 px-3.5 text-right">
                          <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                            POSTED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InternalShell>
  );
}
