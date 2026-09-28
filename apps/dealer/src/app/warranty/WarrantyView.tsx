'use client';

import React, { useState, useMemo } from 'react';
import type { Warranty } from '@trionyx/types';

interface WarrantyViewProps {
  initialWarranties: Warranty[];
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

export function WarrantyView({ initialWarranties }: WarrantyViewProps) {
  const [warranties, setWarranties] = useState<Warranty[]>(initialWarranties);
  const [search, setSearch] = useState('');

  // Check Warranty Tool State
  const [checkSerial, setCheckSerial] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    found: boolean;
    valid?: boolean;
    warranty?: Warranty;
    productName?: string;
    message?: string;
  } | null>(null);

  // Activation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
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

  // Quick Check Serial handler
  const handleCheckSerial = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = checkSerial.trim().toUpperCase();
    if (!clean) return;

    setIsChecking(true);
    setCheckResult(null);

    // First check local registered warranties
    const local = warranties.find((w) => w.serialNumber.toUpperCase() === clean);
    if (local) {
      setCheckResult({
        found: true,
        warranty: local,
        productName: local.productName || undefined,
      });
      setIsChecking(false);
      return;
    }

    // Otherwise check via validate-serial API
    try {
      const res = await fetch('/api/v1/dealer/warranties/validate-serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: clean }),
      });
      const json = await res.json();

