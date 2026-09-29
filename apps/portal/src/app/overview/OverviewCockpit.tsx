'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Building,
  DocumentTasks,
  Analytics,
  Time,
  Location,
} from '@carbon/icons-react';
import { StockAvailableIllustration } from './StockAvailableIllustration';
import { QueueEmptyIllustration } from './QueueEmptyIllustration';

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

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
      {/* ======================================================== */}
      {/* 1. LEFT INSIDE PAGE NAVBAR (Operational Index / Filter)  */}
      {/* ======================================================== */}
      <aside className="w-full lg:w-72 shrink-0 bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-3 space-y-4">
        {/* Section A: Exception Queues */}
        <div>
          <div className="px-2 pb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--text-secondary)]">
            <span>Exception Queues</span>
            <span className="text-[12px] font-normal text-[var(--text-muted)]">
              {totalActionable} actionable
            </span>
          </div>

          <div className="space-y-0.5">
            {/* 1. Products Out of Stock */}
            <button
              type="button"
              onClick={() => setActiveTab('stockout')}
              className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'stockout'
                  ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--status-danger)]'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Box
                  size={16}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'stockout'
                      ? 'text-[var(--status-danger)]'
                      : outOfStockProducts.length > 0
                      ? 'text-[var(--status-danger)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span className="truncate">Products Out of Stock</span>
              </div>
              <span
                className={`text-[12px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 ${
                  outOfStockProducts.length > 0
                    ? 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {outOfStockProducts.length}
              </span>
            </button>

            {/* 2. Studios Missing Distributor Hub */}
            <button
              type="button"
              onClick={() => setActiveTab('unassigned-dealers')}
              className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'unassigned-dealers'
                  ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--status-warning)]'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building
                  size={16}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'unassigned-dealers'
                      ? 'text-[var(--status-warning)]'
                      : unassignedDealers.length > 0
                      ? 'text-[var(--status-warning)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span className="truncate">Studios Missing Hub</span>
              </div>
              <span
                className={`text-[12px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 ${
                  unassignedDealers.length > 0
                    ? 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {unassignedDealers.length}
              </span>
            </button>

            {/* 3. Partner Applications Pending Triage */}
            <button
              type="button"
              onClick={() => setActiveTab('enquiries')}
              className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <DocumentTasks
                  size={16}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'enquiries'
                      ? 'text-[#F26522]'
                      : newEnquiriesList.length > 0
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span className="truncate">Partner Applications</span>
              </div>
              <span
                className={`text-[12px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 ${
                  newEnquiriesList.length > 0
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft-border)]'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {newEnquiriesList.length}
              </span>
            </button>
          </div>
        </div>

        {/* Section B: Records */}
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="px-2 pb-1.5 text-[12px] font-semibold text-[var(--text-secondary)]">
            Records
          </div>

          <div className="space-y-0.5">
            {/* Operations Summary */}
            <button
              type="button"
              onClick={() => setActiveTab('scorecard')}
              className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'scorecard'
                  ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Analytics
                  size={16}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'scorecard' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span className="truncate">Operations Summary</span>
              </div>
              <span className="text-[11px] font-normal text-[var(--text-muted)] shrink-0 ml-2">Live</span>
            </button>

            {/* Recent Operations */}
            <button
              type="button"
              onClick={() => setActiveTab('audit-journal')}
              className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'audit-journal'
                  ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Time
                  size={16}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'audit-journal' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span className="truncate">Recent Operations</span>
              </div>
              <span className="text-[11px] font-normal text-[var(--text-muted)] shrink-0 ml-2">Logs</span>
            </button>

            {/* Inventory by Location */}
            <button
              type="button"
              onClick={() => setActiveTab('facility')}
              className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'facility'
                  ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Location
                  size={16}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'facility' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span className="truncate">Inventory by Location</span>
              </div>
              <span className="text-[11px] font-normal text-[var(--text-muted)] shrink-0 ml-2">Delhi</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. RIGHT MAIN VIEW: FOCUSED, HIGH-READABILITY WORKSPACE  */}
      {/* ======================================================== */}
      <section className="flex-1 w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden min-h-[420px]">
        {/* VIEW 1: OPERATIONS SUMMARY (SCORECARD) */}
        {activeTab === 'scorecard' && (
          <div>
            <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                Operations Summary
              </h2>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--status-success)]">
                Reconciled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                    <th className="py-2.5 px-4 font-semibold">Operational Domain</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-36">Current Balance</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-40">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-40">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                  {scorecardRows.map((row) => (
                    <tr key={row.label} className="hover:bg-[var(--surface-subtle)]/70 transition-colors h-[44px]">
                      <td className="py-2.5 px-4 text-[14px] font-medium text-[var(--text-primary)]">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-4 text-[14px] font-semibold text-right text-[var(--text-primary)] font-sans">
                        {row.balance} <span className="text-[13px] font-normal text-[var(--text-secondary)] ml-1">{row.unit}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-[2px] text-[12px] font-medium border ${
                            row.statusType === 'success'
                              ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]'
                              : row.statusType === 'danger'
                              ? 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]'
                              : row.statusType === 'warning'
                              ? 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                              : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]'
                          }`}
                        >
                          {row.balance === 0 && (row.status === 'Normal' || row.status === 'Audited')
                            ? 'None yet'
                            : row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
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
            <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
              <h2 className={`text-[14px] font-semibold m-0 ${outOfStockProducts.length === 0 ? 'text-[var(--text-primary)]' : 'text-[var(--status-danger)]'}`}>
                Products Out of Stock
              </h2>
              <Link
                href="/inventory"
                className="px-2.5 py-1 text-[12px] font-medium rounded-[3px] bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
              >
                + Receive Serials
              </Link>
            </div>

            {outOfStockProducts.length === 0 ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center px-6 py-12 text-center">
                <StockAvailableIllustration />
                <h3 className="mt-5 mb-0 text-[16px] font-semibold text-[var(--text-primary)]">
                  No products out of stock
                </h3>
                <p className="mt-2 mb-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  All products currently have available stock.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                      <th className="py-2.5 px-4 w-36">Product Code</th>
                      <th className="py-2.5 px-4">Chemical Formula</th>
                      <th className="py-2.5 px-4 w-40">Category</th>
                      <th className="py-2.5 px-4 text-center w-28">Available</th>
                      <th className="py-2.5 px-4 text-right w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                    {outOfStockProducts.map((p) => (
                      <tr key={p.productId} className="hover:bg-[var(--surface-subtle)]/70 transition-colors h-[40px]">
                        <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                          {p.productCode}
                        </td>
                        <td className="py-2.5 px-4 text-[14px] font-medium text-[var(--text-primary)]">
                          <Link href={`/products/${p.productId}`} className="hover:text-[var(--accent)] hover:underline">
                            {p.productName}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4 text-[14px] font-normal text-[var(--text-secondary)]">
                          {p.categoryName || 'General Formula'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="text-[12px] font-medium px-2 py-0.5 rounded-[2px] bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
                            0 units
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
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
            <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
              <h2 className={`text-[14px] font-semibold m-0 ${unassignedDealers.length === 0 ? 'text-[var(--text-primary)]' : 'text-[var(--status-warning)]'}`}>
                Studios Missing Distributor Hub
              </h2>
              <Link
                href="/dealers"
                className="px-2.5 py-1 text-[12px] font-medium rounded-[3px] bg-[var(--surface-subtle)] border border-[var(--border)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] transition-colors"
              >
                Studio Registry →
              </Link>
            </div>

            {unassignedDealers.length === 0 ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center px-6 py-12 text-center">
                <QueueEmptyIllustration kind="studios" />
                <h3 className="mt-5 mb-0 text-[16px] font-semibold text-[var(--text-primary)]">All studios have a hub</h3>
                <p className="mt-2 mb-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">No assignments needed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                      <th className="py-2.5 px-4 w-36">Studio Code</th>
                      <th className="py-2.5 px-4">Authorized Detailing Studio</th>
                      <th className="py-2.5 px-4 w-48">Territory / Location</th>
                      <th className="py-2.5 px-4 text-center w-32">Status</th>
                      <th className="py-2.5 px-4 text-right w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                    {unassignedDealers.map((d) => (
                      <tr key={d.id} className="hover:bg-[var(--surface-subtle)]/70 transition-colors h-[40px]">
                        <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                          {d.dealerCode}
                        </td>
                        <td className="py-2.5 px-4 text-[14px] font-medium text-[var(--text-primary)]">
                          <Link href={`/dealers/${d.id}`} className="hover:text-[var(--accent)] hover:underline">
                            {d.businessName}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4 text-[14px] font-normal text-[var(--text-secondary)]">
                          {[d.city, d.state].filter(Boolean).join(', ') || 'Unassigned City'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="text-[12px] font-medium px-2 py-0.5 rounded-[2px] bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                            No hub
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
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
            <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
              <h2 className={`text-[14px] font-semibold m-0 ${newEnquiriesList.length === 0 ? 'text-[var(--text-primary)]' : 'text-[var(--accent)]'}`}>
                Partner Applications Pending Triage
              </h2>
              <Link
                href="/enquiries"
                className="px-2.5 py-1 text-[12px] font-medium rounded-[3px] bg-[var(--surface-subtle)] border border-[var(--border)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] transition-colors"
              >
                Full Queue →
              </Link>
            </div>

            {newEnquiriesList.length === 0 ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center px-6 py-12 text-center">
                <QueueEmptyIllustration kind="partners" />
                <h3 className="mt-5 mb-0 text-[16px] font-semibold text-[var(--text-primary)]">No applications to review</h3>
                <p className="mt-2 mb-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">New applications will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                      <th className="py-2.5 px-4 w-36">Enquiry Code</th>
                      <th className="py-2.5 px-4">Applicant / Entity</th>
                      <th className="py-2.5 px-4 w-44">Enquiry Type</th>
                      <th className="py-2.5 px-4 w-36">Location</th>
                      <th className="py-2.5 px-4 text-right w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                    {newEnquiriesList.map((e) => (
                      <tr key={e.id} className="hover:bg-[var(--surface-subtle)]/70 transition-colors h-[40px]">
                        <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                          {e.enquiryCode}
                        </td>
                        <td className="py-2.5 px-4 text-[14px] font-medium text-[var(--text-primary)]">
                          <Link href={`/enquiries/${e.id}`} className="hover:text-[var(--accent)] hover:underline">
                            {e.fullName}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4 text-[14px] font-normal text-[var(--text-secondary)] capitalize">
                          {e.type.replace(/_/g, ' ').toLowerCase()}
                        </td>
                        <td className="py-2.5 px-4 text-[14px] font-normal text-[var(--text-secondary)]">
                          {e.city || 'National'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
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
            <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                Recent Operations
              </h2>
              <span className="text-[12px] font-normal text-[var(--text-secondary)]">
                {activities.length} recent operations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                    <th className="py-2.5 px-4 w-28">Timestamp</th>
                    <th className="py-2.5 px-4 w-60">Transaction Type</th>
                    <th className="py-2.5 px-4">Record Ref</th>
                    <th className="py-2.5 px-4 w-44">Operator</th>
                    <th className="py-2.5 px-4 text-right w-28">Posting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-[var(--surface-subtle)]/70 transition-colors h-[38px]">
                      <td className="py-2 px-4 font-mono text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                        {act.time}
                      </td>
                      <td className="py-2 px-4 text-[14px] font-medium text-[var(--text-primary)] truncate">
                        {act.event}
                      </td>
                      <td className="py-2 px-4 text-[var(--text-secondary)]">
                        {act.recordHref ? (
                          <Link href={act.recordHref} className="font-mono text-[12px] text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline">
                            {act.record}
                          </Link>
                        ) : (
                          <span className="font-mono text-[12px] text-[var(--text-secondary)]">{act.record}</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-[13px] font-normal text-[var(--text-secondary)] truncate">
                        {act.actor}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                          Posted
                        </span>
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
            <div className="bg-[var(--surface-subtle)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                Inventory by Location
              </h2>
              <span className="text-[12px] font-normal text-[var(--text-secondary)]">
                Delhi Central Facility
              </span>
            </div>

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
