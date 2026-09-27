'use client';

import React, { useState, useTransition } from 'react';
import type { Warranty } from '@trionyx/types';

interface WarrantyViewProps {
  initialWarranties: Warranty[];
}

export function WarrantyView({ initialWarranties }: WarrantyViewProps) {
  const [warranties, setWarranties] = useState<Warranty[]>(initialWarranties);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'VOID'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Activation Form State
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

  const filteredWarranties = warranties.filter((w) => {
    const matchesSearch =
      w.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (w.productName && w.productName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return w.derivedStatus === 'ACTIVE';
    if (statusFilter === 'EXPIRED') return w.derivedStatus === 'EXPIRED';
    if (statusFilter === 'VOID') return w.status === 'VOID';
    return true;
  });

  const handleValidateSerial = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleConfirmActivate = async () => {
    const cleanSn = serialNumber.trim().toUpperCase();
    if (!cleanSn || !installationDate) {
      setFormError('Please fill in both serial number and installation date');
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

      setFormSuccess(`Warranty successfully activated for serial ${cleanSn}!`);
      // Update local state
      setWarranties((prev) => [json.data, ...prev]);

      // Reset form after short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setSerialNumber('');
        setValidatedData(null);
        setFormSuccess(null);
      }, 1500);
    } catch {
      setFormError('Network error while activating warranty.');
    } finally {
      setIsActivating(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#171714]/10">
        <div>
          <span className="text-[11px] font-bold text-[#F26522] tracking-[0.14em] uppercase block">
            Partner Services
          </span>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#171714] mt-0.5">
            Warranty Registrations
          </h1>
          <p className="text-[14px] text-[#171714]/65 mt-1">
            Activate customer warranties upon product installation and track active coverage terms.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setFormError(null);
            setFormSuccess(null);
            setValidatedData(null);
            setSerialNumber('');
          }}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-[#171714] hover:bg-[#2A2A26] active:bg-black text-white text-[13px] font-semibold uppercase tracking-wider rounded-[4px] shadow-xs transition-colors shrink-0 select-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Activate Warranty</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by serial number or product name..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#171714]/15 rounded-[4px] text-[14px] text-[#171714] placeholder:text-[#171714]/40 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] transition-colors"
          />
          <svg
            className="w-4 h-4 text-[#171714]/40 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF9F5] p-1 border border-[#171714]/10 rounded-[4px] text-[13px]">
          {(['ALL', 'ACTIVE', 'EXPIRED', 'VOID'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-[3px] font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-[#171714] text-white'
                  : 'text-[#171714]/60 hover:text-[#171714]'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Warranties Table / Cards */}
      {filteredWarranties.length === 0 ? (
        <div className="bg-white border border-[#171714]/10 rounded-[6px] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#171714]/05 text-[#171714]/40 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-[16px] font-semibold text-[#171714]">No warranties found</h3>
          <p className="text-[13px] text-[#171714]/60 mt-1 max-w-sm mx-auto">
            {search
              ? 'No registered warranties matched your search term.'
              : 'You have not activated any product warranties yet. Click "Activate Warranty" above to register your first installation.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#171714]/10 rounded-[6px] overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FAF9F5] border-b border-[#171714]/10 text-[#171714]/60 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Installation Date</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Activated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171714]/06">
                {filteredWarranties.map((w) => {
                  const isExpired = w.derivedStatus === 'EXPIRED';
                  const isVoid = w.status === 'VOID';
                  return (
                    <tr key={w.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#171714]">
                        {w.serialNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#171714]">
                        {w.productName || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#171714]/80">
                        {formatDate(w.installationDate)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#171714]">
                        {formatDate(w.warrantyEndDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isVoid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-bold uppercase tracking-wider bg-[#EF4444]/10 text-[#DC2626]">
                            Void
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#047857]">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#171714]/50">
                        {formatDate(w.activatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-[#171714]/08">
            {filteredWarranties.map((w) => (
              <div key={w.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[14px] text-[#171714]">
                    {w.serialNumber}
                  </span>
                  {w.status === 'VOID' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase bg-[#EF4444]/10 text-[#DC2626]">
                      Void
                    </span>
                  ) : w.derivedStatus === 'EXPIRED' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase bg-[#10B981]/15 text-[#047857]">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-[#171714] font-medium">
                  {w.productName || 'Trionyx Product'}
                </div>
                <div className="flex items-center justify-between text-[12px] text-[#171714]/65 pt-1">
                  <span>Installed: {formatDate(w.installationDate)}</span>
                  <span>Valid to: {formatDate(w.warrantyEndDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVATE WARRANTY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#171714]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border border-[#171714]/15 rounded-[8px] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#171714]/10">
              <div>
                <h3 className="text-[18px] font-bold text-[#171714]">
                  Activate Product Warranty
                </h3>
                <p className="text-[13px] text-[#171714]/65 mt-0.5">
                  Verify the serial number and confirm customer installation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#171714]/50 hover:text-[#171714] hover:bg-[#171714]/05 transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-[#FEE2E2]/70 border border-[#EF4444]/25 rounded-[4px] text-[#991B1B] text-[13px] leading-relaxed">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 bg-[#D1FAE5]/70 border border-[#10B981]/25 rounded-[4px] text-[#065F46] text-[13px] leading-relaxed">
                {formSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#171714] uppercase tracking-wider mb-1.5">
                  Serial Number <span className="text-[#F26522]">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    spellCheck={false}
                    value={serialNumber}
                    disabled={isActivating || Boolean(validatedData)}
                    onChange={(e) => {
                      setSerialNumber(e.target.value.toUpperCase());
                      setValidatedData(null);
                      setFormError(null);
                    }}
                    placeholder="e.g. TRX-SN-XXXXXXXX"
                    className="flex-1 h-10 px-3.5 bg-white border border-[#171714]/20 rounded-[4px] text-[14px] font-mono uppercase focus:outline-none focus:border-[#F26522] disabled:bg-gray-100"
                  />
                  {!validatedData && (
                    <button
                      type="button"
                      disabled={isValidating || !serialNumber.trim()}
                      onClick={handleValidateSerial}
                      className="px-4 h-10 bg-[#171714] text-white text-[12px] font-semibold uppercase tracking-wider rounded-[4px] hover:bg-[#2A2A26] disabled:opacity-50 transition-colors"
                    >
                      {isValidating ? 'Checking...' : 'Verify'}
                    </button>
                  )}
                  {validatedData && (
                    <button
                      type="button"
                      onClick={() => setValidatedData(null)}
                      className="px-3 h-10 border border-[#171714]/20 text-[12px] font-medium text-[#171714] rounded-[4px] hover:bg-gray-50 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Read-Only Product Validation Summary */}
              {validatedData && (
                <div className="bg-white border border-[#10B981]/30 rounded-[6px] p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[#047857] text-[12px] font-bold uppercase tracking-wider">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Serial Verified</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#171714]/08 text-[13px]">
                    <div>
                      <span className="block text-[11px] text-[#171714]/50 uppercase tracking-wider font-semibold">
                        Product
                      </span>
                      <span className="font-semibold text-[#171714]">{validatedData.productName}</span>
                    </div>

                    <div>
                      <span className="block text-[11px] text-[#171714]/50 uppercase tracking-wider font-semibold">
                        Approved Duration
                      </span>
                      <span className="font-bold text-[#F26522]">
                        {validatedData.policyDurationMonths} Months ({Math.round((validatedData.policyDurationMonths || 0) / 12)} Yrs)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[#171714] uppercase tracking-wider mb-1.5">
                  Installation Date <span className="text-[#F26522]">*</span>
                </label>
                <input
                  type="date"
                  value={installationDate}
                  disabled={isActivating}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#171714]/20 rounded-[4px] text-[14px] focus:outline-none focus:border-[#F26522]"
                />
                <p className="text-[12px] text-[#171714]/60 mt-1">
                  Warranty begins on the date of vehicle application.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#171714]/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isActivating}
                className="px-4 py-2 text-[13px] font-medium text-[#171714]/70 hover:text-[#171714] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmActivate}
                disabled={isActivating || !validatedData}
                className="px-6 py-2 bg-[#171714] hover:bg-[#2A2A26] active:bg-black text-white text-[13px] font-semibold uppercase tracking-wider rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isActivating ? 'Activating...' : 'Confirm & Activate Warranty'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