      if (json.data?.valid) {
        setCheckResult({
          found: false,
          valid: true,
          productName: json.data.productName,
          message: 'Serial verified in inventory — eligible for warranty registration.',
        });
      } else {
        setCheckResult({
          found: false,
          valid: false,
          message: json.data?.error || json.error?.message || 'Serial number not recognized or already activated.',
        });
      }
    } catch {
      setCheckResult({
        found: false,
        valid: false,
        message: 'Network verification failed. Please try again.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Validate serial inside activation modal
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
      const res = await fetch('/api/v1/dealer/warranties/validate-serial', {
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
    const cleanSn = serialNumber.trim().toUpperCase();
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
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error?.message || 'Failed to activate warranty');
        return;
      }

      setFormSuccess(`Warranty successfully activated for ${cleanSn}`);
      setWarranties((prev) => [json.data, ...prev]);

      setTimeout(() => {
        setIsModalOpen(false);
        setSerialNumber('');
        setValidatedData(null);
        setFormSuccess(null);
      }, 1400);
    } catch {
      setFormError('Network error while activating warranty.');
    } finally {
      setIsActivating(false);
    }
  };

  // Group warranties
  const filteredWarranties = useMemo(() => {
    if (!search.trim()) return warranties;
    const q = search.trim().toLowerCase();
    return warranties.filter(
      (w) =>
        w.serialNumber.toLowerCase().includes(q) ||
        (w.productName && w.productName.toLowerCase().includes(q))
    );
  }, [warranties, search]);

  const activeWarranties = useMemo(
    () => filteredWarranties.filter((w) => w.derivedStatus === 'ACTIVE'),
    [filteredWarranties]
  );
  const expiredWarranties = useMemo(
    () => filteredWarranties.filter((w) => w.derivedStatus === 'EXPIRED'),
    [filteredWarranties]
  );
  const voidedWarranties = useMemo(
    () => filteredWarranties.filter((w) => w.status === 'VOID'),
    [filteredWarranties]
  );

  return (
    <div className="space-y-8 text-[#171714]">
      {/* 1. Header with Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0">
            Warranty
          </h1>
          <p className="mt-1 text-[13.5px] text-[#68665F] m-0">
            Activate warranty after installing an eligible Trionyx product.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSerialNumber('');
            setValidatedData(null);
            setFormError(null);
            setFormSuccess(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#F26522] hover:opacity-90 text-white font-semibold text-[13px] transition-opacity cursor-pointer self-start sm:self-auto shadow-xs"
        >
          Activate Warranty
        </button>
      </div>

      {/* 2. Check Warranty Tool */}
      <section aria-labelledby="check-warranty-heading" className="border-t border-[#171714]/10 pt-5 space-y-3">
        <h2 id="check-warranty-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
          CHECK WARRANTY
        </h2>

        <form onSubmit={handleCheckSerial} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter product serial number (e.g. TRX-BR-2609-000001)..."
              value={checkSerial}
              onChange={(e) => setCheckSerial(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 rounded-[4px] border border-[#171714]/15 bg-white font-mono text-[13px] text-[#171714] placeholder:font-sans placeholder:text-[#68665F]/60 focus:border-[#F26522] focus:outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isChecking || !checkSerial.trim()}
            className="px-4 py-1.5 rounded-[4px] border border-[#171714]/15 bg-white hover:bg-[#171714]/05 text-[#171714] text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isChecking ? 'Checking...' : 'Check Warranty'}
          </button>
        </form>

        {checkResult && (
          <div className="p-3.5 rounded-[4px] bg-white border border-[#171714]/10 text-[13px] max-w-xl">
            {checkResult.found && checkResult.warranty ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[#171714]">
                    {checkResult.warranty.serialNumber}
                  </span>
                  <span
                    className={`text-[10.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      checkResult.warranty.status === 'VOID'
                        ? 'bg-[#FEF2F2] text-[#B91C1C]'
                        : checkResult.warranty.derivedStatus === 'EXPIRED'
                        ? 'bg-[#F4F4F5] text-[#71717A]'
                        : 'bg-[#ECFDF5] text-[#065F46]'
                    }`}
                  >
                    {checkResult.warranty.derivedStatus || checkResult.warranty.status}
                  </span>
                </div>
                <div className="text-[12px] text-[#68665F]">
                  {checkResult.warranty.productName} · Installed {checkResult.warranty.installationDate} · Valid until {checkResult.warranty.warrantyEndDate}
                </div>
              </div>
            ) : checkResult.valid ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-[#065F46]">● Serial Verified</span>
                  <div className="text-[12px] text-[#68665F] mt-0.5">
                    {checkResult.productName} — {checkResult.message}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSerialNumber(checkSerial);
                    setIsModalOpen(true);
                    void handleValidateSerial();
                  }}
                  className="text-[12px] font-semibold text-[#F26522] hover:underline cursor-pointer shrink-0"
                >
                  Activate Warranty Now →
                </button>
              </div>
            ) : (
              <div className="text-[#DC2626] text-[12.5px]">
                ✕ {checkResult.message}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Warranty History / Recent Activations */}
      <section aria-labelledby="warranty-history-heading" className="border-t border-[#171714]/10 pt-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h2 id="warranty-history-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
            WARRANTY HISTORY ({warranties.length})
          </h2>

          {warranties.length > 0 && (
            <div className="w-full sm:w-64">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search serial or product..."
                className="w-full px-2.5 py-1 rounded-[4px] border border-[#171714]/15 bg-white text-[12.5px] text-[#171714] placeholder-[#68665F]/60 focus:border-[#F26522] focus:outline-none"
              />
            </div>
          )}
        </div>

        {warranties.length === 0 ? (
          <div className="py-6 space-y-2 text-[13.5px]">
            <p className="font-semibold text-[#171714] m-0">
              No warranties activated yet.
            </p>
            <p className="text-[#68665F] m-0">
              After installing an eligible product, activate the warranty using its serial number.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSerialNumber('');
                  setValidatedData(null);
                  setIsModalOpen(true);
                }}
                className="text-[13px] font-semibold text-[#F26522] hover:underline cursor-pointer"
              >
                Activate first warranty →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Group */}
            {activeWarranties.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#065F46] pb-1.5 border-b border-[#171714]/08">
                  ACTIVE ({activeWarranties.length})
                </div>
                <div className="divide-y divide-[#171714]/08 text-[13px]">
                  {activeWarranties.map((w) => (
                    <div key={w.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-[#171714]">{w.serialNumber}</span>
                          <span className="font-medium text-[#171714]">{w.productName}</span>
                        </div>
                        <div className="text-[12px] text-[#68665F] mt-0.5">
                          Installed: {dateFormatter.format(new Date(w.installationDate))} · Valid Until: {dateFormatter.format(new Date(w.warrantyEndDate))}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#065F46] uppercase">
                        Active Coverage
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expired Group */}
            {expiredWarranties.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] pb-1.5 border-b border-[#171714]/08">
                  EXPIRED ({expiredWarranties.length})
                </div>
                <div className="divide-y divide-[#171714]/08 text-[13px]">
                  {expiredWarranties.map((w) => (
                    <div key={w.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-[#68665F]">{w.serialNumber}</span>
                          <span className="font-medium text-[#171714]">{w.productName}</span>
                        </div>
                        <div className="text-[12px] text-[#68665F] mt-0.5">
                          Expired: {dateFormatter.format(new Date(w.warrantyEndDate))}
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-[#68665F] uppercase">
                        Expired
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voided Group */}
            {voidedWarranties.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#DC2626] pb-1.5 border-b border-[#171714]/08">
                  VOIDED ({voidedWarranties.length})
                </div>
                <div className="divide-y divide-[#171714]/08 text-[13px]">
                  {voidedWarranties.map((w) => (
                    <div key={w.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-[#DC2626]">{w.serialNumber}</span>
                          <span className="font-medium text-[#171714]">{w.productName}</span>
                        </div>
                        <div className="text-[12px] text-[#68665F] mt-0.5">
                          Reason: {w.voidReason || 'Revoked'}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#DC2626] uppercase">
                        Voided
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Activation Modal (Section 18) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FCFBF7] border border-[#171714]/15 rounded-[4px] p-6 max-w-lg w-full space-y-4 shadow-lg text-[#171714]">
            <div className="flex items-center justify-between border-b border-[#171714]/10 pb-3">
              <h2 className="text-[16px] font-bold text-[#171714] m-0">
                Activate Warranty
              </h2>
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
                  value={serialNumber}
                  onChange={(e) => {
                    setSerialNumber(e.target.value.toUpperCase());
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
                    onClick={() => void handleValidateSerial()}
                    disabled={isValidating || !serialNumber.trim()}
                    className="px-4 py-1.5 rounded-[4px] bg-[#171714] hover:opacity-90 disabled:opacity-50 text-white text-[13px] font-semibold transition-opacity cursor-pointer shrink-0"
                  >
                    {isValidating ? 'Verifying...' : 'Verify'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setValidatedData(null);
                      setSerialNumber('');
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
                  <span>Warranty Duration:</span>
                  <span>{validatedData.policyDurationMonths} Months</span>
                </div>
              </div>
            )}

            {/* Step 3: Installation Date */}
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
                {isActivating ? 'Activating...' : 'Activate Warranty'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
