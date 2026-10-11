'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { PublicWarrantyCheckResult } from '@trionyx/types';
import { CameraScannerModal } from '@trionyx/ui';

export function WarrantyCheckForm() {
  const [serialNumber, setSerialNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PublicWarrantyCheckResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const executeCheck = async (sn: string) => {
    const cleanSn = sn.trim().toUpperCase();

    if (!cleanSn) {
      setErrorMessage('Please enter a serial number');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/public/warranty/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: cleanSn }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || 'Unable to check warranty. Please try again.');
        return;
      }

      setResult(json.data);
    } catch {
      setErrorMessage('Network connection error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeCheck(serialNumber);
  };

  const handleCameraScan = (scannedSerial: string) => {
    const sn = scannedSerial.trim().toUpperCase();
    if (!sn) return;
    setSerialNumber(sn);
    void executeCheck(sn);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full">
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="serial-number-input"
            className="block text-[13px] font-semibold text-[#FFFFEB] uppercase tracking-[0.05em] mb-2"
          >
            Serial Number <span className="text-[#F26522]">*</span>
          </label>
          <div className="relative">
            <input
              id="serial-number-input"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={serialNumber}
              onChange={(e) => {
                setSerialNumber(e.target.value.toUpperCase());
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. TRX-SN-XXXXXXXX"
              className="w-full h-13 px-4 sm:px-5 bg-[#FFFFEB] border border-[rgba(255,255,235,0.25)] rounded-[6px] text-[16px] sm:text-[17px] font-mono font-medium text-[#171714] uppercase tracking-wider placeholder:text-[rgba(23,23,20,0.45)] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] transition-colors"
            />
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[13px] text-[rgba(255,255,235,0.72)] m-0 leading-normal">
              You can find the serial number on your product packaging, container label, or installation invoice.
            </p>
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[6px] border border-[rgba(255,255,235,0.35)] hover:border-[#FFFFEB] bg-transparent hover:bg-[#FFFFEB]/10 text-[#FFFFEB] text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
              title="Scan serial with mobile/tablet camera"
            >
              <svg className="w-4 h-4 text-[#FFFFEB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Scan Serial</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-[#991B1B]/40 border border-[#F87171]/40 rounded-[6px] text-[#FEE2E2] text-[14px]">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[200px] h-12 px-8 bg-[#F26522] hover:bg-[#DC5414] active:bg-[#C4460D] text-white text-[14px] font-semibold tracking-[0.05em] uppercase rounded-[6px] transition-colors duration-150 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-[0_2px_4px_rgba(242,101,34,0.2)]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Checking...</span>
            </>
          ) : (
            <span>Check Warranty</span>
          )}
        </button>
      </form>

      {/* Results Presentation */}
      {result && (
        <div className="mt-10 pt-10 border-t border-[rgba(255,255,235,0.15)] animate-in fade-in duration-200">
          {/* STATE 1: ACTIVE WARRANTY */}
          {result.status === 'ACTIVE' && (
            <div className="bg-[#FAF9F5] border border-[#171714]/12 rounded-[6px] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-[#171714]/08">
                <div>
                  <span className="text-[12px] font-bold text-[#F26522] tracking-[0.14em] uppercase block">
                    Verification Confirmed
                  </span>
                  <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-[#171714] mt-1">
                    Warranty Active
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#047857] border border-[#10B981]/25 rounded-[3px] text-[12px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Active
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Product
                  </span>
                  <span className="block text-[17px] font-medium text-[#171714] mt-1">
                    {result.productName || 'Trionyx Professional Product'}
                  </span>
                </div>

                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Serial Number
                  </span>
                  <span className="block text-[17px] font-mono font-medium text-[#171714] mt-1">
                    {result.serialNumber}
                  </span>
                </div>

                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Installed / Activated
                  </span>
                  <span className="block text-[16px] text-[#171714] mt-1">
                    {formatDate(result.installationDate || result.activatedAt)}
                  </span>
                </div>

                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Valid Until
                  </span>
                  <span className="block text-[16px] font-semibold text-[#047857] mt-1">
                    {formatDate(result.warrantyEndDate)}
                  </span>
                </div>

                {result.dealerName && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#171714]/06">
                    <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                      Authorized Studio / Installer
                    </span>
                    <span className="block text-[15px] text-[#171714] mt-1">
                      {result.dealerName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE 2: EXPIRED WARRANTY */}
          {result.status === 'EXPIRED' && (
            <div className="bg-[#FAF9F5] border border-[#171714]/12 rounded-[6px] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-[#171714]/08">
                <div>
                  <span className="text-[12px] font-bold text-[#6B7280] tracking-[0.14em] uppercase block">
                    Term Elapsed
                  </span>
                  <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-[#171714] mt-1">
                    Warranty Expired
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#6B7280]/10 text-[#4B5563] border border-[#6B7280]/20 rounded-[3px] text-[12px] font-bold uppercase tracking-wider">
                  Expired
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Product
                  </span>
                  <span className="block text-[17px] font-medium text-[#171714] mt-1">
                    {result.productName || 'Trionyx Professional Product'}
                  </span>
                </div>

                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Serial Number
                  </span>
                  <span className="block text-[17px] font-mono font-medium text-[#171714] mt-1">
                    {result.serialNumber}
                  </span>
                </div>

                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Activated
                  </span>
                  <span className="block text-[16px] text-[#171714] mt-1">
                    {formatDate(result.installationDate || result.activatedAt)}
                  </span>
                </div>

                <div>
                  <span className="block text-[12px] font-semibold text-[#171714]/50 uppercase tracking-[0.06em]">
                    Expired On
                  </span>
                  <span className="block text-[16px] font-medium text-[#6B7280] mt-1">
                    {formatDate(result.warrantyEndDate)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#171714]/08">
                <p className="text-[14px] text-[#171714]/70">
                  The coverage period for this product has concluded. To inspect your coating or schedule a re-application, please connect with an authorized Trionyx dealer.
                </p>
                <div className="mt-3">
                  <Link
                    href="/contact"
                    className="text-[14px] font-semibold text-[#F26522] hover:text-[#D9531E] transition-colors"
                  >
                    Contact an authorized dealer →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: VALID SERIAL — NOT ACTIVATED */}
          {result.status === 'NOT_ACTIVATED' && (
            <div className="bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-[6px] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F59E0B]/15 text-[#B45309] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold text-[#92400E]">
                    Warranty Not Activated
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#78350F] mt-2">
                    This is a valid Trionyx product serial number ({result.serialNumber}), but no active warranty registration was found in our system.
                  </p>
                  <p className="text-[14px] text-[#78350F]/80 mt-2">
                    Warranty activation is performed by your authorized Trionyx detailing studio or dealer upon completion of installation. Please reach out to your installer to complete the activation process.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/contact"
                      className="inline-flex items-center text-[14px] font-semibold text-[#B45309] hover:text-[#78350F] underline transition-colors"
                    >
                      Need assistance? Contact Trionyx Support →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: INVALID SERIAL / NOT FOUND */}
          {result.status === 'NOT_FOUND' && (
            <div className="bg-[#FAF9F5] border border-[#171714]/15 rounded-[6px] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#171714]/08 text-[#171714] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold text-[#171714]">
                    Serial Number Not Found
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#171714]/70 mt-2">
                    Please check the serial number on your container or invoice and try again. Make sure all characters are entered correctly without extra punctuation.
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setSerialNumber('');
                        const el = document.getElementById('serial-number-input');
                        el?.focus();
                      }}
                      className="text-[13px] font-semibold text-[#F26522] uppercase tracking-wider hover:underline"
                    >
                      Clear & Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Public Warranty Camera Scanner */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setTimeout(() => {
            document.getElementById('serial-number-input')?.focus();
          }, 50);
        }}
        onScan={(serial) => handleCameraScan(serial)}
        mode="single"
        title="Scan Warranty Barcode / QR"
        subtitle="Align the serial barcode or QR code on your product packaging or certificate."
      />
    </div>
  );
}
