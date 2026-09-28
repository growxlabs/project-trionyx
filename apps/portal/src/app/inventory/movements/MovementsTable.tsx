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
              Inventory
            </Link>
          </div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-[-0.02em] m-0">
            Serial Movement Ledger
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLookupSerial(undefined);
              setShowLookupModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--accent-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Lookup Serial
          </button>
          <span className="text-[13px] font-normal text-[var(--text-secondary)]">
            {filteredMovements.length} transaction{filteredMovements.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
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
            className="w-full pl-9 pr-4 py-2 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Movement Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as SerialMovementType | 'ALL')}
            className="px-3 py-2 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="ALL">All Types</option>
            <option value="RECEIVED">Received</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="ADJUSTED">Adjusted</option>
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
        {filteredMovements.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">No movement entries match criteria</p>
            <p className="text-[13px] text-[var(--text-secondary)] m-0">Try changing your search term or movement type filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                  <th className="py-2.5 px-4 w-36">Timestamp</th>
                  <th className="py-2.5 px-4 w-28">Type</th>
                  <th className="py-2.5 px-4 w-40">Serial Number</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Route / Location</th>
                  <th className="py-2.5 px-4">Reason / Reference</th>
                  <th className="py-2.5 px-4 w-32">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                    <td className="py-2.5 px-4 text-[var(--text-muted)] whitespace-nowrap text-[12px]">
                      {new Date(m.createdAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium capitalize ${typeBadge(m.type)}`}>
                        {m.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (m.serialNumber) {
                            setLookupSerial(m.serialNumber);
                            setShowLookupModal(true);
                          }
                        }}
                        className="font-mono font-medium text-[12px] text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                      >
                        {m.serialNumber || '—'}
                      </button>
                    </td>
                    <td className="py-2.5 px-4">
                      <Link
                        href={`/products/${m.productId}`}
                        className="font-medium text-[14px] text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors block"
                      >
                        {m.productName || 'Product'}
                      </Link>
                      <span className="font-mono text-[12px] text-[var(--text-muted)]">
                        {m.productCode || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[13px] text-[var(--text-primary)]">
                      {m.fromLocationName ? (
                        <span>
                          {m.fromLocationName} → <strong className="font-semibold">{m.toLocationName || 'Facility'}</strong>
                        </span>
                      ) : (
                        <span>Received into <strong className="font-semibold">{m.toLocationName || 'Facility'}</strong></span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-secondary)] max-w-[220px]">
                      {m.reference && (
                        <span className="font-mono font-medium block text-[var(--text-primary)] text-[12px] truncate">
                          {m.reference}
                        </span>
                      )}
                      <span className="text-[12px] text-[var(--text-muted)] block truncate">{m.reason || '—'}</span>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-secondary)] text-[13px] whitespace-nowrap">
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
