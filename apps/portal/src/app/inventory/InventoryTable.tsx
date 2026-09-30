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
  SerialMovementWithDetails,
} from '@trionyx/types';
import { Modal } from '../../components/ui/Modal';
import { SerialNumberLookupModal } from '../../components/inventory/SerialNumberLookupModal';
import { ReceiveStockModal } from '../../components/inventory/ReceiveStockModal';
import {
  OperationalSummary,
  StatusBadge,
  RegistryToolbar,
  EmptyState,
  useRegisterWorkspaceViews,
  type WorkspaceViewsConfig,
} from '../../components/workspace';
import { WorkshopFrontageIcon } from '../../components/shell/OperationsIcons';

interface InventoryTableProps {
  initialSummaries: ProductInventorySummary[];
  locations: InventoryLocation[];
  categories: ProductCategory[];
  products: Product[];
  movements?: SerialMovementWithDetails[];
  user: SafeUser;
}

export type InventoryWorkspaceTab = 'registry' | 'exceptions' | 'movements';

export function InventoryTable({
  initialSummaries,
  locations,
  categories,
  products,
  movements = [],
  user,
}: InventoryTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InventoryWorkspaceTab>('registry');

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

  // Identify stock exceptions
  const stockExceptions = useMemo(() => {
    return initialSummaries
      .filter((it) => it.availableCount <= 5)
      .slice(0, 5)
      .map((it) => ({
        id: `${it.productId}-${it.locationId || 'no-loc'}`,
        productName: it.productName,
        productCode: it.productCode,
        locationName: it.locationName || 'No facility recorded',
        state: it.availableCount === 0 ? 'OUT' : 'LOW',
        available: it.availableCount,
        productId: it.productId,
        locationId: it.locationId,
      }));
  }, [initialSummaries]);

  const workspaceViews = useMemo<WorkspaceViewsConfig>(
    () => ({
      storageKey: 'trionyx-workspace-inventory',
      activeId: activeTab,
      onSelect: (id: string) => setActiveTab(id as InventoryWorkspaceTab),
      sections: [
        {
          items: [
            {
              id: 'registry',
              label: 'Inventory Registry',
            },
            {
              id: 'exceptions',
              label: 'Stock Exceptions',
            },
            {
              id: 'movements',
              label: 'Recent Movements',
            },
          ],
        },
      ],
    }),
    [activeTab]
  );
  useRegisterWorkspaceViews(workspaceViews);

  return (
    <div className="space-y-8">
      {/* 1. Operational Summary */}
      <OperationalSummary
        segments={[
          { text: 'Right now we hold ' },
          { value: totalAvailable, tone: 'positive' },
          { text: ' available units across ' },
          { value: activeLocationsCount },
          { text: ' active facilities, with ' },
          { value: zeroStockCount, tone: zeroStockCount > 0 ? 'danger' : 'default' },
          { text: ' out of stock of ' },
          { value: totalTracked },
          { text: ' tracked positions.' },
        ]}
      />

      {/* 2. Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {canMutate && (
          <button
            type="button"
            onClick={() => openReceiveModal()}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-white text-[13px] font-semibold transition-opacity cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" y1="22" x2="12" y2="12" />
            </svg>
            <span>Receive Serials</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowLookupModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12.5px] font-medium transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="7" x2="7" y2="17" />
            <line x1="12" y1="7" x2="12" y2="17" />
            <line x1="17" y1="7" x2="17" y2="17" />
          </svg>
          <span>Lookup Serial</span>
        </button>

        {canMutate && (
          <button
            type="button"
            onClick={() => openTransferModal()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 5h18" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 19H3" />
            </svg>
            <span>Transfer</span>
          </button>
        )}

        {canMutate && (
          <button
            type="button"
            onClick={() => openAdjustModal()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Adjust</span>
          </button>
        )}

        <Link
          href="/inventory/movements"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12.5px] font-medium transition-colors"
        >
          <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
          <span>Movements</span>
        </Link>

        <Link
          href="/inventory/locations"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12.5px] font-medium transition-colors"
        >
          <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Locations</span>
        </Link>
      </div>

      {/* 3. Workspace Stage — view selection lives in the secondary sidebar */}
      <div className="w-full">
          {/* TAB 1: INVENTORY REGISTRY */}
          {activeTab === 'registry' && (
            <section aria-labelledby="registry-heading" className="space-y-3">
              {filteredSummaries.length > 0 && (
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                <h2 id="registry-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0 shrink-0">
                  Inventory Registry
                </h2>
                </div>
                <RegistryToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search product, code, or facility..."
                filters={[
                  {
                    id: 'location',
                    label: 'Facility',
                    value: selectedLocation,
                    onChange: setSelectedLocation,
                    options: [
                      { label: 'All Facilities', value: 'ALL' },
                      ...locations.map((loc) => ({ label: `${loc.name} (${loc.code})`, value: loc.id })),
                    ],
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    value: selectedCategory,
                    onChange: setSelectedCategory,
                    options: [
                      { label: 'All Categories', value: 'ALL' },
                      ...categories.map((c) => ({ label: c.name, value: c.id })),
                    ],
                  },
                  {
                    id: 'availability',
                    label: 'Stock Level',
                    value: selectedAvailability,
                    onChange: (v) => setSelectedAvailability(v as 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'),
                    options: [
                      { label: 'All Stock Levels', value: 'ALL' },
                      { label: 'In Stock (> 0)', value: 'IN_STOCK' },
                      { label: 'Zero Stock', value: 'OUT_OF_STOCK' },
                    ],
                  },
                ]}
                />
              </div>
              )}

              {/* Main Table */}
              <div className={`overflow-hidden ${filteredSummaries.length === 0 ? '' : 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]'}`}>
                {filteredSummaries.length === 0 ? (
                  <EmptyState
                    icon={<WorkshopFrontageIcon className="w-20 h-20 text-[var(--text-muted)]" />}
                    title="No inventory positions found"
                    description="Try adjusting your search criteria or receive initial physical serial numbers."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                          <th className="py-2.5 px-4">Product</th>
                          <th className="py-2.5 px-4">Facility / Location</th>
                          <th className="py-2.5 px-4 text-right">Available Serials</th>
                          <th className="py-2.5 px-4 text-right">Total Tracked</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                          <th className="py-2.5 px-4">Last Movement</th>
                          {canMutate && <th className="py-2.5 px-4 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {filteredSummaries.map((item, idx) => (
                          <tr key={`${item.productId}-${item.locationId || idx}`} className="hover:bg-[var(--surface-subtle)] transition-colors h-[44px]">
                            {/* Product */}
                            <td className="py-2.5 px-4">
                              <Link
                                href={`/products/${item.productId}`}
                                className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)] block"
                              >
                                {item.productName}
                              </Link>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                                  {item.productCode}
                                </span>
                                {item.categoryName && (
                                  <>
                                    <span className="text-[12px] text-[var(--text-muted)]">•</span>
                                    <span className="text-[12px] text-[var(--text-secondary)]">{item.categoryName}</span>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Location */}
                            <td className="py-2.5 px-4">
                              {item.availableCount === 0 ? (
                                <span className="inline-flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                                  <svg width="28" height="26" viewBox="0 0 32 30" fill="none" aria-hidden="true">
                                    <path d="M4 26V5h24v21M3 26h26M4 15h24" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round" />
                                    <path d="M9 9h5v5H9zM20 8v2l-2 2v3h6v-3l-2-2V8" fill="var(--surface-subtle)" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinejoin="round" />
                                    <path d="M20 12h4" stroke="var(--accent)" strokeWidth="2" />
                                  </svg>
                                  <span>No stock recorded</span>
                                </span>
                              ) : <span className="text-[14px] font-normal text-[var(--text-primary)] block">{item.locationName}</span>}
                              <span className="font-mono text-[12px] text-[var(--text-secondary)]">{item.locationCode}</span>
                            </td>

                            {/* Available Serials */}
                            <td className="py-2.5 px-4 text-right font-sans font-semibold text-[14px]">
                              <span className={item.availableCount > 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}>
                                {item.availableCount}
                              </span>
                            </td>

                            {/* Total Serials */}
                            <td className="py-2.5 px-4 text-right font-sans text-[14px] text-[var(--text-secondary)]">
                              {item.totalCount}
                            </td>

                            {/* Product Status */}
                            <td className="py-2.5 px-4 text-center">
                              <StatusBadge status={item.status} />
                            </td>

                            {/* Last Movement */}
                            <td className="py-2.5 px-4 text-[var(--text-secondary)] text-[12px] whitespace-nowrap">
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
            </section>
          )}

          {/* TAB 2: STOCK EXCEPTIONS */}
          {activeTab === 'exceptions' && (
            <section aria-labelledby="stock-exceptions-heading" className={`p-4 space-y-4 ${stockExceptions.length > 0 ? 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]' : ''}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--status-danger)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
                  </svg>
                  <h2 id="stock-exceptions-heading" className="text-[14px] font-semibold text-[var(--status-danger)] m-0">
                    Stock Exceptions ({stockExceptions.length})
                  </h2>
                </div>
                {canMutate && (
                  <button
                    type="button"
                    onClick={() => openReceiveModal()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-[3px] bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.29 7 12 12 20.71 7" />
                      <line x1="12" y1="22" x2="12" y2="12" />
                    </svg>
                    <span>Receive Serials</span>
                  </button>
                )}
              </div>

              {stockExceptions.length === 0 ? (
                <EmptyState
                  icon={<WorkshopFrontageIcon className="w-20 h-20 text-[var(--text-muted)]" />}
                  title="No exceptions recorded"
                  description="All positions meet safety threshold levels."
                />
              ) : (
                <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                          <th className="py-2.5 px-4">Product</th>
                          <th className="py-2.5 px-4">Location</th>
                          <th className="py-2.5 px-4 w-28">State</th>
                          <th className="py-2.5 px-4 text-right w-28">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {stockExceptions.map((ex) => (
                          <tr key={ex.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[40px]">
                            <td className="py-2.5 px-4 text-[14px] font-medium text-[var(--text-primary)]">
                              {ex.productName}
                              <span className="block text-[12px] font-mono text-[var(--text-secondary)]">{ex.productCode}</span>
                            </td>
                            <td className="py-2.5 px-4 text-[14px] font-normal text-[var(--text-secondary)]">
                              {ex.locationName}
                            </td>
                            <td className="py-2.5 px-4">
                              <StatusBadge status={ex.state === 'OUT' ? 'OUT_OF_STOCK' : 'LOW'} label={ex.state === 'OUT' ? 'Out' : 'Low'} />
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              {canMutate ? (
                                <button
                                  type="button"
                                  onClick={() => openReceiveModal(ex.productId, ex.locationId || undefined)}
                                  className="text-[13px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
                                >
                                  Receive →
                                </button>
                              ) : (
                                <span className="text-[13px] text-[var(--text-secondary)]">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 3: RECENT MOVEMENTS */}
          {activeTab === 'movements' && (
            <section aria-labelledby="movements-heading" className={`p-4 space-y-4 ${movements.length > 0 ? 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]' : ''}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15 15" />
                  </svg>
                  <h2 id="movements-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                    Recent Movements ({movements.length})
                  </h2>
                </div>
                <Link href="/inventory/movements" className="text-[13px] font-medium text-[var(--accent)] hover:underline">
                  View full ledger →
                </Link>
              </div>

              {movements.length === 0 ? (
                <EmptyState
                  icon={<WorkshopFrontageIcon className="w-20 h-20 text-[var(--text-muted)]" />}
                  title="No movements yet"
                  description="Serial transfers will appear here."
                />
              ) : (
                <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                          <th className="py-2.5 px-4 w-20">Time</th>
                          <th className="py-2.5 px-4 w-36">Serial</th>
                          <th className="py-2.5 px-4">Product</th>
                          <th className="py-2.5 px-4">From</th>
                          <th className="py-2.5 px-4">To</th>
                          <th className="py-2.5 px-4 text-right w-28">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {movements.map((m) => {
                          const timeStr = new Date(m.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'Asia/Kolkata',
                          });
                          return (
                            <tr key={m.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[40px]">
                              <td className="py-2 px-4 font-mono text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                                {timeStr}
                              </td>
                              <td className="py-2 px-4 font-mono text-[12px] text-[var(--text-primary)]">
                                {m.serialNumber}
                              </td>
                              <td className="py-2 px-4 text-[14px] text-[var(--text-primary)] font-medium">
                                {m.productName}
                              </td>
                              <td className="py-2 px-4 text-[13px] text-[var(--text-secondary)]">
                                {m.fromLocationName || 'External Origin'}
                              </td>
                              <td className="py-2 px-4 text-[13px] text-[var(--text-secondary)]">
                                {m.toLocationName || 'External Destination'}
                              </td>
                              <td className="py-2 px-4 text-right">
                                <StatusBadge status={m.type} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}
      </div>

      {/* ========================================================================= */}
      {/* RECEIVE SERIAL NUMBERS MODAL                                              */}
      {/* ========================================================================= */}
      {modalMode === 'RECEIVE' && (
        <ReceiveStockModal
          isOpen={true}
          onClose={() => setModalMode(null)}
          products={products}
          locations={locations}
          initialProductId={formProductId}
          initialLocationId={formLocationId}
          onSuccess={() => {
            setModalMode(null);
            router.refresh();
          }}
        />
      )}

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
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)]">
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
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1">
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
