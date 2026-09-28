'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { InventoryLocation, SafeUser } from '@trionyx/types';
import { Modal } from '../../../components/ui/Modal';

export interface LocationWithStats extends InventoryLocation {
  productCount: number;
  availableUnits: number;
  totalSerials: number;
}

interface LocationsTableProps {
  locations: LocationWithStats[];
  user: SafeUser;
}

export function LocationsTable({ locations: initialLocations, user }: LocationsTableProps) {
  const router = useRouter();

  const [locations, setLocations] = useState<LocationWithStats[]>(initialLocations);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setModalError('Both location code and name are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch('/api/inventory/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          status,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setModalError(data.error || 'Failed to create location.');
        setIsSubmitting(false);
        return;
      }

      setLocations((prev) => [
        ...prev,
        {
          ...data.location,
          productCount: 0,
          availableUnits: 0,
          totalSerials: 0,
        },
      ]);
      setShowCreateModal(false);
      setCode('');
      setName('');
      setStatus('ACTIVE');
      router.refresh();
    } catch {
      setModalError('Network error while creating location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Inventory Locations
          </h1>
        </div>

        {canManage && (
          <div>
            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] text-[var(--background)] text-[13px] font-medium transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Location
            </button>
          </div>
        )}
      </div>

      {/* Locations Table */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Facility Name</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Products</th>
                <th className="py-3 px-4 text-right">Available Units</th>
                <th className="py-3 px-4 text-right">Total Serials</th>
                <th className="py-3 px-4">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[var(--accent-text)]">
                    {loc.code}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                    {loc.name}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        loc.status === 'ACTIVE'
                          ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      {loc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--text-secondary)]">
                    {loc.productCount} Products
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--status-success)]">
                    {loc.availableUnits} units
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--text-secondary)]">
                    {loc.totalSerials}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)] text-[12px]">
                    {new Date(loc.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Location Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Inventory Location / Facility"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Location Code (e.g. LOC-NORTH) *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LOC-NORTH"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono text-[13.5px] uppercase focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1 m-0">
              Unique identifier used across physical labels and stock movements.
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Facility Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Regional Distribution Depot"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Operational Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="ACTIVE">Active (Accepts receipts & transfers)</option>
              <option value="INACTIVE">Inactive (Decommissioned)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !code.trim() || !name.trim()}
              className="px-4 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 text-[var(--background)] text-[13px] font-medium transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Create Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
