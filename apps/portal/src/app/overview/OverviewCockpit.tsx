'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ControlBoardIcon } from '../../components/shell/OperationsIcons';
import { useRegisterWorkspaceViews, type WorkspaceViewsConfig, EmptyState, StatusBadge } from '../../components/workspace';
export type CockpitTab =
  | 'scorecard'
  | 'stockout'
  | 'unassigned-dealers'
  | 'enquiries'
  | 'audit-journal'
  | 'facility';

export interface ScorecardRow {
  label: string;
  balance: number;
  unit: string;
  status: string;
  statusType: 'success' | 'danger' | 'warning' | 'neutral';
  href: string;
  linkText: string;
}

export interface ActivityRow {
  id: string;
  time: string;
  event: string;
  record: string;
  recordHref?: string;
  actor: string;
}

export interface StockoutItem {
  productId: string;
  productCode: string;
  productName: string;
  categoryName?: string | null;
  availableCount: number;
}

export interface UnassignedDealerItem {
  id: string;
  dealerCode: string;
  businessName: string;
  city?: string | null;
  state?: string | null;
  status: string;
}

export interface EnquiryItem {
  id: string;
  enquiryCode: string;
  fullName: string;
  companyName?: string | null;
  type: string;
  city?: string | null;
  createdAt: string;
}

interface OverviewCockpitProps {
  scorecardRows: ScorecardRow[];
  activities: ActivityRow[];
  outOfStockProducts: StockoutItem[];
  unassignedDealers: UnassignedDealerItem[];
  newEnquiriesList: EnquiryItem[];
  facilityStats: {
    availableUnits: number;
    outOfStockCount: number;
    catalogSkus: number;
  };
}

