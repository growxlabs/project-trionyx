'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type {
  SerialMovementWithDetails,
  InventoryLocation,
  SerialMovementType,
} from '@trionyx/types';
import { SerialNumberLookupModal } from '../../../components/inventory/SerialNumberLookupModal';

interface MovementsTableProps {
  initialMovements: SerialMovementWithDetails[];
  locations: InventoryLocation[];
}

export function MovementsTable({ initialMovements, locations }: MovementsTableProps) {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedType, setSelectedType] = useState<SerialMovementType | 'ALL'>('ALL');

  // Serial lookup modal
  const [lookupSerial, setLookupSerial] = useState<string | undefined>(undefined);
  const [showLookupModal, setShowLookupModal] = useState(false);

  const filteredMovements = useMemo(() => {
    return initialMovements.filter((m) => {
      if (selectedLocation !== 'ALL') {
        const matchesLoc = m.fromLocationId === selectedLocation || m.toLocationId === selectedLocation;
        if (!matchesLoc) return false;
      }
      if (selectedType !== 'ALL' && m.type !== selectedType) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchSn = m.serialNumber?.toLowerCase().includes(query);
        const matchProd = m.productName?.toLowerCase().includes(query) || m.productCode?.toLowerCase().includes(query);
        const matchFrom = m.fromLocationName?.toLowerCase().includes(query);
        const matchTo = m.toLocationName?.toLowerCase().includes(query);
        const matchRef = m.reference?.toLowerCase().includes(query);
        const matchReason = m.reason?.toLowerCase().includes(query);
        const matchActor = m.actorName?.toLowerCase().includes(query);
        return matchSn || matchProd || matchFrom || matchTo || matchRef || matchReason || matchActor;
      }
      return true;
    });
  }, [initialMovements, search, selectedLocation, selectedType]);

  const typeBadge = (type: SerialMovementType) => {
    switch (type) {
      case 'RECEIVED':
        return 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]';
      case 'TRANSFERRED':
        return 'bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]';
      case 'ADJUSTED':
        return 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]';
      default:
        return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="mb-2">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Inventory Balances
            </Link>
          </div>
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
            IMMUTABLE AUDIT TRAIL
          </span>
          <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
            Serial Movement Ledger
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
            Append-only physical serial movement ledger tracking receipts, inter-facility transfers, and status adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLookupSerial(undefined);
              setShowLookupModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12.5px] font-semibold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--accent-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Lookup Serial
          </button>
          <span className="inline-flex items-center px-3 py-1.5 rounded bg-[var(--background)] border border-[var(--border)] text-[12px] font-medium text-[var(--text-secondary)]">
            {filteredMovements.length} transaction{filteredMovements.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
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
            placeholder="Search by serial number (TRX...), product, reference, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Movement Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as SerialMovementType | 'ALL')}
            className="px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="ALL">All Types</option>
            <option value="RECEIVED">RECEIVED (Initial Stock)</option>
            <option value="TRANSFERRED">TRANSFERRED (Inter-Facility)</option>
            <option value="ADJUSTED">ADJUSTED (Status / Audit)</option>
          </select>

          {/* Location Filter */}
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
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)]">
        {filteredMovements.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">No movement entries match criteria</p>
            <p className="text-[12.5px] m-0">Try changing your search term or movement type filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Route / Location</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                  <th className="py-3 px-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] whitespace-nowrap text-[12px]">
                      {new Date(m.createdAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${typeBadge(m.type)}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (m.serialNumber) {
                            setLookupSerial(m.serialNumber);
                            setShowLookupModal(true);
                          }
                        }}
                        className="font-mono font-bold text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors cursor-pointer"
                      >
                        {m.serialNumber || '—'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/products/${m.productId}`}
                        className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors block"
                      >
                        {m.productName || 'Product'}
                      </Link>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {m.productCode || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-primary)]">
                      {m.fromLocationName ? (
                        <span>
                          {m.fromLocationName} → <strong>{m.toLocationName || 'Facility'}</strong>
                        </span>
                      ) : (
                        <span>Received into <strong>{m.toLocationName || 'Facility'}</strong></span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[220px]">
                      {m.reference && (
                        <span className="font-semibold block text-[var(--text-primary)] text-[12px] truncate">
                          {m.reference}
                        </span>
                      )}
                      <span className="text-[12px] block truncate">{m.reason || '—'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] text-[12px] whitespace-nowrap">
                      {m.actorName || 'Operator'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Interactive Serial Number Lookup Modal */}
      <SerialNumberLookupModal
        isOpen={showLookupModal}
        initialSerialNumber={lookupSerial}
        onClose={() => {
          setShowLookupModal(false);
          setLookupSerial(undefined);
        }}
      />
    </div>
  );
}
