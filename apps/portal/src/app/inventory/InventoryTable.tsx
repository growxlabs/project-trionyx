'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  ProductInventorySummary,
  InventoryLocation,
  ProductCategory,
  Product,
  SafeUser,
  SerialStatus,
} from '@trionyx/types';
import { Modal } from '../../components/ui/Modal';
import { SerialNumberLookupModal } from '../../components/inventory/SerialNumberLookupModal';

interface InventoryTableProps {
  initialSummaries: ProductInventorySummary[];
  locations: InventoryLocation[];
  categories: ProductCategory[];
  products: Product[];
  user: SafeUser;
}

export function InventoryTable({
  initialSummaries,
  locations,
  categories,
  products,
  user,
}: InventoryTableProps) {
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal States
  const [modalMode, setModalMode] = useState<'RECEIVE' | 'TRANSFER' | 'ADJUST' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Serial Lookup Modal
  const [showLookupModal, setShowLookupModal] = useState(false);

  // Form Fields
  const [formProductId, setFormProductId] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formDestLocationId, setFormDestLocationId] = useState('');
  const [formSerialsText, setFormSerialsText] = useState('');
  const [formReference, setFormReference] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Status adjust form fields
  const [adjustSerialNumber, setAdjustSerialNumber] = useState('');
  const [adjustTargetStatus, setAdjustTargetStatus] = useState<SerialStatus>('INACTIVE');
  const [adjustReason, setAdjustReason] = useState('Cycle count physical verification discrepancy');
  const [adjustNotes, setAdjustNotes] = useState('');

  const canMutate = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Helper to parse serial numbers from textarea
  const parsedSerials = useMemo(() => {
    return formSerialsText
      .split(/[\n,;]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);
  }, [formSerialsText]);

  // Filter items
  const filteredSummaries = useMemo(() => {
    return initialSummaries.filter((item) => {
      if (selectedLocation !== 'ALL' && item.locationId !== selectedLocation) {
        return false;
      }
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) {
        return false;
      }
      if (selectedAvailability === 'IN_STOCK' && item.availableCount <= 0) {
        return false;
      }
      if (selectedAvailability === 'OUT_OF_STOCK' && item.availableCount > 0) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = item.productName.toLowerCase().includes(query);
        const matchCode = item.productCode.toLowerCase().includes(query);
        const matchLoc = item.locationName?.toLowerCase().includes(query);
        const matchLocCode = item.locationCode?.toLowerCase().includes(query);
        return matchName || matchCode || Boolean(matchLoc) || Boolean(matchLocCode);
      }
      return true;
    });
  }, [initialSummaries, search, selectedLocation, selectedCategory, selectedAvailability]);

  // Aggregate KPI metrics
  const totalAvailable = useMemo(
    () => initialSummaries.reduce((acc, it) => acc + it.availableCount, 0),
    [initialSummaries]
  );
  const totalTracked = useMemo(
    () => initialSummaries.reduce((acc, it) => acc + it.totalCount, 0),
    [initialSummaries]
  );
  const zeroStockCount = useMemo(
    () => initialSummaries.filter((it) => it.availableCount === 0).length,
    [initialSummaries]
  );
  const activeLocationsCount = useMemo(
    () => locations.filter((l) => l.status === 'ACTIVE').length,
    [locations]
  );

  const openReceiveModal = (productId?: string, locationId?: string) => {
    setModalError(null);
    setFormProductId(productId || products[0]?.id || '');
    setFormLocationId(locationId || locations[0]?.id || '');
    setFormSerialsText('');
    setFormReference('');
    setFormNotes('');
    setModalMode('RECEIVE');
  };

  const openTransferModal = (locationId?: string) => {
    setModalError(null);
    const sourceLoc = locationId || locations[0]?.id || '';
    setFormLocationId(sourceLoc);
    const otherLoc = locations.find((l) => l.id !== sourceLoc)?.id || '';
    setFormDestLocationId(otherLoc);
    setFormSerialsText('');
    setFormReference('');
    setFormNotes('');
    setModalMode('TRANSFER');
  };

  const openAdjustModal = () => {
    setModalError(null);
    setAdjustSerialNumber('');
    setAdjustTargetStatus('INACTIVE');
    setAdjustReason('Physical inspection variance / damaged packaging');
    setAdjustNotes('');
    setModalMode('ADJUST');
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId || !formLocationId) {
      setModalError('Please specify product and facility location.');
      return;
    }
    if (parsedSerials.length === 0) {
      setModalError('Please enter at least one serial number to receive.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch('/api/v1/internal/inventory/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formProductId,
          locationId: formLocationId,
          serialNumbers: parsedSerials,
          reference: formReference.trim() || undefined,
          notes: formNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setModalError(data.error?.message || data.error || 'Failed to receive serial numbers.');
        setIsSubmitting(false);
        return;
      }

      setModalMode(null);
      router.refresh();
    } catch {
      setModalError('Network error while processing stock receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLocationId || !formDestLocationId) {
      setModalError('Please select both source and destination facilities.');
      return;
    }
    if (formLocationId === formDestLocationId) {
      setModalError('Source and destination locations cannot be the same.');
      return;
    }
    if (parsedSerials.length === 0) {
      setModalError('Please enter at least one serial number to transfer.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch('/api/v1/internal/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLocationId: formLocationId,
          destinationLocationId: formDestLocationId,
          serialNumbers: parsedSerials,
          reference: formReference.trim() || undefined,
          notes: formNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setModalError(data.error?.message || data.error || 'Failed to transfer serial numbers.');
        setIsSubmitting(false);
        return;
      }

      setModalMode(null);
      router.refresh();
    } catch {
      setModalError('Network error while processing stock transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustSerialNumber.trim()) {
      setModalError('Serial number is required.');
      return;
    }
    if (!adjustReason || adjustReason.trim().length < 3) {
      setModalError('A valid adjustment reason is mandatory (minimum 3 characters).');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      // First lookup serial to get record ID
      const lookupRes = await fetch(`/api/inventory/serials/lookup?sn=${encodeURIComponent(adjustSerialNumber.trim())}`);
      const lookupData = await lookupRes.json();

      if (!lookupData.success || !lookupData.serial) {
        setModalError(`Serial number "${adjustSerialNumber.trim()}" not found in inventory.`);
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialRecordId: lookupData.serial.id,
          newStatus: adjustTargetStatus,
          reason: adjustReason.trim(),
          notes: adjustNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setModalError(data.error || 'Failed to adjust serial status.');
        setIsSubmitting(false);
        return;
      }

      setModalMode(null);
      router.refresh();
    } catch {
      setModalError('Network error while processing serial status adjustment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
            DISTRIBUTION LOGISTICS
          </span>
          <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
            Serial Number Inventory
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
            Real-time physical inventory tracked by discrete serial numbers across distribution hubs.
          </p>
        </div>

        {/* Action Buttons & Links */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Lookup Button */}
          <button
            type="button"
            onClick={() => setShowLookupModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--accent-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Lookup Serial
          </button>

          <Link
            href="/inventory/movements"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Movements Ledger
          </Link>

          <Link
            href="/inventory/locations"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Locations
          </Link>

          {canMutate && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openReceiveModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[var(--status-success)] hover:bg-[var(--status-success)] text-[var(--background)] text-[13px] font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Receive Serials
              </button>

              <button
                type="button"
                onClick={() => openTransferModal()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer"
              >
                Transfer
              </button>

              <button
                type="button"
                onClick={() => openAdjustModal()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer"
              >
                Adjust
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--status-success)] block mb-1">
            Available Physical Units
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-[var(--status-success)] tracking-tight">{totalAvailable}</span>
            <span className="text-[11.5px] text-[var(--text-muted)]">({totalTracked} total tracked)</span>
          </div>
        </div>

        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
            Allocated Positions
          </span>
          <span className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">
            {initialSummaries.length}
          </span>
        </div>

        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--status-danger)] block mb-1">
            Zero Stock Positions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-[var(--status-danger)] tracking-tight">{zeroStockCount}</span>
            <span className="text-[11.5px] text-[var(--text-muted)]">out of stock</span>
          </div>
        </div>

        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
            Active Facilities
          </span>
          <span className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">
            {activeLocationsCount}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(23,23,20,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
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
            placeholder="Search by product name, product code (TRX-PROD-...), or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Location filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="ALL">All Facilities</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.code})
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Availability filter */}
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value as 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK')}
            className="px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock (Available &gt; 0)</option>
            <option value="OUT_OF_STOCK">Zero Stock</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)]">
        {filteredSummaries.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">No inventory positions found</p>
            <p className="text-[12.5px] m-0">
              Try adjusting your search criteria or receive initial physical serial numbers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Facility / Location</th>
                  <th className="py-3 px-4 text-right font-bold">Available Serials</th>
                  <th className="py-3 px-4 text-right">Total Tracked</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Last Movement</th>
                  {canMutate && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredSummaries.map((item, idx) => (
                  <tr key={`${item.productId}-${item.locationId || idx}`} className="hover:bg-[var(--surface)] transition-colors">
                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors block"
                      >
                        {item.productName}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11.5px] font-bold text-[var(--accent-text)]">
                          {item.productCode}
                        </span>
                        {item.categoryName && (
                          <>
                            <span className="text-[11.5px] text-[var(--text-muted)]">•</span>
                            <span className="text-[11.5px] text-[var(--text-secondary)]">{item.categoryName}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[var(--text-primary)] block">{item.locationName}</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{item.locationCode}</span>
                    </td>

                    {/* Available Serials */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[14px]">
                      <span className={item.availableCount > 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}>
                        {item.availableCount}
                      </span>
                    </td>

                    {/* Total Serials */}
                    <td className="py-3.5 px-4 text-right font-mono text-[var(--text-secondary)]">
                      {item.totalCount}
                    </td>

                    {/* Product Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          item.status === 'ACTIVE'
                            ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                            : 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Last Movement */}
                    <td className="py-3.5 px-4 text-[var(--text-muted)] text-[12px] whitespace-nowrap">
                      {new Date(item.lastUpdated).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Actions */}
                    {canMutate && (
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openReceiveModal(item.productId, item.locationId)}
                          className="px-2 py-1 rounded bg-[var(--background)] hover:bg-[var(--surface-subtle)] text-[11.5px] font-semibold text-[var(--status-success)] cursor-pointer"
                        >
                          + In
                        </button>
                        <button
                          type="button"
                          onClick={() => openTransferModal(item.locationId)}
                          className="px-2 py-1 rounded bg-[var(--background)] hover:bg-[var(--surface-subtle)] text-[11.5px] font-medium text-[var(--text-primary)] cursor-pointer"
                        >
                          Transfer
                        </button>
                        <Link
                          href={`/products/${item.productId}`}
                          className="px-2 py-1 rounded bg-[var(--background)] hover:bg-[var(--surface-subtle)] text-[11.5px] font-medium text-[var(--text-primary)]"
                        >
                          View
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RECEIVE SERIAL NUMBERS MODAL                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalMode === 'RECEIVE'}
        onClose={() => setModalMode(null)}
        title="Receive Serial Number Units"
      >
        <form onSubmit={handleReceiveSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Target Product *
            </label>
            <select
              value={formProductId}
              onChange={(e) => setFormProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.productCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Receiving Facility / Location *
            </label>
            <select
              value={formLocationId}
              onChange={(e) => setFormLocationId(e.target.value)}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Serial Numbers (Batch Input) *
              </label>
              <span className="text-[11.5px] font-mono font-bold text-[var(--status-success)] bg-[var(--status-success-soft)] border border-[var(--status-success-border)] px-2 py-0.5 rounded">
                {parsedSerials.length} unit{parsedSerials.length === 1 ? '' : 's'} detected
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={formSerialsText}
              onChange={(e) => setFormSerialsText(e.target.value)}
              placeholder="Paste or scan serial numbers (separated by lines or commas):&#10;TRX10001&#10;TRX10002&#10;TRX10003"
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono text-[12.5px] uppercase focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] resize-y"
            />
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1 m-0">
              Each serial number must be distinct. Collisions with existing stock will be rejected.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Reference / PO / Batch
              </label>
              <input
                type="text"
                value={formReference}
                onChange={(e) => setFormReference(e.target.value)}
                placeholder="e.g. PO-88401, BATCH-G2"
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Operator Notes
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Ingested from production line"
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || parsedSerials.length === 0}
              className="px-4 py-2 rounded-[6px] bg-[var(--status-success)] hover:bg-[var(--status-success)] disabled:opacity-50 text-[var(--background)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Recording...' : `Confirm Receipt (${parsedSerials.length} Serials)`}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* TRANSFER SERIAL NUMBERS MODAL                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalMode === 'TRANSFER'}
        onClose={() => setModalMode(null)}
        title="Transfer Serial Numbers Between Facilities"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Source Location *
              </label>
              <select
                value={formLocationId}
                onChange={(e) => setFormLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Destination Location *
              </label>
              <select
                value={formDestLocationId}
                onChange={(e) => setFormDestLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id} disabled={loc.id === formLocationId}>
                    {loc.name} ({loc.code}) {loc.id === formLocationId ? '(Source)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Serial Numbers to Move *
              </label>
              <span className="text-[11.5px] font-mono font-bold text-[var(--status-info)] bg-[var(--status-info-soft)] border border-[var(--status-info-border)] px-2 py-0.5 rounded">
                {parsedSerials.length} unit{parsedSerials.length === 1 ? '' : 's'}
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={formSerialsText}
              onChange={(e) => setFormSerialsText(e.target.value)}
              placeholder="Enter or scan serial numbers to move:&#10;TRX10001&#10;TRX10002"
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono text-[12.5px] uppercase focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Dispatch Reference / Waybill
              </label>
              <input
                type="text"
                value={formReference}
                onChange={(e) => setFormReference(e.target.value)}
                placeholder="e.g. TRF-2026-09"
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Transfer Notes
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Inter-hub replenishment"
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || parsedSerials.length === 0}
              className="px-4 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 text-[var(--background)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Transferring...' : `Execute Transfer (${parsedSerials.length} Serials)`}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* ADJUST STATUS MODAL                                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalMode === 'ADJUST'}
        onClose={() => setModalMode(null)}
        title="Adjust Serial Number Status"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Serial Number *
            </label>
            <input
              type="text"
              required
              value={adjustSerialNumber}
              onChange={(e) => setAdjustSerialNumber(e.target.value.toUpperCase())}
              placeholder="e.g. TRX10001"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono font-bold text-[13px] uppercase focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              New Status *
            </label>
            <select
              value={adjustTargetStatus}
              onChange={(e) => setAdjustTargetStatus(e.target.value as SerialStatus)}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="AVAILABLE">AVAILABLE (Active Stock)</option>
              <option value="INACTIVE">INACTIVE (Decommissioned / Damaged / QA Hold)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Mandatory Audit Reason *
            </label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Compromised outer packaging discovered during cycle audit"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              placeholder="Additional audit notes..."
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !adjustSerialNumber.trim()}
              className="px-4 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 text-[var(--background)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Adjusting...' : 'Update Serial Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Interactive Serial Number Lookup Modal */}
      <SerialNumberLookupModal
        isOpen={showLookupModal}
        onClose={() => setShowLookupModal(false)}
      />
    </div>
  );
}
