'use client';

import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import type { Product, InventoryLocation } from '@trionyx/types';

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
  const cacheRef = useRef<Map<string, boolean>>(new Map());

  // Form states
  const [productId, setProductId] = useState(initialProductId || '');
  const [locationId, setLocationId] = useState(initialLocationId || '');
  const [serialsText, setSerialsText] = useState('');
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
      {/* Background Overlay: Even dark overlay, workspace remains visible behind dialog */}
      <div
        onClick={!isSubmitting ? onClose : undefined}
        className="fixed inset-0 bg-[#171714]/40 transition-opacity animate-in fade-in duration-150"
        aria-hidden="true"
      />

      {/* Dialog Card: Exactly 560px max width, 8px radius, white background, #E5E3DB border */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[560px] max-h-[85vh] bg-[#FFFFFF] border border-[#E5E3DB] rounded-[8px] p-6 shadow-[0_12px_32px_rgba(23,23,20,0.08)] z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-6 border-b border-[#E5E3DB] shrink-0">
          <div>
            <h2 id={titleId} className="text-[20px] font-semibold text-[#171714] font-sans m-0 leading-tight">
              Receive Serial Units
            </h2>
            <p className="text-[13px] font-normal text-[#66645E] font-sans mt-1 m-0">
              Register product serials into inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-1 rounded text-[#66645E] hover:text-[#171714] hover:bg-[#F7F6F0] transition-colors cursor-pointer -mr-1 -mt-1 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-0.5">
          {error && (
            <div
              role="alert"
              className="p-3 mb-4 rounded-[5px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] font-normal font-sans"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Field: Product */}
            <div>
              <label htmlFor="receive-product-select" className="block text-[13px] font-medium text-[#171714] font-sans mb-[6px]">
                Product <span className="text-[#D9362B]">*</span>
              </label>
              <div className="relative">
                <select
                  id="receive-product-select"
                  ref={productSelectRef}
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full h-[40px] px-3 pr-8 rounded-[5px] border border-[#D8D6CF] bg-[#FFFFFF] text-[#171714] text-[14px] font-normal font-sans hover:border-[#A9A59C] focus:outline-none focus:border-[#171714] focus:ring-1 focus:ring-[#171714] appearance-none transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.productCode})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#66645E]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Field: Receiving Location */}
            <div>
              <label htmlFor="receive-location-select" className="block text-[13px] font-medium text-[#171714] font-sans mb-[6px]">
                Receiving Location <span className="text-[#D9362B]">*</span>
              </label>
              <div className="relative">
                <select
                  id="receive-location-select"
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full h-[40px] px-3 pr-8 rounded-[5px] border border-[#D8D6CF] bg-[#FFFFFF] text-[#171714] text-[14px] font-normal font-sans hover:border-[#A9A59C] focus:outline-none focus:border-[#171714] focus:ring-1 focus:ring-[#171714] appearance-none transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#66645E]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Field: Serial Numbers */}
            <div>
              <label htmlFor="receive-serials-input" className="block text-[13px] font-medium text-[#171714] font-sans mb-[6px]">
                Serial Numbers <span className="text-[#D9362B]">*</span>
              </label>
              <textarea
                id="receive-serials-input"
                required
                rows={4}
                value={serialsText}
                onChange={(e) => setSerialsText(e.target.value)}
                placeholder="Paste or scan one serial per line"
                className="w-full min-h-[112px] max-h-[180px] p-3 rounded-[5px] border border-[#D8D6CF] bg-[#FFFFFF] text-[#171714] font-mono text-[14px] font-normal leading-relaxed hover:border-[#A9A59C] focus:outline-none focus:border-[#171714] focus:ring-1 focus:ring-[#171714] resize-y placeholder:text-[#A9A59C] placeholder:font-sans transition-colors"
              />

              {/* Quiet inline feedback */}
              <div
                className="mt-[6px] text-[12px] font-normal font-sans flex flex-wrap items-center gap-1.5 text-[#66645E]"
                aria-live="polite"
              >
                <span
                  className={
                    parsedSerials.length > 0 && duplicatesCount === 0 && conflictsCount === 0
                      ? 'text-[#166534] font-medium'
                      : 'text-[#66645E]'
                  }
                >
                  {parsedSerials.length} serial{parsedSerials.length === 1 ? '' : 's'} detected
                </span>
                <span className="text-[#D8D6CF]">·</span>
                <span className={duplicatesCount > 0 ? 'text-[#B45309] font-medium' : 'text-[#66645E]'}>
                  {duplicatesCount} duplicate{duplicatesCount === 1 ? '' : 's'}
                </span>
                <span className="text-[#D8D6CF]">·</span>
                <span className={conflictsCount > 0 ? 'text-[#DC2626] font-medium' : 'text-[#66645E]'}>
                  {conflictsCount} conflict{conflictsCount === 1 ? '' : 's'}
                </span>
              </div>

              {/* Accessible non-color assistance if validation errors exist */}
              {duplicatesCount > 0 && (
                <p className="text-[12px] text-[#B45309] font-sans mt-1 m-0">
                  Batch contains duplicate entries ({duplicateSerials.join(', ')}). Remove duplicates to proceed.
                </p>
              )}
              {conflictsCount > 0 && (
                <p className="text-[12px] text-[#DC2626] font-sans mt-1 m-0">
                  Conflicting serials already exist in inventory: {conflicts.join(', ')}.
                </p>
              )}
            </div>

            {/* Field: Reference / Batch */}
            <div>
              <label htmlFor="receive-reference-input" className="block text-[13px] font-medium text-[#171714] font-sans mb-[6px]">
                Reference / Batch
              </label>
              <input
                id="receive-reference-input"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-88401, BATCH-G2"
                className="w-full h-[40px] px-3 rounded-[5px] border border-[#D8D6CF] bg-[#FFFFFF] text-[#171714] font-mono text-[14px] font-normal hover:border-[#A9A59C] focus:outline-none focus:border-[#171714] focus:ring-1 focus:ring-[#171714] placeholder:text-[#A9A59C] placeholder:font-sans transition-colors"
              />
            </div>

            {/* Field: Operator Notes */}
            <div>
              <label htmlFor="receive-notes-input" className="block text-[13px] font-medium text-[#171714] font-sans mb-[6px]">
                Operator Notes
              </label>
              <input
                id="receive-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ingested from production line"
                className="w-full h-[40px] px-3 rounded-[5px] border border-[#D8D6CF] bg-[#FFFFFF] text-[#171714] font-sans text-[14px] font-normal hover:border-[#A9A59C] focus:outline-none focus:border-[#171714] focus:ring-1 focus:ring-[#171714] placeholder:text-[#A9A59C] transition-colors"
              />
            </div>
          </div>

          {/* Footer: 1px divider, actions aligned right */}
          <div className="pt-4 mt-6 border-t border-[#E5E3DB] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-[40px] px-4 rounded-[5px] border border-[#D8D6CF] bg-[#FFFFFF] text-[#171714] text-[13px] font-medium font-sans hover:bg-[#F7F6F0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171714] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasBlockingErrors}
              className="h-[40px] px-5 rounded-[5px] bg-[#171714] text-[#FFFFFF] text-[13px] font-medium font-sans hover:bg-[#2D2C27] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171714] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-none"
            >
              {isSubmitting ? 'Receiving...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
