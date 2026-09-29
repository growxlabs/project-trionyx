'use client';

import React, { useState, useMemo } from 'react';
import type { Warranty, Dealer } from '@trionyx/types';

interface WarrantyViewProps {
  initialWarranties: Warranty[];
  dealers: Dealer[];
  distributorId?: string;
}

type CheckStatus =
  | 'IDLE'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'VALID_NOT_ACTIVATED'
  | 'NOT_FOUND';

interface CheckState {
  status: CheckStatus;
  serialNumber: string;
  warranty?: Warranty;
  productName?: string;
  productCode?: string;
  dealerName?: string;
  policyDurationMonths?: number | null;
  message?: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

export function WarrantyView({
  initialWarranties,
  dealers,
}: WarrantyViewProps) {
  const [warranties, setWarranties] = useState<Warranty[]>(initialWarranties);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'VOID'>('ALL');

  // Check Warranty Tool State
  const [checkSerial, setCheckSerial] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckState>({
    status: 'IDLE',
    serialNumber: '',
  });

  // Activation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSerial, setModalSerial] = useState('');
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [installationDate, setInstallationDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [validatedData, setValidatedData] = useState<{
    valid: boolean;
    productName: string;
    productCode: string;
    policyDurationMonths: number | null;
  } | null>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Quick Check Serial handler with 4 discrete states
  const handleCheckSerial = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = checkSerial.trim().toUpperCase();
    if (!clean) return;

    setIsChecking(true);
    setCheckResult({ status: 'IDLE', serialNumber: clean });

    // 1. Check local warranty list first
    const existing = warranties.find((w) => w.serialNumber.toUpperCase() === clean);
    if (existing) {
      const derived = existing.derivedStatus || existing.status;
      setCheckResult({
        status: derived === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
        serialNumber: clean,
        warranty: existing,
        productName: existing.productName || undefined,
        productCode: existing.productCode || undefined,
        dealerName: existing.dealerName || undefined,
      });
      setIsChecking(false);
      return;
    }

    // 2. Query server validation
    try {
      const res = await fetch('/api/v1/dealer/warranties/validate-serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: clean }),
      });
      const json = await res.json();

      if (json.data?.valid) {
        setCheckResult({
          status: 'VALID_NOT_ACTIVATED',
          serialNumber: clean,
          productName: json.data.productName,
          productCode: json.data.productCode,
          policyDurationMonths: json.data.policyDurationMonths,
          message: 'Serial verified in inventory. Ready for warranty registration.',
        });
      } else if (json.data?.isAlreadyActivated && json.data.existingWarranty) {
        const ew = json.data.existingWarranty;
        const derived = ew.derivedStatus || ew.status;
        setCheckResult({
          status: derived === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
          serialNumber: clean,
          warranty: ew,
          productName: ew.productName || json.data.productName,
          dealerName: ew.dealerName,
        });
      } else {
        setCheckResult({
          status: 'NOT_FOUND',
          serialNumber: clean,
          message:
            json.data?.error ||
            json.error?.message ||
            'Serial number not recognized in Trionyx inventory. Please verify the code printed on the product packaging.',
        });
      }
    } catch {
      setCheckResult({
        status: 'NOT_FOUND',
        serialNumber: clean,
        message: 'Network verification failed. Please check your connection and retry.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Validate serial inside activation modal
  const handleValidateModalSerial = async (serialToVerify?: string) => {
    const cleanSn = (serialToVerify || modalSerial).trim().toUpperCase();
    if (!cleanSn) {
      setFormError('Please enter a serial number');
      return;
    }

    setIsValidating(true);
    setFormError(null);
    setFormSuccess(null);
    setValidatedData(null);

    try {
      const res = await fetch('/api/v1/dealer/warranties/validate-serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: cleanSn }),
      });

      const json = await res.json();

      if (!res.ok || !json.data?.valid) {
        setFormError(json.data?.error || json.error?.message || 'Invalid serial number or warranty already active');
        return;
      }

      setValidatedData({
        valid: true,
        productName: json.data.productName,
        productCode: json.data.productCode,
        policyDurationMonths: json.data.policyDurationMonths,
      });
    } catch {
      setFormError('Network connection error. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Confirm warranty activation
  const handleConfirmActivate = async () => {
    const cleanSn = modalSerial.trim().toUpperCase();
    if (!cleanSn || !installationDate) {
      setFormError('Please provide both serial number and installation date');
      return;
    }

    setIsActivating(true);
    setFormError(null);

    try {
      const res = await fetch('/api/v1/dealer/warranties', {
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

      setFormSuccess(`Warranty successfully registered for serial ${cleanSn}`);
      setWarranties((prev) => [json.data, ...prev]);

      // Also reset check tool if it had this serial
      if (checkSerial.toUpperCase() === cleanSn) {
        setCheckResult({
          status: 'ACTIVE',
          serialNumber: cleanSn,
          warranty: json.data,
          productName: json.data.productName,
          dealerName: json.data.dealerName,
        });
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setModalSerial('');
        setSelectedDealerId('');
        setValidatedData(null);
        setFormSuccess(null);
      }, 1500);
    } catch {
      setFormError('Network error while registering warranty.');
    } finally {
      setIsActivating(false);
    }
  };

  // Pre-fill modal from Check Tool
  const openModalWithSerial = (serial: string) => {
    setModalSerial(serial);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
    void handleValidateModalSerial(serial);
  };

  // Filtered warranties
  const filteredWarranties = useMemo(() => {
    return warranties.filter((w) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        const derived = w.derivedStatus || w.status;
        if (statusFilter === 'ACTIVE' && derived !== 'ACTIVE') return false;
        if (statusFilter === 'EXPIRED' && derived !== 'EXPIRED') return false;
        if (statusFilter === 'VOID' && w.status !== 'VOID') return false;
      }

      // Search query filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesSerial = w.serialNumber.toLowerCase().includes(q);
        const matchesProduct = (w.productName || '').toLowerCase().includes(q);
        const matchesDealer = (w.dealerName || '').toLowerCase().includes(q);
        return matchesSerial || matchesProduct || matchesDealer;
      }

      return true;
    });
  }, [warranties, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: warranties.length,
      active: warranties.filter((w) => (w.derivedStatus || w.status) === 'ACTIVE').length,
      expired: warranties.filter((w) => (w.derivedStatus || w.status) === 'EXPIRED').length,
      voided: warranties.filter((w) => w.status === 'VOID').length,
    };
  }, [warranties]);

  return (
    <div className="space-y-8 text-[#171714]">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0 text-[#171714]">
            Warranty
          </h1>
          <p className="mt-1 text-[13.5px] text-[#68665F] m-0">
            Verify serial eligibility and register warranties on behalf of authorized territory dealers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalSerial('');
            setSelectedDealerId('');
            setValidatedData(null);
            setFormError(null);
            setFormSuccess(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#F26522] hover:opacity-90 text-white font-semibold text-[13px] transition-opacity cursor-pointer self-start sm:self-auto shadow-xs"
        >
          Register Warranty
        </button>
      </div>

      {/* 2. Check Warranty Tool */}
      <section aria-labelledby="check-warranty-heading" className="border-t border-[#171714]/10 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="check-warranty-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
            CHECK WARRANTY ELIGIBILITY
          </h2>
          {checkResult.status !== 'IDLE' && (
            <button
              type="button"
              onClick={() => {
                setCheckResult({ status: 'IDLE', serialNumber: '' });
                setCheckSerial('');
              }}
              className="text-[11px] text-[#68665F] hover:text-[#171714] underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <form onSubmit={handleCheckSerial} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter serial number (e.g. TRX-BR-2609-000001)..."
              value={checkSerial}
              onChange={(e) => setCheckSerial(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/15 bg-white font-mono text-[13px] text-[#171714] placeholder:font-sans placeholder:text-[#68665F]/60 focus:border-[#F26522] focus:outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isChecking || !checkSerial.trim()}
            className="px-4 py-2 rounded-[4px] border border-[#171714]/15 bg-white hover:bg-[#171714]/05 text-[#171714] text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isChecking ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {/* 4 Discrete States Display */}
        {checkResult.status !== 'IDLE' && (
          <div className="p-4 rounded-[4px] bg-[#FCFBF7] border border-[#171714]/12 text-[13px] max-w-xl space-y-2">
            {/* State 1: Warranty Active */}
            {checkResult.status === 'ACTIVE' && checkResult.warranty && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[14px] text-[#171714]">
                    {checkResult.serialNumber}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    ● Warranty Active
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-[#171714]">
                  {checkResult.warranty.productName || checkResult.productName}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#171714]/08 text-[12px] text-[#68665F]">
                  <div>
                    <span className="block text-[10.5px] uppercase tracking-wider text-[#68665F]/80">Installed Dealer</span>
                    <span className="font-medium text-[#171714]">{checkResult.warranty.dealerName || 'Direct Studio'}</span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] uppercase tracking-wider text-[#68665F]/80">Valid Coverage Until</span>
                    <span className="font-medium text-[#171714]">
                      {dateFormatter.format(new Date(checkResult.warranty.warrantyEndDate))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* State 2: Warranty Expired */}
            {checkResult.status === 'EXPIRED' && checkResult.warranty && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[14px] text-[#68665F]">
                    {checkResult.serialNumber}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7]">
                    Warranty Expired
                  </span>
                </div>
                <div className="text-[13px] font-medium text-[#171714]">
                  {checkResult.warranty.productName || checkResult.productName}
                </div>
                <div className="pt-2 border-t border-[#171714]/08 text-[12px] text-[#68665F]">
                  Coverage ended on {dateFormatter.format(new Date(checkResult.warranty.warrantyEndDate))}. Installed by{' '}
                  <span className="font-medium text-[#171714]">{checkResult.warranty.dealerName || 'Dealer'}</span>.
                </div>
              </div>
            )}

            {/* State 3: Valid Serial — Warranty Not Activated */}
            {checkResult.status === 'VALID_NOT_ACTIVATED' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[14px] text-[#171714]">
                    {checkResult.serialNumber}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    Eligible for Warranty
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-[#171714] text-[13.5px]">
                    {checkResult.productName}
                  </div>
                  <div className="text-[12px] text-[#68665F] mt-0.5">
                    Product Code: <span className="font-mono font-medium text-[#171714]">{checkResult.productCode}</span> ·
                    Standard Policy: <span className="font-medium text-[#171714]">{checkResult.policyDurationMonths} Months</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#171714]/08 flex items-center justify-between">
                  <span className="text-[12px] text-[#065F46] font-medium">
                    ✓ Valid inventory serial — no active registration.
                  </span>
                  <button
                    type="button"
                    onClick={() => openModalWithSerial(checkResult.serialNumber)}
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#F26522] hover:underline cursor-pointer"
                  >
                    Register Warranty Now →
                  </button>
                </div>
              </div>
            )}

            {/* State 4: Serial Number Not Found */}
            {checkResult.status === 'NOT_FOUND' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-[#B91C1C]">
                    {checkResult.serialNumber}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                    Serial Not Found
                  </span>
                </div>
                <p className="text-[12.5px] text-[#68665F] m-0 pt-1">
                  {checkResult.message}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Warranty Records Table */}
      <section aria-labelledby="warranty-records-heading" className="border-t border-[#171714]/10 pt-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="warranty-records-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
              WARRANTY RECORDS ({statusCounts.all})
            </h2>
          </div>

          {/* Status Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-[4px] border border-[#171714]/15 p-0.5 bg-white text-[12px]">
              {(['ALL', 'ACTIVE', 'EXPIRED', 'VOID'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-[3px] font-semibold cursor-pointer transition-colors ${
                    statusFilter === tab
                      ? 'bg-[#171714] text-white'
                      : 'text-[#68665F] hover:text-[#171714]'
                  }`}
                >
                  {tab === 'ALL'
                    ? `All (${statusCounts.all})`
                    : tab === 'ACTIVE'
                    ? `Active (${statusCounts.active})`
                    : tab === 'EXPIRED'
                    ? `Expired (${statusCounts.expired})`
                    : `Void (${statusCounts.voided})`}
                </button>
              ))}
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search serial, product, or dealer..."
              className="w-full sm:w-60 px-3 py-1 rounded-[4px] border border-[#171714]/15 bg-white text-[12.5px] text-[#171714] placeholder-[#68665F]/60 focus:border-[#F26522] focus:outline-none"
            />
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredWarranties.length === 0 ? (
          <div className="p-8 rounded-[4px] bg-[#FCFBF7] border border-[#171714]/10 text-center space-y-2 text-[13.5px]">
            <p className="font-semibold text-[#171714] m-0">
              {warranties.length === 0
                ? 'No warranty records registered yet.'
                : 'No warranty records match your filter criteria.'}
            </p>
            <p className="text-[#68665F] text-[13px] m-0 max-w-md mx-auto">
              {warranties.length === 0
                ? 'When dealers in your territory install eligible Trionyx products, register the warranty using the product serial number.'
                : 'Try adjusting your search query or switching to All status tab.'}
            </p>
            {warranties.length === 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalSerial('');
                    setSelectedDealerId('');
                    setValidatedData(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-[4px] bg-[#F26522] text-white text-[12.5px] font-semibold hover:opacity-90 cursor-pointer"
                >
                  Register First Warranty
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[4px] border border-[#171714]/10 bg-white">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[#171714]/10 bg-[#FCFBF7] text-[11px] font-semibold uppercase tracking-wider text-[#68665F]">
                  <th className="py-2.5 px-3.5">Serial Number</th>
                  <th className="py-2.5 px-3.5">Product</th>
                  <th className="py-2.5 px-3.5">Installing Dealer</th>
                  <th className="py-2.5 px-3.5">Installed</th>
                  <th className="py-2.5 px-3.5">Valid Until</th>
                  <th className="py-2.5 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171714]/08">
                {filteredWarranties.map((w) => {
                  const derived = w.derivedStatus || w.status;
                  return (
                    <tr key={w.id} className="hover:bg-[#FCFBF7]/50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-semibold text-[#171714]">
                        {w.serialNumber}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-[#171714]">{w.productName}</div>
                        {w.productCode && (
                          <div className="text-[11px] font-mono text-[#68665F]">{w.productCode}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-[#171714]">
                        {w.dealerName || (
                          <span className="text-[#68665F] italic">Direct Registration</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-[#68665F]">
                        {dateFormatter.format(new Date(w.installationDate))}
                      </td>
                      <td className="py-3 px-3.5 text-[#68665F]">
                        {dateFormatter.format(new Date(w.warrantyEndDate))}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-block text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            w.status === 'VOID'
                              ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                              : derived === 'EXPIRED'
                              ? 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]'
                              : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                          }`}
                        >
                          {derived}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FCFBF7] border border-[#171714]/15 rounded-[4px] p-6 max-w-lg w-full space-y-4 shadow-xl text-[#171714]">
            <div className="flex items-center justify-between border-b border-[#171714]/10 pb-3">
              <div>
                <h2 className="text-[16px] font-bold text-[#171714] m-0">
                  Register Product Warranty
                </h2>
                <p className="text-[12px] text-[#68665F] m-0 mt-0.5">
                  Activate warranty coverage on behalf of an authorized territory dealer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#68665F] hover:text-[#171714] text-[18px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[12.5px] text-[#B91C1C]">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-[4px] bg-[#ECFDF5] border border-[#A7F3D0] text-[12.5px] text-[#065F46]">
                {formSuccess}
              </div>
            )}

            {/* Step 1: Serial Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F]">
                Product Serial Number *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modalSerial}
                  onChange={(e) => {
                    setModalSerial(e.target.value.toUpperCase());
                    setValidatedData(null);
                    setFormError(null);
                  }}
                  placeholder="e.g. TRX-BR-2609-000001"
                  disabled={isActivating || !!validatedData}
                  className="flex-1 px-3 py-1.5 rounded-[4px] border border-[#171714]/15 bg-white font-mono text-[13px] uppercase text-[#171714] focus:border-[#F26522] focus:outline-none disabled:opacity-60"
                />
                {!validatedData ? (
                  <button
                    type="button"
                    onClick={() => void handleValidateModalSerial()}
                    disabled={isValidating || !modalSerial.trim()}
                    className="px-4 py-1.5 rounded-[4px] bg-[#171714] hover:opacity-90 disabled:opacity-50 text-white text-[13px] font-semibold transition-opacity cursor-pointer shrink-0"
                  >
                    {isValidating ? 'Verifying...' : 'Verify Serial'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setValidatedData(null);
                      setModalSerial('');
                    }}
                    className="px-3 py-1.5 rounded-[4px] border border-[#171714]/15 text-[#68665F] hover:text-[#171714] text-[12px] cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Validated Data Preview */}
            {validatedData && (
              <div className="p-3.5 rounded-[4px] bg-white border border-[#171714]/10 space-y-1 text-[13px]">
                <div className="flex items-center justify-between text-[11px] text-[#68665F]">
                  <span>Product Verified</span>
                  <span className="font-mono font-semibold text-[#F26522]">{validatedData.productCode}</span>
                </div>
                <div className="font-semibold text-[#171714] text-[14px]">
                  {validatedData.productName}
                </div>
                <div className="text-[12px] text-[#065F46] font-medium pt-1 border-t border-[#171714]/08 flex items-center justify-between">
                  <span>Coverage Term:</span>
                  <span>{validatedData.policyDurationMonths} Months</span>
                </div>
              </div>
            )}

            {/* Step 3: Dealer Selection */}
            {validatedData && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F]">
                  Installing Authorized Dealer
                </label>
                {dealers.length > 0 ? (
                  <select
                    value={selectedDealerId}
                    onChange={(e) => setSelectedDealerId(e.target.value)}
                    disabled={isActivating}
                    className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/15 bg-white text-[13px] text-[#171714] focus:border-[#F26522] focus:outline-none"
                  >
                    <option value="">-- Direct Distributor Installation (No Specific Dealer) --</option>
                    {dealers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.businessName} ({d.city}, {d.state})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-[4px] bg-[#FCFBF7] border border-[#171714]/10 text-[12px] text-[#68665F]">
                    No territory dealers assigned yet. Warranty will be registered under your regional distributor record.
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Installation Date */}
            {validatedData && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F]">
                  Installation Date *
                </label>
                <input
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  disabled={isActivating}
                  className="w-full px-3 py-1.5 rounded-[4px] border border-[#171714]/15 bg-white text-[13px] text-[#171714] focus:border-[#F26522] focus:outline-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#171714]/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isActivating}
                className="px-3.5 py-1.5 rounded-[4px] border border-[#171714]/15 text-[#68665F] hover:text-[#171714] text-[13px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmActivate()}
                disabled={isActivating || !validatedData || !installationDate}
                className="px-4 py-1.5 rounded-[4px] bg-[#F26522] hover:opacity-90 disabled:opacity-50 text-white text-[13px] font-semibold transition-opacity cursor-pointer shadow-xs"
              >
                {isActivating ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
