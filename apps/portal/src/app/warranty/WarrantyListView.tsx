'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Warranty, SafeUser, Dealer, Product } from '@trionyx/types';
import { Modal } from '../../components/ui/Modal';
import { VerifiedShieldIcon } from '../../components/shell/OperationsIcons';
import {
  OperationalSummary,
  StatusBadge,
  RegistryToolbar,
  EmptyState,
} from '../../components/workspace';
import {
  useBarcodeScanner,
  CameraScannerModal,
  type SerialInputSource,
  playScanSound,
} from '@trionyx/ui';

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

  // Quick Serial Check State
  const [quickCheckSerial, setQuickCheckSerial] = useState('');
  const [quickCheckResult, setQuickCheckResult] = useState<{
    found: boolean;
    warranty?: Warranty;
    valid?: boolean;
    productName?: string | null;
    message?: string;
  } | null>(null);
  const [isCheckingQuick, setIsCheckingQuick] = useState(false);

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
  const [isWarrantyCameraOpen, setIsWarrantyCameraOpen] = useState(false);
  const warrantySerialInputRef = React.useRef<HTMLInputElement>(null);

  const canWrite = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';
  const hasFilters = Boolean(search.trim()) || statusFilter !== 'ALL' || productFilter !== 'ALL' || dealerFilter !== 'ALL';

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

  const handleValidateSerial = async (overrideSn?: string | React.FormEvent) => {
    if (overrideSn && typeof overrideSn !== 'string' && 'preventDefault' in overrideSn) {
      overrideSn.preventDefault();
    }
    const targetSn = typeof overrideSn === 'string' ? overrideSn : serialNumber;
    const cleanSn = targetSn.trim().toUpperCase();
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

  const handleWarrantyCapturedSerial = React.useCallback(
    (rawSerial: string, _source?: SerialInputSource) => {
      const sn = rawSerial.trim().toUpperCase();
      if (!sn) return;
      setSerialNumber(sn);
      setValidatedData(null);
      setFormError(null);
      playScanSound('success');
      void handleValidateSerial(sn);
    },
    []
  );

  useBarcodeScanner({
    enabled: isModalOpen && !isWarrantyCameraOpen && !validatedData,
    targetInputRef: warrantySerialInputRef,
    onScan: (scannedSerial, source) => {
      handleWarrantyCapturedSerial(scannedSerial, source);
    },
  });

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
        <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
          Void
        </span>
      );
    }
    if (w.derivedStatus === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
        Active
      </span>
    );
  };

  const handleQuickCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = quickCheckSerial.trim().toUpperCase();
    if (!clean) return;
    setIsCheckingQuick(true);
    setQuickCheckResult(null);

    // First check if already registered
    const existing = warranties.find((w) => w.serialNumber.toUpperCase() === clean);
    if (existing) {
      setQuickCheckResult({
        found: true,
        warranty: existing,
        valid: true,
        productName: existing.productName,
      });
      setIsCheckingQuick(false);
      return;
    }

    // Otherwise check via validate-serial API
    try {
      const res = await fetch('/api/v1/internal/warranties/validate-serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: clean }),
      });
      const json = await res.json();
      if (json.data?.valid) {
        setQuickCheckResult({
          found: false,
          valid: true,
          productName: json.data.productName,
          message: 'Serial verified in inventory — ready for warranty activation.',
        });
      } else {
        setQuickCheckResult({
          found: false,
          valid: false,
          message: json.data?.error || json.error?.message || 'Serial number not recognized.',
        });
      }
    } catch {
      setQuickCheckResult({
        found: false,
        valid: false,
        message: 'Network verification failed.',
      });
    } finally {
      setIsCheckingQuick(false);
    }
  };

  const recentActivations = useMemo(() => {
    return [...warranties]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [warranties]);

  return (
    <div className="space-y-8">
      {/* 1. Operational Summary + primary action */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <OperationalSummary
          segments={[
            { text: 'Right now ' },
            { value: activeCount, tone: 'positive' },
            { text: ' policies are active, ' },
            { value: expiredCount, tone: 'warning' },
            { text: ' have expired and ' },
            { value: voidCount, tone: 'danger' },
            { text: ' are void, from ' },
            { value: totalCount },
            { text: ' tracked.' },
          ]}
        />
        {canWrite && (
          <div className="flex shrink-0 items-center gap-2">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-white text-[13px] font-semibold transition-opacity cursor-pointer shadow-xs"
            >
              + Activate Warranty
            </button>
          </div>
        )}
      </div>

      {/* 2. Check Serial Operational Tool */}
      <section aria-labelledby="check-serial-heading" className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5">
        <h2 id="check-serial-heading" className="text-[14px] font-semibold text-[var(--text-primary)] mb-3 m-0">
          Check Serial
        </h2>
        <form onSubmit={handleQuickCheck} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter discrete serial number (e.g. TRX-BR-2609-000001)..."
              value={quickCheckSerial}
              onChange={(e) => setQuickCheckSerial(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--background)] font-mono text-[13px] text-[var(--text-primary)] placeholder:font-sans placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isCheckingQuick || !quickCheckSerial.trim()}
            className="px-4 py-1.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isCheckingQuick ? 'Checking...' : 'Check'}
          </button>
        </form>

        {quickCheckResult && (
          <div className="mt-4 p-3.5 rounded-[4px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[13px]">
            {quickCheckResult.found && quickCheckResult.warranty ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-medium text-[var(--text-primary)]">
                      {quickCheckResult.warranty.serialNumber}
                    </span>
                    <StatusBadge status={quickCheckResult.warranty.derivedStatus || quickCheckResult.warranty.status} />
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)] mt-1">
                    {quickCheckResult.warranty.productName} · Installed {quickCheckResult.warranty.installationDate} · Valid until {quickCheckResult.warranty.warrantyEndDate}
                  </div>
                </div>
                <Link
                  href={`/warranty/${quickCheckResult.warranty.id}`}
                  className="text-[13px] font-medium text-[var(--accent)] hover:underline shrink-0"
                >
                  View Record →
                </Link>
              </div>
            ) : quickCheckResult.valid ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-medium text-[var(--status-success)]">● Serial Verified</span>
                  <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                    {quickCheckResult.productName} — {quickCheckResult.message}
                  </div>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => {
                      setSerialNumber(quickCheckSerial);
                      setIsModalOpen(true);
                      void handleValidateSerial();
                    }}
                    className="text-[13px] font-medium text-[var(--accent)] hover:underline cursor-pointer shrink-0"
                  >
                    Activate Warranty Now →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[var(--status-danger)]">
                ✕ {quickCheckResult.message}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Recent Activations */}
      {recentActivations.length > 0 && (
        <section aria-labelledby="recent-activations-heading">
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 id="recent-activations-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
              Recent Activations
            </h2>
          </div>

          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                    <th className="py-2.5 px-4 w-44">Serial</th>
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4">Dealer / Channel</th>
                    <th className="py-2.5 px-4 w-32">Activated</th>
                    <th className="py-2.5 px-4 w-32">Valid Until</th>
                    <th className="py-2.5 px-4 text-right w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentActivations.map((w) => (
                    <tr key={w.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[40px]">
                      <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text-primary)]">
                        <Link href={`/warranty/${w.id}`} className="hover:text-[var(--accent)] hover:underline">
                          {w.serialNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-[14px] text-[var(--text-primary)] font-medium">
                        {w.productName}
                      </td>
                      <td className="py-2.5 px-4 text-[13px] text-[var(--text-secondary)]">
                        {w.dealerName || 'Direct Head Office'}
                      </td>
                      <td className="py-2.5 px-4 text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                        {w.installationDate}
                      </td>
                      <td className="py-2.5 px-4 text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                        {w.warrantyEndDate}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <StatusBadge status={w.derivedStatus || w.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5. Warranty Registry Section */}
      <section aria-labelledby="warranty-registry-heading">
        <h2 id="warranty-registry-heading" className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">
          Warranty Registry
        </h2>

        {/* Compact Registry Toolbar */}
        <RegistryToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search serial, product name, code, or dealer..."
          totalCount={warranties.length}
          filteredCount={filteredWarranties.length}
          unitLabel="warranties"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: (v) => setStatusFilter(v as 'ALL' | 'ACTIVE' | 'EXPIRED' | 'VOID'),
              options: [
                { label: 'All Statuses', value: 'ALL' },
                { label: `Active (${activeCount})`, value: 'ACTIVE' },
                { label: `Expired (${expiredCount})`, value: 'EXPIRED' },
                { label: `Void (${voidCount})`, value: 'VOID' },
              ],
            },
            {
              id: 'product',
              label: 'Product',
              value: productFilter,
              onChange: setProductFilter,
              options: [
                { label: 'All Products', value: 'ALL' },
                ...products.map((p) => ({ label: `${p.productCode} — ${p.name}`, value: p.id })),
              ],
            },
            {
              id: 'dealer',
              label: 'Channel',
              value: dealerFilter,
              onChange: setDealerFilter,
              options: [
                { label: 'All Channels', value: 'ALL' },
                { label: 'Direct Head Office', value: 'INTERNAL' },
                ...dealers.map((d) => ({ label: `${d.businessName} (${d.city})`, value: d.id })),
              ],
            },
          ]}
        />

      {/* Warranties Table */}
      <div className={`overflow-hidden ${filteredWarranties.length === 0 ? '' : 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]'}`}>
        {filteredWarranties.length === 0 ? (
          <EmptyState
            icon={<VerifiedShieldIcon className="w-20 h-20 text-[var(--text-muted)]" />}
            title={hasFilters ? 'No matching warranties' : 'No warranties yet'}
            description={
              hasFilters
                ? 'Try a different search or clear your filters.'
                : canWrite ? 'Activate a warranty to add it here.' : 'Warranties will appear here once activated.'
            }
            action={
              hasFilters ? (
                <button type="button" onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setProductFilter('ALL');
                  setDealerFilter('ALL');
                }} className="min-h-9 px-3 text-[13px] font-medium text-[var(--accent-text)] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2">
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                  <th className="py-2.5 px-4">Serial Number</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Channel / Dealer</th>
                  <th className="py-2.5 px-4">Installed</th>
                  <th className="py-2.5 px-4">Valid Until</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredWarranties.map((w) => (
                  <tr key={w.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[42px]">
                    <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text-primary)]">
                      <Link href={`/warranty/${w.id}`} className="hover:text-[var(--accent)] hover:underline">
                        {w.serialNumber}
                      </Link>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="text-[14px] font-medium text-[var(--text-primary)]">
                        {w.productName || 'Unknown Product'}
                      </div>
                      {w.productCode && (
                        <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                          {w.productCode}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      {w.dealerName ? (
                        <span className="text-[14px] text-[var(--text-primary)] font-normal">
                          {w.dealerName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
                          Internal Direct
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-[var(--text-secondary)] whitespace-nowrap text-[12px]">
                      {w.installationDate}
                    </td>

                    <td className="py-2.5 px-4 text-[var(--text-secondary)] whitespace-nowrap text-[12px]">
                      {w.warrantyEndDate}
                    </td>

                    <td className="py-2.5 px-4">
                      {statusBadge(w)}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/warranty/${w.id}`}
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--accent)] hover:underline"
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
      </section>

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
                ref={warrantySerialInputRef}
                type="text"
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value.toUpperCase());
                  setValidatedData(null);
                  setFormError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (serialNumber.trim() && !validatedData) {
                      void handleValidateSerial();
                    }
                  }
                }}
                placeholder="e.g. TRX-BR-2609-000001"
                disabled={isActivating || !!validatedData}
                className="flex-1 px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono text-[13.5px] uppercase focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:opacity-60"
              />
              {!validatedData ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleValidateSerial()}
                    disabled={isValidating || !serialNumber.trim()}
                    className="px-4 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 text-[var(--background)] text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    {isValidating ? 'Checking...' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWarrantyCameraOpen(true)}
                    className="px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Scan serial with mobile/tablet camera"
                  >
                    <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Camera</span>
                  </button>
                </>
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

      {/* Warranty Serial Camera Scanner */}
      <CameraScannerModal
        isOpen={isWarrantyCameraOpen}
        onClose={() => {
          setIsWarrantyCameraOpen(false);
          setTimeout(() => {
            warrantySerialInputRef.current?.focus();
          }, 50);
        }}
        onScan={(serial, source) => handleWarrantyCapturedSerial(serial, source)}
        mode="single"
        title="Activate Warranty — Camera Scanner"
        subtitle="Align serial barcode or QR code on product label to verify immediately."
      />
    </div>
  );
}