export function OverviewCockpit({
  scorecardRows,
  activities,
  outOfStockProducts,
  unassignedDealers,
  newEnquiriesList,
  facilityStats,
}: OverviewCockpitProps) {
  const [activeTab, setActiveTab] = useState<CockpitTab>('scorecard');

  const totalActionable = outOfStockProducts.length + unassignedDealers.length + newEnquiriesList.length;

  const workspaceViews = useMemo<WorkspaceViewsConfig>(
    () => ({
      storageKey: 'trionyx-workspace-overview',
      activeId: activeTab,
      onSelect: (id: string) => setActiveTab(id as CockpitTab),
      sections: [
        {
          title: 'Exception Queues',
          meta: `${totalActionable} actionable`,
          items: [
            {
              id: 'stockout',
              label: 'Products Out of Stock',
              count: outOfStockProducts.length,
              countTone: outOfStockProducts.length > 0 ? 'danger' : 'default',
            },
            {
              id: 'unassigned-dealers',
              label: 'Studios Missing Hub',
              count: unassignedDealers.length,
              countTone: unassignedDealers.length > 0 ? 'warning' : 'default',
            },
            {
              id: 'enquiries',
              label: 'Partner Applications',
              count: newEnquiriesList.length,
              countTone: newEnquiriesList.length > 0 ? 'accent' : 'default',
            },
          ],
        },
        {
          title: 'Records',
          items: [
            { id: 'scorecard', label: 'Operations Summary', trailing: 'Live' },
            { id: 'audit-journal', label: 'Recent Operations', trailing: 'Logs' },
            { id: 'facility', label: 'Inventory by Location', trailing: 'Delhi' },
          ],
        },
      ],
    }),
    [activeTab, totalActionable, outOfStockProducts.length, unassignedDealers.length, newEnquiriesList.length]
  );
  useRegisterWorkspaceViews(workspaceViews);

  return (
    <div className="w-full">
      {/* ======================================================== */}
      {/* FOCUSED, HIGH-READABILITY WORKSPACE (view choice is in  */}
      {/* the secondary sidebar)                                  */}
      {/* ======================================================== */}
      <section className="w-full">
        {/* VIEW 1: OPERATIONS SUMMARY (SCORECARD) */}
        {activeTab === 'scorecard' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[13.5px] font-semibold text-[var(--text-primary)]">
                    <th className="py-3.5 px-4 font-semibold text-left">Operational Domain</th>
                    <th className="py-3.5 px-4 font-semibold text-left w-36">Current Balance</th>
                    <th className="py-3.5 px-4 font-semibold text-left w-40">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right w-40">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecardRows.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-3.5 px-4 text-[13.5px] font-medium text-[var(--text-primary)]">
                        {row.label}
                      </td>
                      <td className="py-3.5 px-4 text-[13.5px] font-semibold text-left text-[var(--text-primary)] font-sans">
                        {row.balance} <span className="text-[13px] font-normal text-[var(--text-secondary)] ml-1">{row.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <StatusBadge status={row.status} tone={row.statusType} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={row.href} className="text-[13px] font-medium text-[var(--accent)] hover:underline">
                          {row.linkText}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: PRODUCTS OUT OF STOCK */}
        {activeTab === 'stockout' && (
          <div>
            {outOfStockProducts.length === 0 ? (
              <EmptyState
                icon={<ControlBoardIcon className="w-20 h-20 text-[var(--text-muted)]" />}
                title="No products out of stock"
                description="All products currently have available stock."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[13.5px] font-semibold text-[var(--text-primary)]">
                      <th className="py-3.5 px-4 w-36">Product Code</th>
                      <th className="py-3.5 px-4">Chemical Formula</th>
                      <th className="py-3.5 px-4 w-40">Category</th>
                      <th className="py-3.5 px-4 text-center w-28">Available</th>
                      <th className="py-3.5 px-4 text-right w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStockProducts.map((p) => (
                      <tr key={p.productId} className="border-b border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                          {p.productCode}
                        </td>
                        <td className="py-3.5 px-4 text-[13.5px] font-medium text-[var(--text-primary)]">
                          <Link href={`/products/${p.productId}`} className="hover:text-[var(--accent)] hover:underline">
                            {p.productName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[13.5px] font-normal text-[var(--text-secondary)]">
                          {p.categoryName || 'General Formula'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status="OUT_OF_STOCK" label="0 units" tone="danger" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href="/inventory"
                            className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                          >
                            Receive Stock →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: STUDIOS MISSING DISTRIBUTOR HUB */}
        {activeTab === 'unassigned-dealers' && (
          <div>
            {unassignedDealers.length === 0 ? (
              <EmptyState
                icon={<ControlBoardIcon className="w-20 h-20 text-[var(--text-muted)]" />}
                title="All studios have a hub"
                description="No assignments needed."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[13.5px] font-semibold text-[var(--text-primary)]">
                      <th className="py-3.5 px-4 w-36">Studio Code</th>
                      <th className="py-3.5 px-4">Authorized Detailing Studio</th>
                      <th className="py-3.5 px-4 w-48">Territory / Location</th>
                      <th className="py-3.5 px-4 text-center w-32">Status</th>
                      <th className="py-3.5 px-4 text-right w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedDealers.map((d) => (
                      <tr key={d.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                          {d.dealerCode}
                        </td>
                        <td className="py-3.5 px-4 text-[13.5px] font-medium text-[var(--text-primary)]">
                          <Link href={`/dealers/${d.id}`} className="hover:text-[var(--accent)] hover:underline">
                            {d.businessName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[13.5px] font-normal text-[var(--text-secondary)]">
                          {[d.city, d.state].filter(Boolean).join(', ') || 'Unassigned City'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status="UNASSIGNED" label="No hub" tone="warning" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dealers/${d.id}`}
                            className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                          >
                            Assign Hub →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: PARTNER APPLICATIONS PENDING TRIAGE */}
        {activeTab === 'enquiries' && (
          <div>
            {newEnquiriesList.length === 0 ? (
              <EmptyState
                icon={<ControlBoardIcon className="w-20 h-20 text-[var(--text-muted)]" />}
                title="No applications to review"
                description="New applications will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[13.5px] font-semibold text-[var(--text-primary)]">
                      <th className="py-3.5 px-4 w-36">Enquiry Code</th>
                      <th className="py-3.5 px-4">Applicant / Entity</th>
                      <th className="py-3.5 px-4 w-44">Enquiry Type</th>
                      <th className="py-3.5 px-4 w-36">Location</th>
                      <th className="py-3.5 px-4 text-right w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newEnquiriesList.map((e) => (
                      <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                          {e.enquiryCode}
                        </td>
                        <td className="py-3.5 px-4 text-[13.5px] font-medium text-[var(--text-primary)]">
                          <Link href={`/enquiries/${e.id}`} className="hover:text-[var(--accent)] hover:underline">
                            {e.fullName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[13.5px] font-normal text-[var(--text-secondary)] capitalize">
                          {e.type.replace(/_/g, ' ').toLowerCase()}
                        </td>
                        <td className="py-3.5 px-4 text-[13.5px] font-normal text-[var(--text-secondary)]">
                          {e.city || 'National'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/enquiries/${e.id}`}
                            className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                          >
                            Triage →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: RECENT OPERATIONS (TRANSACTION JOURNAL) */}
        {activeTab === 'audit-journal' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[13.5px] font-semibold text-[var(--text-primary)]">
                    <th className="py-3.5 px-4 w-28">Timestamp</th>
                    <th className="py-3.5 px-4 w-60">Transaction Type</th>
                    <th className="py-3.5 px-4">Record Ref</th>
                    <th className="py-3.5 px-4 w-44">Operator</th>
                    <th className="py-3.5 px-4 text-right w-28">Posting</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act) => (
                    <tr key={act.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                        {act.time}
                      </td>
                      <td className="py-3.5 px-4 text-[13.5px] font-medium text-[var(--text-primary)] truncate">
                        {act.event}
                      </td>
                      <td className="py-3.5 px-4 text-[13.5px] text-[var(--text-secondary)]">
                        {act.recordHref ? (
                          <Link href={act.recordHref} className="font-mono text-[12px] text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline">
                            {act.record}
                          </Link>
                        ) : (
                          <span className="font-mono text-[12px] text-[var(--text-secondary)]">{act.record}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[13.5px] font-normal text-[var(--text-secondary)] truncate">
                        {act.actor}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <StatusBadge status="RESOLVED" label="Posted" tone="neutral" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 6: INVENTORY BY LOCATION (FACILITY POSITION) */}
        {activeTab === 'facility' && (
          <div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[3px] border border-[var(--border)] bg-[var(--surface-subtle)] space-y-1.5">
                <div className="text-[13px] font-medium text-[var(--text-secondary)]">Available Stock</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[24px] font-semibold text-[var(--text-primary)] font-sans tracking-tight">
                    {facilityStats.availableUnits}
                  </span>
                  <span className="text-[13px] font-normal text-[var(--text-secondary)]">serial units</span>
                </div>
              </div>

              <div className="p-4 rounded-[3px] border border-[var(--border)] bg-[var(--surface-subtle)] space-y-1.5">
                <div className="text-[13px] font-medium text-[var(--text-secondary)]">Stockout Breaches</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[24px] font-semibold text-[var(--status-danger)] font-sans tracking-tight">
                    {facilityStats.outOfStockCount}
                  </span>
                  <span className="text-[13px] font-normal text-[var(--text-secondary)]">formulas</span>
                </div>
              </div>

              <div className="p-4 rounded-[3px] border border-[var(--border)] bg-[var(--surface-subtle)] space-y-1.5">
                <div className="text-[13px] font-medium text-[var(--text-secondary)]">Master Catalog</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[24px] font-semibold text-[var(--text-primary)] font-sans tracking-tight">
                    {facilityStats.catalogSkus}
                  </span>
                  <span className="text-[13px] font-normal text-[var(--text-secondary)]">catalog SKUs</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
