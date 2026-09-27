'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  DistributorWithRelations,
  DealerWithRelations,
  InternalNote,
  SafeUser,
  DistributorStatus,
} from '@trionyx/types';

interface DistributorDetailViewProps {
  distributor: DistributorWithRelations;
  dealers: DealerWithRelations[];
  initialNotes: InternalNote[];
  user: SafeUser;
}

export function DistributorDetailView({
  distributor: initialDistributor,
  dealers,
  initialNotes,
  user,
}: DistributorDetailViewProps) {
  const router = useRouter();
  const [distributor, setDistributor] = useState<DistributorWithRelations>(initialDistributor);
  const [notes, setNotes] = useState<InternalNote[]>(initialNotes);
  const [activeTab, setActiveTab] = useState<'dealers' | 'details' | 'notes'>('dealers');

  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DistributorStatus>(distributor.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Note form state
  const [newNoteBody, setNewNoteBody] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  const getStatusBadge = (status: DistributorStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-semibold bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
            ACTIVE
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-semibold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
            INACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-semibold bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
            SUSPENDED
          </span>
        );
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/distributors/${distributor.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      setDistributor(data.distributor);
      setIsStatusModalOpen(false);
      router.refresh();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteBody.trim()) return;

    setNoteError(null);
    setIsAddingNote(true);

    try {
      const res = await fetch(`/api/distributors/${distributor.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newNoteBody }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add note');
      }

      setNotes([data.note, ...notes]);
      setNewNoteBody('');
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Error adding note');
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[12px] font-medium text-[var(--text-secondary)]">
                {distributor.distributorCode}
              </span>
              {getStatusBadge(distributor.status)}
            </div>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[var(--text-primary)] m-0">
              {distributor.businessName}
            </h1>
            {distributor.legalName && (
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5 m-0 font-medium">
                {distributor.legalName}
              </p>
            )}
            <p className="text-[12.5px] text-[var(--text-muted)] mt-1 m-0">
              {distributor.city}, {distributor.state} • Primary Contact: {distributor.contactPerson} ({distributor.phone})
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="px-3.5 py-1.5 rounded text-[13px] font-medium border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--background)] transition shadow-sm"
              >
                Change Status
              </button>
              <Link
                href={`/distributors/${distributor.id}/edit`}
                className="px-3.5 py-1.5 rounded text-[13px] font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] transition shadow-sm"
              >
                Edit Distributor
              </Link>
            </div>
          )}
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[var(--border)]">
          <div className="bg-[var(--surface)] p-3 rounded border border-[var(--border)]">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] block">
              Active Dealers
            </span>
            <span className="text-[20px] font-bold text-[var(--text-primary)]">
              {distributor.activeDealerCount ?? 0}
            </span>
          </div>
          <div className="bg-[var(--surface)] p-3 rounded border border-[var(--border)]">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] block">
              Total Dealers
            </span>
            <span className="text-[20px] font-bold text-[var(--text-primary)]">
              {distributor.dealerCount ?? 0}
            </span>
          </div>
          <div className="bg-[var(--surface)] p-3 rounded border border-[var(--border)]">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] block">
              GSTIN
            </span>
            <span className="text-[13px] font-mono font-medium text-[var(--text-primary)] truncate block mt-1">
              {distributor.gstin || 'Not registered'}
            </span>
          </div>
          <div className="bg-[var(--surface)] p-3 rounded border border-[var(--border)]">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] block">
              Territory
            </span>
            <span className="text-[13px] font-medium text-[var(--text-primary)] truncate block mt-1">
              {distributor.territory || 'Unrestricted'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex space-x-6 text-[13.5px]">
          <button
            onClick={() => setActiveTab('dealers')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'dealers'
                ? 'border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Assigned Dealers ({dealers.length})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'details'
                ? 'border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Distributor Details & Address
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'notes'
                ? 'border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Internal Notes ({notes.length})
          </button>
        </nav>
      </div>

      {/* Tab 1: Assigned Dealers */}
      {activeTab === 'dealers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
              Dealers Operating Under {distributor.businessName}
            </h2>
            {canManage && (
              <Link
                href="/dealers/new"
                className="text-[12.5px] font-medium text-[var(--accent-text)] hover:underline"
              >
                + Register New Dealer
              </Link>
            )}
          </div>

          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded overflow-hidden shadow-sm">
            {dealers.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-[13px]">
                No dealers currently assigned to this distributor.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-[var(--text-secondary)] font-semibold">
                    <th className="py-2.5 px-4">Dealer Code</th>
                    <th className="py-2.5 px-4">Business Name</th>
                    <th className="py-2.5 px-4">Contact Person</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4">City / State</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {dealers.map((dl) => (
                    <tr key={dl.id} className="hover:bg-[var(--surface)] transition">
                      <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                        <Link href={`/dealers/${dl.id}`} className="hover:text-[var(--accent-text)]">
                          {dl.dealerCode}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        <Link href={`/dealers/${dl.id}`} className="hover:text-[var(--accent-text)]">
                          {dl.businessName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{dl.contactPerson}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{dl.phone}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {dl.city}, {dl.state}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            dl.status === 'ACTIVE'
                              ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]'
                              : dl.status === 'INACTIVE'
                              ? 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)]'
                              : 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]'
                          }`}
                        >
                          {dl.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dealers/${dl.id}`}
                          className="text-[12px] font-medium text-[var(--accent-text)] hover:underline"
                        >
                          View Dealer
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Details & Address */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-3 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
              Physical Location & Address
            </h3>
            <div className="text-[13px] space-y-2 text-[var(--text-secondary)]">
              <div>
                <span className="font-medium text-[var(--text-primary)]">Address Line 1:</span>{' '}
                {distributor.addressLine1 || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Address Line 2:</span>{' '}
                {distributor.addressLine2 || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">City:</span> {distributor.city}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">District:</span>{' '}
                {distributor.district || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">State:</span> {distributor.state}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Postal Code:</span>{' '}
                {distributor.postalCode || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Country:</span> {distributor.country}
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-3 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
              Commercial & Operational Info
            </h3>
            <div className="text-[13px] space-y-2 text-[var(--text-secondary)]">
              <div>
                <span className="font-medium text-[var(--text-primary)]">Legal Name:</span>{' '}
                {distributor.legalName || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">GSTIN:</span>{' '}
                <span className="font-mono">{distributor.gstin || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Territory:</span>{' '}
                {distributor.territory || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Alternate Phone:</span>{' '}
                {distributor.alternatePhone || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Email:</span>{' '}
                {distributor.email || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Registered On:</span>{' '}
                {new Date(distributor.createdAt).toLocaleDateString()}
              </div>
              {distributor.notes && (
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <span className="font-medium text-[var(--text-primary)] block mb-1">Operational Notes:</span>
                  <p className="text-[12.5px] bg-[var(--surface)] p-3 rounded border border-[var(--border)] text-[var(--text-primary)] whitespace-pre-wrap">
                    {distributor.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Internal Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4 max-w-3xl">
          {/* Add note card */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 shadow-sm space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">Add Internal Note</h3>
            <p className="text-[12px] text-[var(--text-secondary)] m-0">
              Internal notes are only visible to authorized Trionyx operations and distributor personnel.
            </p>
            {noteError && (
              <div className="p-2.5 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[12px]">
                {noteError}
              </div>
            )}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Log a conversation, payment agreement, field visit report, or operational arrangement..."
                value={newNoteBody}
                onChange={(e) => setNewNoteBody(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteBody.trim()}
                  className="px-4 py-1.5 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium transition shadow-sm disabled:opacity-50"
                >
                  {isAddingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-muted)] text-[13px] bg-[var(--surface-raised)] border border-[var(--border)] rounded">
                No internal notes recorded yet.
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-4 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">{note.authorName || 'Internal Operator'}</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-[13px] text-[var(--text-primary)] whitespace-pre-wrap m-0">{note.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border)] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
              Update Distributor Status
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] m-0">
              Set the operational status for <strong>{distributor.businessName}</strong> ({distributor.distributorCode}).
            </p>

            {statusError && (
              <div className="p-2.5 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[12px]">
                {statusError}
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 border rounded cursor-pointer hover:bg-[var(--surface)]">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={selectedStatus === 'ACTIVE'}
                    onChange={() => setSelectedStatus('ACTIVE')}
                    className="text-[var(--accent-text)] focus:ring-[var(--focus-ring)]"
                  />
                  <div>
                    <span className="font-semibold text-[13px] text-[var(--status-success)] block">ACTIVE</span>
                    <span className="text-[11.5px] text-[var(--text-secondary)]">
                      Distributor is fully operational and fulfilling dealer orders.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 border rounded cursor-pointer hover:bg-[var(--surface)]">
                  <input
                    type="radio"
                    name="status"
                    value="INACTIVE"
                    checked={selectedStatus === 'INACTIVE'}
                    onChange={() => setSelectedStatus('INACTIVE')}
                    className="text-[var(--accent-text)] focus:ring-[var(--focus-ring)]"
                  />
                  <div>
                    <span className="font-semibold text-[13px] text-[var(--text-secondary)] block">INACTIVE</span>
                    <span className="text-[11.5px] text-[var(--text-secondary)]">
                      Temporarily dormant or onboarding not yet complete.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 border rounded cursor-pointer hover:bg-[var(--surface)]">
                  <input
                    type="radio"
                    name="status"
                    value="SUSPENDED"
                    checked={selectedStatus === 'SUSPENDED'}
                    onChange={() => setSelectedStatus('SUSPENDED')}
                    className="text-[var(--accent-text)] focus:ring-[var(--focus-ring)]"
                  />
                  <div>
                    <span className="font-semibold text-[13px] text-[var(--status-danger)] block">SUSPENDED</span>
                    <span className="text-[11.5px] text-[var(--text-secondary)]">
                      Operations blocked due to commercial, audit, or legal review.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
