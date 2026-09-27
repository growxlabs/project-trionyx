'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SerialNumberWithDetails } from '@trionyx/types';
import { Modal } from '../ui/Modal';

interface SerialNumberLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialSerialNumber?: string;
}

export function SerialNumberLookupModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialSerialNumber,
}: SerialNumberLookupModalProps) {
  const [query, setQuery] = useState(initialSerialNumber || initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serialData, setSerialData] = useState<SerialNumberWithDetails | null>(null);

  const executeLookup = React.useCallback(async (sn: string) => {
    if (!sn.trim()) return;
    setIsLoading(true);
    setError(null);
    setSerialData(null);

    try {
      const res = await fetch(`/api/inventory/serials/lookup?serialNumber=${encodeURIComponent(sn.trim())}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Serial number not found.');
        setIsLoading(false);
        return;
      }
      setSerialData(data.serial);
    } catch {
      setError('Network error while searching serial number.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialSerialNumber) {
      void executeLookup(initialSerialNumber);
    }
  }, [initialSerialNumber, executeLookup]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeLookup(query);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Serial Number Tracker & Lineage" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              autoFocus
              placeholder="Enter exact serial number (e.g. TRX12345)..."
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-4 py-2.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono text-[14px] uppercase placeholder:font-sans placeholder:normal-case placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2.5 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 text-[var(--background)] text-[13px] font-semibold transition-colors"
          >
            {isLoading ? 'Searching...' : 'Lookup'}
          </button>
        </form>

        {error && (
          <div className="p-3.5 rounded-[6px] bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px] flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Found Serial Record Card */}
        {serialData && (
          <div className="space-y-5 pt-2">
            {/* Top Identity Card */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-[8px] p-4.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-0.5">
                    PHYSICAL SERIAL NUMBER
                  </span>
                  <span className="font-mono text-[20px] font-bold text-[var(--accent-text)] tracking-wide">
                    {serialData.serialNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                      serialData.status === 'AVAILABLE'
                        ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                        : serialData.status === 'TRANSFERRED'
                        ? 'bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]'
                    }`}
                  >
                    {serialData.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px]">
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Product</span>
                  <Link
                    href={`/products/${serialData.product?.id}`}
                    className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors"
                  >
                    {serialData.product?.name}
                  </Link>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Current Location</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {serialData.location?.name} ({serialData.location?.code})
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Received Date</span>
                  <span className="text-[var(--text-primary)]">
                    {new Date(serialData.receivedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Movement History Timeline */}
            <div>
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3 flex items-center justify-between">
                <span>Movement History & Audit Trail</span>
                <span className="text-[12px] font-normal text-[var(--text-secondary)]">
                  {serialData.movements?.length || 0} event{serialData.movements?.length === 1 ? '' : 's'}
                </span>
              </h4>

              {!serialData.movements || serialData.movements.length === 0 ? (
                <p className="text-[13px] text-[var(--text-muted)] m-0">No movements recorded yet.</p>
              ) : (
                <div className="border border-[var(--border)] rounded-[6px] divide-y divide-[var(--border)] bg-[var(--surface-raised)] max-h-64 overflow-y-auto">
                  {serialData.movements.map((m) => (
                    <div key={m.id} className="p-3 text-[12.5px] hover:bg-[var(--surface)] transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              m.type === 'RECEIVED'
                                ? 'bg-[var(--status-success-soft)] text-[var(--status-success)]'
                                : m.type === 'TRANSFERRED'
                                ? 'bg-[var(--status-info-soft)] text-[var(--status-info)]'
                                : 'bg-[var(--status-danger-soft)] text-[var(--status-danger)]'
                            }`}
                          >
                            {m.type}
                          </span>
                          <span className="font-medium text-[var(--text-primary)]">
                            {m.type === 'TRANSFERRED'
                              ? `${m.fromLocationName || 'Facility'} → ${m.toLocationName || 'Facility'}`
                              : m.type === 'RECEIVED'
                              ? `Received at ${m.toLocationName || 'Facility'}`
                              : 'Status Adjustment'}
                          </span>
                        </div>
                        <span className="text-[var(--text-muted)] text-[11.5px] whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11.5px] text-[var(--text-secondary)] mt-1">
                        <span>
                          {m.reference && <strong className="text-[var(--text-primary)] mr-2">Ref: {m.reference}</strong>}
                          {m.reason || 'Recorded into ledger'}
                        </span>
                        <span>By {m.actorName || 'Operator'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
