'use client';

import React, { useState, useEffect, useRef, useMemo, useId, useCallback } from 'react';
import type { Product, InventoryLocation } from '@trionyx/types';
import {
  useBarcodeScanner,
  CameraScannerModal,
  type SerialInputSource,
  playScanSound,
} from '@trionyx/ui';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  locations: InventoryLocation[];
  initialProductId?: string;
  initialLocationId?: string;
  onSuccess?: () => void;
}

export function ReceiveStockModal({
  isOpen,
  onClose,
  products,
  locations,
  initialProductId,
  initialLocationId,
  onSuccess,
}: ReceiveStockModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const productSelectRef = useRef<HTMLSelectElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Map<string, boolean>>(new Map());

  // Form states
  const [productId, setProductId] = useState(initialProductId || '');
  const [locationId, setLocationId] = useState(initialLocationId || '');
  const [serialsText, setSerialsText] = useState('');
  const [inputSerial, setInputSerial] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Execution & feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Parse raw serial tokens (splitting on newlines, commas, semicolons)
  const parsedSerials = useMemo(() => {
    return serialsText
      .split(/[\n,;]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);
  }, [serialsText]);

  // Calculate duplicate serials within the entered batch
  const { duplicatesCount, duplicateSerials } = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    let count = 0;

    for (const sn of parsedSerials) {
      if (seen.has(sn)) {
        dupes.add(sn);
        count++;
      } else {
        seen.add(sn);
      }
    }

    return {
      duplicatesCount: count,
      duplicateSerials: Array.from(dupes),
    };
  }, [parsedSerials]);

  // Unique list of entered serials
  const uniqueSerials = useMemo(() => {
    return Array.from(new Set(parsedSerials));
  }, [parsedSerials]);

  // Debounced check against database for existing stock collisions
  useEffect(() => {
    if (uniqueSerials.length === 0) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      const foundConflicts: string[] = [];
      // Pre-check up to 40 items to keep validation fast & responsive
      const toCheck = uniqueSerials.slice(0, 40);

      await Promise.all(
        toCheck.map(async (sn) => {
          if (cacheRef.current.has(sn)) {
            if (cacheRef.current.get(sn)) {
              foundConflicts.push(sn);
            }
            return;
          }

          try {
            const res = await fetch(`/api/v1/internal/inventory/serials/${encodeURIComponent(sn)}`);
            if (res.ok) {
              cacheRef.current.set(sn, true);
              foundConflicts.push(sn);
            } else if (res.status === 404) {
              cacheRef.current.set(sn, false);
            }
          } catch {
            // Silently allow fallback to server-side transaction validation
          }
        })
      );

      if (isMounted) {
        setConflicts(foundConflicts);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [uniqueSerials]);

  // Compute active conflicts for currently entered unique serials
  const activeConflicts = useMemo(() => {
    if (uniqueSerials.length === 0) return [];
    return conflicts.filter((c) => uniqueSerials.includes(c));
  }, [conflicts, uniqueSerials]);

  const conflictsCount = activeConflicts.length;

  // Single unified handler for all 4 input sources (Keyboard, Paste, USB Scanner, Camera)
  const handleCapturedSerial = useCallback((rawSerial: string, source: SerialInputSource) => {
    const serial = rawSerial.trim().toUpperCase();
    if (!serial) return;

    setSerialsText((prev) => {
      const tokens = prev
        .split(/[\n,;]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      // Play auditory feedback based on duplicate status
      if (tokens.includes(serial)) {
        playScanSound('warning');
      } else {
        playScanSound('success');
      }

      return tokens.length > 0 ? `${tokens.join('\n')}\n${serial}` : serial;
    });
  }, []);

  const handleAddInputSerial = () => {
    const sn = inputSerial.trim().toUpperCase();
    if (!sn) return;
    handleCapturedSerial(sn, 'KEYBOARD');
    setInputSerial('');
  };

  const handleRemoveSerial = (indexToRemove: number) => {
    setSerialsText((prev) => {
      const tokens = prev
        .split(/[\n,;]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      tokens.splice(indexToRemove, 1);
      return tokens.join('\n');
    });
  };

  const handleClearAllSerials = () => {
    setSerialsText('');
    setInputSerial('');
  };

  // Attach USB/Bluetooth scanner hook while modal is open
  useBarcodeScanner({
    enabled: isOpen && !isCameraOpen,
    targetInputRef: serialInputRef,
    onScan: (scannedSerial, source) => {
      handleCapturedSerial(scannedSerial, source);
      setInputSerial('');
    },
  });

  // Calculate status per item in queue for visual queue list
  const serialItems = useMemo(() => {
    const seen = new Set<string>();
    return parsedSerials.map((sn, idx) => {
      let status: 'READY' | 'DUPLICATE' | 'CONFLICT' = 'READY';
      let label = 'Ready';

      if (seen.has(sn)) {
        status = 'DUPLICATE';
        label = 'Duplicate';
      } else if (conflicts.includes(sn)) {
        status = 'CONFLICT';
        label = 'Already in inventory';
      } else {
        seen.add(sn);
      }

      return {
        id: `${sn}-${idx}`,
        serialNumber: sn,
        status,
        label,
      };
    });
  }, [parsedSerials, conflicts]);

  const readyCount = useMemo(() => serialItems.filter((i) => i.status === 'READY').length, [serialItems]);
  const issuesCount = useMemo(() => serialItems.filter((i) => i.status !== 'READY').length, [serialItems]);

  // Validation blocking check
  const hasBlockingErrors =
    parsedSerials.length === 0 ||
    duplicatesCount > 0 ||
    conflictsCount > 0 ||
    !productId ||
    !locationId;

  // Accessibility: focus management and escape key listener
  useEffect(() => {
    if (!isOpen) {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
      }
      return;
    }

    lastActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus first input field when modal opens
    const focusTimer = setTimeout(() => {
      productSelectRef.current?.focus();
    }, 40);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (!isSubmitting) {
          onClose();
        }
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || hasBlockingErrors) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/internal/inventory/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          locationId,
          serialNumbers: parsedSerials,
          reference: reference.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const errMsg = data.error?.message || data.error || 'Failed to receive serial numbers.';
        setError(errMsg);

        // Detect if server identified conflicting serials
        if (typeof errMsg === 'string' && errMsg.includes('already exist in system:')) {
          const parts = errMsg.split('already exist in system:')[1];
          if (parts) {
            const serverConflicts = parts.split(',').map((s: string) => s.trim());
            setConflicts((prev) => Array.from(new Set([...prev, ...serverConflicts])));
            serverConflicts.forEach((sn: string) => cacheRef.current.set(sn, true));
          }
        }

        setIsSubmitting(false);
        return;
      }

      onSuccess?.();
      onClose();
    } catch {
      setError('Network error while processing stock receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background Overlay */}
      <div
        onClick={!isSubmitting ? onClose : undefined}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        aria-hidden="true"
      />

      {/* Dialog Card: Using design token variables for surface, border, and text */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[580px] max-h-[88vh] bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-[12px] shadow-2xl z-10 flex flex-col overflow-hidden text-[var(--text-primary)] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
          <h2 id={titleId} className="text-[18px] sm:text-[19px] font-semibold text-[var(--text-primary)] m-0 leading-tight">
            Receive Serial Units
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 [scrollbar-width:thin] [scrollbar-color:var(--border-strong)_transparent]">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-[6px] bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger)] text-[13px] font-normal"
              >
                {error}
              </div>
            )}

            {/* Field: Product */}
            <div>
              <label htmlFor="receive-product-select" className="block text-[13px] font-medium text-[var(--text-primary)] mb-[6px]">
                Product <span className="text-[var(--accent)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="receive-product-select"
                  ref={productSelectRef}
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full h-[40px] px-3.5 pr-10 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[13.5px] font-normal hover:border-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] appearance-none transition-colors cursor-pointer truncate"
                >
                  <option value="" disabled>Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.productCode})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Field: Receiving Location */}
            <div>
              <label htmlFor="receive-location-select" className="block text-[13px] font-medium text-[var(--text-primary)] mb-[6px]">
                Receiving Location <span className="text-[var(--accent)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="receive-location-select"
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full h-[40px] px-3.5 pr-10 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[13.5px] font-normal hover:border-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] appearance-none transition-colors cursor-pointer truncate"
                >
                  <option value="" disabled>Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>


            {/* Field: Serial Numbers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="receive-serial-quick-input" className="block text-[13px] font-medium text-[var(--text-primary)]">
                  Serial Numbers <span className="text-[var(--accent)]">*</span>
                </label>
                {parsedSerials.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSerials}
                    className="text-[12px] text-[var(--text-muted)] hover:text-[var(--status-danger)] transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Dual Input: Keyboard/USB scan input + Mobile Camera Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={serialInputRef}
                    id="receive-serial-quick-input"
                    type="text"
                    value={inputSerial}
                    onChange={(e) => setInputSerial(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInputSerial();
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text.includes('\n') || text.includes(',') || text.includes(';')) {
                        e.preventDefault();
                        const tokens = text
                          .split(/[\n,;]+/)
                          .map((s) => s.trim().toUpperCase())
                          .filter(Boolean);
                        if (tokens.length > 0) {
                          setSerialsText((prev) => {
                            const existing = prev.trim() ? prev.trim() + '\n' : '';
                            return existing + tokens.join('\n');
                          });
                          setInputSerial('');
                          playScanSound('success');
                        }
                      }
                    }}
                    placeholder="Type, paste, or scan serial number..."
                    className="w-full h-[40px] px-3 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] font-mono text-[13px] hover:border-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[var(--text-muted)] placeholder:font-sans transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddInputSerial}
                  disabled={!inputSerial.trim()}
                  className="px-3.5 h-[40px] rounded-[6px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-sunken)] disabled:opacity-40 text-[var(--text-primary)] text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3.5 h-[40px] rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="Scan serial with mobile/tablet camera"
                >
                  <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Camera</span>
                </button>
              </div>

              {/* Scanned Serial Queue View */}
              {parsedSerials.length > 0 ? (
                <div className="rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] overflow-hidden">
                  <div className="max-h-[170px] overflow-y-auto divide-y divide-[var(--border)]">
                    {serialItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="px-3 py-2 flex items-center justify-between text-[13px] hover:bg-[var(--surface-subtle)]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[var(--text-muted)] w-5">
                            {idx + 1}.
                          </span>
                          <span className="font-mono font-medium text-[var(--text-primary)]">
                            {item.serialNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === 'READY' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
                              Ready
                            </span>
                          )}
                          {item.status === 'DUPLICATE' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                              Duplicate
                            </span>
                          )}
                          {item.status === 'CONFLICT' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
                              Already in inventory
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveSerial(idx)}
                            aria-label={`Remove ${item.serialNumber}`}
                            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)] transition-colors cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Queue Summary Strip (Matching Section 14) */}
                  <div className="px-3 py-2 bg-[var(--surface-subtle)] border-t border-[var(--border)] flex items-center justify-between text-[12px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {parsedSerials.length} captured
                      </span>
                      <span>·</span>
                      <span className="text-[var(--status-success)] font-semibold">
                        {readyCount} ready
                      </span>
                      {issuesCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--status-danger)] font-semibold">
                            {issuesCount} issue{issuesCount === 1 ? '' : 's'}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] font-sans text-[var(--text-muted)]">
                      USB Scanner active
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-3 px-4 rounded-[6px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)]/20 text-center">
                  <span className="text-[12px] text-[var(--text-muted)] font-medium">
                    No serial units added yet
                  </span>
                </div>
              )}
            </div>

            {/* Field: Reference / Batch */}
            <div>
              <label htmlFor="receive-reference-input" className="block text-[13px] font-medium text-[var(--text-primary)] mb-[6px]">
                Reference / Batch
              </label>
              <input
                id="receive-reference-input"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-88401, BATCH-G2"
                className="w-full h-[40px] px-3.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] font-mono text-[13.5px] font-normal hover:border-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[var(--text-muted)] transition-colors"
              />
            </div>

            {/* Field: Operator Notes */}
            <div>
              <label htmlFor="receive-notes-input" className="block text-[13px] font-medium text-[var(--text-primary)] mb-[6px]">
                Operator Notes
              </label>
              <input
                id="receive-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ingested from production line"
                className="w-full h-[40px] px-3.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[13.5px] font-normal hover:border-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[var(--text-muted)] transition-colors"
              />
            </div>
          </div>

          {/* Footer: Pinned at bottom, always visible */}
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-[38px] px-4 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[13px] font-medium hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasBlockingErrors}
              className="h-[38px] px-5 rounded-[6px] bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground)] text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? 'Receiving...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile / Tablet Camera Scanner */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setTimeout(() => {
            serialInputRef.current?.focus();
          }, 50);
        }}
        onScan={(serial, source) => handleCapturedSerial(serial, source)}
        mode="continuous"
        title="Receive Stock — Continuous Scanner"
      />
    </div>
  );
}
