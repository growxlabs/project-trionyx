'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { PublicWarrantyCheckResult } from '@trionyx/types';
import { CameraScannerModal } from '@trionyx/ui';
import styles from './WarrantyCheckForm.module.css';

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

  const field = (label: string, value: React.ReactNode, mono = false) => (
    <div className={styles.field}>
      <dt>{label}</dt>
      <dd className={mono ? styles.mono : undefined}>{value}</dd>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="serial-number-input" className={styles.label}>
          Serial number <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputRow}>
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
            className={styles.input}
          />
          <button type="submit" disabled={isLoading} className={`pill-button ${styles.submit}`}>
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Checking…
              </>
            ) : (
              'Check warranty'
            )}
          </button>
        </div>
        <div className={styles.helpRow}>
          <button type="button" onClick={() => setIsCameraOpen(true)} className={`pill-button pill-button-ghost ${styles.scan}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Scan serial
          </button>
        </div>

        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
      </form>

      {result && (
        <div className={styles.result} role="status">
          {result.status === 'ACTIVE' && (
            <>
              <div className={styles.resultHead}>
                <h2>Warranty active</h2>
                <span className={`${styles.badge} ${styles.badgeActive}`}>
                  <span aria-hidden="true" /> Active
                </span>
              </div>
              <dl className={styles.fields}>
                {field('Product', result.productName || 'Trionyx Professional Product')}
                {field('Serial number', result.serialNumber, true)}
                {field('Installed / activated', formatDate(result.installationDate || result.activatedAt))}
                {field('Valid until', formatDate(result.warrantyEndDate))}
                {result.dealerName && field('Authorised studio / installer', result.dealerName)}
              </dl>
            </>
          )}

          {result.status === 'EXPIRED' && (
            <>
              <div className={styles.resultHead}>
                <h2>Warranty expired</h2>
                <span className={styles.badge}>Expired</span>
              </div>
              <dl className={styles.fields}>
                {field('Product', result.productName || 'Trionyx Professional Product')}
                {field('Serial number', result.serialNumber, true)}
                {field('Activated', formatDate(result.installationDate || result.activatedAt))}
                {field('Expired on', formatDate(result.warrantyEndDate))}
              </dl>
              <p className={styles.resultNote}>
                The coverage period for this product has ended. To inspect your coating or schedule a re-application,
                connect with an authorised Trionyx dealer.
              </p>
              <Link href="/contact" className="text-link">
                Contact an authorised dealer <span aria-hidden="true">→</span>
              </Link>
            </>
          )}

          {result.status === 'NOT_ACTIVATED' && (
            <>
              <div className={styles.resultHead}>
                <h2>Warranty not activated</h2>
                <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
              </div>
              <p className={styles.resultNote}>
                <span className={styles.mono}>{result.serialNumber}</span> is a valid Trionyx serial number, but no
                active warranty registration was found. Activation is completed by your authorised Trionyx studio or
                dealer after installation, so please reach out to your installer.
              </p>
              <Link href="/contact" className="text-link">
                Need help? Contact Trionyx support <span aria-hidden="true">→</span>
              </Link>
            </>
          )}

          {result.status === 'NOT_FOUND' && (
            <>
              <div className={styles.resultHead}>
                <h2>Serial number not found</h2>
              </div>
              <p className={styles.resultNote}>
                Check the serial number on your container or invoice and try again. Make sure every character is
                entered correctly, without extra punctuation.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setSerialNumber('');
                  document.getElementById('serial-number-input')?.focus();
                }}
                className={`text-link ${styles.clear}`}
              >
                Clear and try again
              </button>
            </>
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
