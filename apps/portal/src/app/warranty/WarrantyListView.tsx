'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Warranty, SafeUser, Dealer, Product } from '@trionyx/types';
import { Modal } from '../../components/ui/Modal';

interface WarrantyListViewProps {
  initialWarranties: Warranty[];
  totalCount: number;
  dealers: Dealer[];
  products: Product[];
  user: SafeUser;
}

export function WarrantyListView({
  initialWarranties,
  dealers,
  products,
  user,
}: WarrantyListViewProps) {
  const router = useRouter();

  const [warranties, setWarranties] = useState<Warranty[]>(initialWarranties);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'VOID'>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [dealerFilter, setDealerFilter] = useState<string>('ALL');

  // Activation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [installationDate, setInstallationDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedDealerId, setSelectedDealerId] = useState<string>('');
  const [validatedData, setValidatedData] = useState<{
    valid: boolean;
    productName: string;
    productCode: string;
    productId: string;
    policyDurationMonths: number | null;
  } | null>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const canWrite = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Derived KPI Counts
  const totalCount = warranties.length;
  const activeCount = warranties.filter((w) => w.derivedStatus === 'ACTIVE').length;
  const expiredCount = warranties.filter((w) => w.derivedStatus === 'EXPIRED').length;
  const voidCount = warranties.filter((w) => w.status === 'VOID').length;

  const filteredWarranties = warranties.filter((w) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSn = w.serialNumber.toLowerCase().includes(q);
      const matchProduct =
        (w.productName && w.productName.toLowerCase().includes(q)) ||
        (w.productCode && w.productCode.toLowerCase().includes(q));
      const matchDealer = w.dealerName && w.dealerName.toLowerCase().includes(q);
      const matchActor = w.activatedByName && w.activatedByName.toLowerCase().includes(q);
      if (!matchSn && !matchProduct && !matchDealer && !matchActor) return false;
    }

    // Status filter
    if (statusFilter === 'ACTIVE' && w.derivedStatus !== 'ACTIVE') return false;
    if (statusFilter === 'EXPIRED' && w.derivedStatus !== 'EXPIRED') return false;
    if (statusFilter === 'VOID' && w.status !== 'VOID') return false;

    // Product filter
    if (productFilter !== 'ALL' && w.productId !== productFilter) return false;

    // Dealer filter
    if (dealerFilter !== 'ALL') {
      if (dealerFilter === 'INTERNAL' && w.dealerId !== null) return false;
      if (dealerFilter !== 'INTERNAL' && w.dealerId !== dealerFilter) return false;
    }

    return true;
  });

  const handleValidateSerial = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSn = serialNumber.trim().toUpperCase();
    if (!cleanSn) {
      setFormError('Please enter a serial number');
      return;
    }

    setIsValidating(true);
    setFormError(null);
    setFormSuccess(null);
    setValidatedData(null);

    try {
      const res = await fetch('/api/v1/internal/warranties/validate-serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: cleanSn }),
      });

      const json = await res.json();

      if (!res.ok || !json.data.valid) {
        setFormError(json.data?.error || json.error?.message || 'Invalid serial number');
        return;
      }

      setValidatedData({
        valid: true,
        productName: json.data.productName,
        productCode: json.data.productCode,
        productId: json.data.productId,
        policyDurationMonths: json.data.policyDurationMonths,
      });
    } catch {
      setFormError('Network connection error. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmActivate = async () => {
    const cleanSn = serialNumber.trim().toUpperCase();
    if (!cleanSn || !installationDate) {
      setFormError('Please provide both serial number and installation date');
      return;
    }

    setIsActivating(true);
    setFormError(null);

    try {
      const res = await fetch('/api/v1/internal/warranties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: cleanSn,
          installationDate,
          dealerId: selectedDealerId || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error?.message || 'Failed to activate warranty');
        return;
      }

      const newWarranty = json.data as Warranty;
      setWarranties((prev) => [newWarranty, ...prev]);
      setFormSuccess(`Warranty activated successfully for ${cleanSn}`);

      setTimeout(() => {
        setIsModalOpen(false);
        setSerialNumber('');
        setSelectedDealerId('');
        setValidatedData(null);
        setFormSuccess(null);
        router.refresh();
      }, 1200);
    } catch {
      setFormError('Network connection error. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const statusBadge = (w: Warranty) => {
    if (w.status === 'VOID') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
          Void
        </span>
      );
    }
    if (w.derivedStatus === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
        Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-[var(--text-primary)] m-0">
              Warranty Operations
            </h1>
            <span className="font-mono text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
              {totalCount} REGISTRATIONS
            </span>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 m-0">
            Centralized registry of activated product warranties, installation milestones, and lifecycle statuses.
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => {
              setSerialNumber('');
              setSelectedDealerId('');
              setValidatedData(null);
              setFormError(null);
              setFormSuccess(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-semibold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Activate Warranty
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Total Registered
          </span>
          <span className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">
            {totalCount}
          </span>
        </div>

        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--status-success)] block mb-1">
            Active Warranties
          </span>
          <span className="text-[24px] font-bold text-[var(--status-success)] tracking-tight">
            {activeCount}
          </span>
        </div>

        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Expired
          </span>
          <span className="text-[24px] font-bold text-[var(--text-secondary)] tracking-tight">
            {expiredCount}
          </span>
        </div>

        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--status-danger)] block mb-1">
            Voided
          </span>
          <span className="text-[24px] font-bold text-[var(--status-danger)] tracking-tight">
            {voidCount}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)] space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search serial number, product name, code, or dealer..."
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active ({activeCount})</option>
              <option value="EXPIRED">Expired ({expiredCount})</option>
              <option value="VOID">Void ({voidCount})</option>
            </select>

            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] max-w-[200px]"
            >
              <option value="ALL">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productCode} — {p.name}
                </option>
              ))}
            </select>

            <select
              value={dealerFilter}
              onChange={(e) => setDealerFilter(e.target.value)}
              className="px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] max-w-[200px]"
            >
              <option value="ALL">All Channels</option>
              <option value="INTERNAL">Internal Direct Only</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.businessName} ({d.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Warranties Table */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)]">
        {filteredWarranties.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                No warranty registrations found
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-1 m-0">
                {search || statusFilter !== 'ALL' || productFilter !== 'ALL' || dealerFilter !== 'ALL'
                  ? 'No records match the active search filters.'
                  : 'No warranty records have been activated yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Channel / Dealer</th>
                  <th className="py-3 px-4">Installed</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredWarranties.map((w) => (
                  <tr key={w.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--accent-text)]">
                      <Link href={`/warranty/${w.id}`} className="hover:underline">
                        {w.serialNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[var(--text-primary)]">
                        {w.productName || 'Unknown Product'}
                      </div>
                      {w.productCode && (
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          {w.productCode}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {w.dealerName ? (
                        <span className="text-[var(--text-primary)] font-medium">
                          {w.dealerName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
                          Internal Direct
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[var(--text-secondary)] whitespace-nowrap text-[12.5px]">
                      {w.installationDate}
                    </td>

                    <td className="py-3.5 px-4 text-[var(--text-secondary)] whitespace-nowrap text-[12.5px]">
                      {w.warrantyEndDate}
                    </td>

                    <td className="py-3.5 px-4">
                      {statusBadge(w)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/warranty/${w.id}`}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--accent-text)] hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Internal Activation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setValidatedData(null);
          setFormError(null);
          setFormSuccess(null);
        }}
        title="Activate Warranty (Internal)"
        subtitle="Register serial number warranty directly from Operations"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded bg-[var(--status-success-soft)] border border-[var(--status-success-border)] text-[var(--status-success)] text-[13px]">
              {formSuccess}
            </div>
          )}

          {/* Serial Number & Validation */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Serial Number *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value.toUpperCase());
                  setValidatedData(null);
                  setFormError(null);
                }}
                placeholder="e.g. TRX-BR-2609-000001"
                disabled={isActivating || !!validatedData}
                className="flex-1 px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono text-[13.5px] uppercase focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:opacity-60"
              />
              {!validatedData ? (
                <button
                  type="button"
                  onClick={() => handleValidateSerial()}
                  disabled={isValidating || !serialNumber.trim()}
                  className="px-4 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 text-[var(--background)] text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {isValidating ? 'Checking...' : 'Verify'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setValidatedData(null);
                    setSerialNumber('');
                  }}
                  disabled={isActivating}
                  className="px-3 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-secondary)] text-[12.5px] transition-colors cursor-pointer shrink-0"
                >
                  Change
                </button>
              )}
            </div>
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1 m-0">
              Enter the discrete serial number printed on the product packaging.
            </p>
          </div>

          {/* Validated Details Banner */}
          {validatedData && (
            <div className="p-3.5 rounded-[6px] bg-[var(--background)] border border-[var(--border)] space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Product Verified
                </span>
                <span className="font-mono text-[11px] font-bold text-[var(--accent-text)]">
                  {validatedData.productCode}
                </span>
              </div>
              <p className="text-[13.5px] font-semibold text-[var(--text-primary)] m-0">
                {validatedData.productName}
              </p>
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[12px]">
                <span className="text-[var(--text-secondary)]">Factory Warranty Policy:</span>
                <span className="font-bold text-[var(--status-success)]">
                  {validatedData.policyDurationMonths} Months ({Math.round(((validatedData.policyDurationMonths || 12) / 12) * 10) / 10} Years)
                </span>
              </div>
            </div>
          )}

          {/* Installation Date */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Installation / Application Date *
            </label>
            <input
              type="date"
              value={installationDate}
              onChange={(e) => setInstallationDate(e.target.value)}
              disabled={isActivating}
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1 m-0">
              Warranty starts strictly on this date. Expiry date is derived automatically.
            </p>
          </div>

          {/* Optional Dealer Assignment */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Assigned Channel / Dealer (Optional)
            </label>
            <select
              value={selectedDealerId}
              onChange={(e) => setSelectedDealerId(e.target.value)}
              disabled={isActivating}
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="">Direct Registration (Head Office)</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.businessName} — {d.city}, {d.state} ({d.dealerCode})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setValidatedData(null);
                setFormError(null);
              }}
              disabled={isActivating}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmActivate}
              disabled={isActivating || !validatedData || !installationDate}
              className="px-4 py-2 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[var(--accent-foreground)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {isActivating ? 'Registering...' : 'Confirm Activation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
