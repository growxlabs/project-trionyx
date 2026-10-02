'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type {
  ContactEnquiry,
  ContactEnquiryStatus,
  ContactEnquiryType,
  EnquiryNote,
  SafeUser,
  User,
} from '@trionyx/types';

interface EnquiryDetailViewProps {
  enquiry: ContactEnquiry;
  initialNotes: EnquiryNote[];
  internalUsers: User[];
  duplicates: ContactEnquiry[];
  user: SafeUser;
}

const TYPE_LABELS: Record<ContactEnquiryType, string> = {
  PRODUCT_ENQUIRY: 'Product Enquiry',
  DEALER_ENQUIRY: 'Dealer Enquiry',
  DISTRIBUTION_ENQUIRY: 'Distribution Enquiry',
  PRODUCT_SUPPORT: 'Product Support',
  GENERAL_ENQUIRY: 'General Enquiry',
};

export function EnquiryDetailView({
  enquiry: initialEnquiry,
  initialNotes,
  internalUsers,
  duplicates,
  user,
}: EnquiryDetailViewProps) {
  const [enquiry, setEnquiry] = useState<ContactEnquiry>(initialEnquiry);
  const [notes, setNotes] = useState<EnquiryNote[]>(initialNotes);

  // Status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Assignment state
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Note form state
  const [newNoteBody, setNewNoteBody] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  const handleStatusChange = async (newStatus: ContactEnquiryStatus) => {
    if (newStatus === enquiry.status || isUpdatingStatus) return;
    setStatusError(null);
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/v1/internal/enquiries/${enquiry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to update status');
      }

      setEnquiry(data.data);
    } catch (err: any) {
      setStatusError(err.message || 'Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignChange = async (userId: string) => {
    if (isAssigning) return;
    setAssignError(null);
    setIsAssigning(true);

    const assignedTo = userId === 'UNASSIGNED' ? null : userId;

    try {
      const res = await fetch(`/api/v1/internal/enquiries/${enquiry.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to assign enquiry');
      }

      setEnquiry(data.data);
    } catch (err: any) {
      setAssignError(err.message || 'Error assigning enquiry');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteBody.trim() || isAddingNote) return;

    setNoteError(null);
    setIsAddingNote(true);

    try {
      const res = await fetch(`/api/v1/internal/enquiries/${enquiry.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newNoteBody.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to add note');
      }

      setNotes([data.data, ...notes]);
      setNewNoteBody('');
    } catch (err: any) {
      setNoteError(err.message || 'Error adding note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const getStatusBadge = (status: ContactEnquiryStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]">
            New
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
            In Progress
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
            Closed
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const hasBusinessInfo =
    enquiry.companyName || enquiry.businessAddress || enquiry.businessType || enquiry.territory;
  const hasProductInfo = enquiry.productName || enquiry.productId || enquiry.purchaseDealerDetails;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Enquiries
        </Link>
      </div>

      {/* Duplicate Warning Banner (Section 17) */}
      {duplicates.length > 0 && (
        <div className="p-4 rounded bg-[var(--status-warning-soft)] border border-[var(--status-warning-border)] space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--status-warning)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-[13px] font-semibold text-[var(--status-warning)]">
              Previous Enquiries Detected ({duplicates.length})
            </span>
          </div>
          <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed">
            Other enquiries exist with matching phone ({enquiry.phone}) or email ({enquiry.email}):
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {duplicates.map((dup) => (
              <Link
                key={dup.id}
                href={`/enquiries/${dup.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[12px] font-mono hover:border-[var(--accent)] transition"
              >
                <span>{dup.enquiryCode}</span>
                <span className="text-[var(--text-muted)]">({TYPE_LABELS[dup.type] || dup.type} • {dup.status})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-[12px] font-medium text-[var(--text-primary)]">
                {enquiry.enquiryCode}
              </span>
              {getStatusBadge(enquiry.status)}
              <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                {TYPE_LABELS[enquiry.type] || enquiry.type}
              </span>
            </div>
            <h1 className="text-[20px] font-semibold text-[var(--text-primary)] m-0">
              {enquiry.companyName || enquiry.fullName}
            </h1>
            {enquiry.companyName && (
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5 m-0 font-normal">
                Contact: {enquiry.fullName}
              </p>
            )}
            <p className="text-[12px] text-[var(--text-muted)] mt-1 m-0">
              Submitted on {formatDate(enquiry.createdAt)}
            </p>
          </div>

          {/* Quick Status & Assign Controls */}
          {canManage && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              {/* Status Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[var(--text-muted)]">Status:</span>
                <select
                  value={enquiry.status}
                  onChange={(e) => handleStatusChange(e.target.value as ContactEnquiryStatus)}
                  disabled={isUpdatingStatus}
                  className="px-2.5 py-1.5 text-[13px] bg-[var(--background)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] font-medium"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              {/* Assignee Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[var(--text-muted)]">Assign:</span>
                <select
                  value={enquiry.assignedTo || 'UNASSIGNED'}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  disabled={isAssigning}
                  className="px-2.5 py-1.5 text-[13px] bg-[var(--background)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] font-medium max-w-[160px] truncate"
                >
                  <option value="UNASSIGNED">Unassigned</option>
                  {internalUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {statusError && (
          <p className="mt-3 text-[12px] text-[var(--status-danger)]">{statusError}</p>
        )}
        {assignError && (
          <p className="mt-3 text-[12px] text-[var(--status-danger)]">{assignError}</p>
        )}
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide on desktop): Contact, Business, Product, Message */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-sm space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-[var(--text-muted)] block text-[12px]">Full Name</span>
                <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.fullName}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[12px]">Phone</span>
                <a
                  href={`tel:${enquiry.phone}`}
                  className="font-medium text-[14px] text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {enquiry.phone}
                </a>
              </div>
              {enquiry.email && (
                <div className="sm:col-span-2">
                  <span className="text-[var(--text-muted)] block text-[12px]">Email Address</span>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-[14px] text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {enquiry.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-sm space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
              Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
              <div>
                <span className="text-[var(--text-muted)] block text-[12px]">City</span>
                <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.city || '—'}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[12px]">State</span>
                <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.state || '—'}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[12px]">Pincode</span>
                <span className="font-mono text-[12px] font-medium text-[var(--text-primary)]">{enquiry.pincode || '—'}</span>
              </div>
            </div>
          </div>

          {/* Business Details (Hide if empty) */}
          {hasBusinessInfo && (
            <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-sm space-y-3">
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                Business Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                {enquiry.companyName && (
                  <div>
                    <span className="text-[var(--text-muted)] block text-[12px]">Company / Studio Name</span>
                    <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.companyName}</span>
                  </div>
                )}
                {enquiry.businessType && (
                  <div>
                    <span className="text-[var(--text-muted)] block text-[12px]">Business Type</span>
                    <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.businessType}</span>
                  </div>
                )}
                {enquiry.businessAddress && (
                  <div className="sm:col-span-2">
                    <span className="text-[var(--text-muted)] block text-[12px]">Business Address</span>
                    <span className="text-[var(--text-primary)] leading-relaxed text-[13px]">{enquiry.businessAddress}</span>
                  </div>
                )}
                {enquiry.territory && (
                  <div className="sm:col-span-2">
                    <span className="text-[var(--text-muted)] block text-[12px]">Requested Territory / Area</span>
                    <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.territory}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Info (Hide if empty) */}
          {hasProductInfo && (
            <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-sm space-y-3">
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                Product Details
              </h3>
              <div className="space-y-3 text-[13px]">
                {enquiry.productName && (
                  <div>
                    <span className="text-[var(--text-muted)] block text-[12px]">Product</span>
                    <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.productName}</span>
                  </div>
                )}
                {enquiry.purchaseDealerDetails && (
                  <div>
                    <span className="text-[var(--text-muted)] block text-[12px]">Purchase / Dealer Details</span>
                    <span className="text-[var(--text-primary)] leading-relaxed text-[13px]">{enquiry.purchaseDealerDetails}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message / Issue Description */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-sm space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
              {enquiry.type === 'PRODUCT_SUPPORT' ? 'Issue Description' : 'Message'}
            </h3>
            <div className="p-4 rounded-[4px] bg-[var(--background)] border border-[var(--border)] text-[13.5px] text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {enquiry.message || <span className="text-[var(--text-muted)] italic">No message provided</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Assignment + Internal Notes */}
        <div className="space-y-6">
          {/* Assignment Card */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-sm space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
              Assignment
            </h3>
            <div className="text-[13px]">
              <span className="text-[var(--text-muted)] block text-[12px]">Assigned Operator</span>
              {enquiry.assignedUserName ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center font-semibold text-[11px] text-[var(--text-primary)]">
                    {enquiry.assignedUserName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-[14px] text-[var(--text-primary)]">{enquiry.assignedUserName}</span>
                </div>
              ) : (
                <span className="text-[var(--text-muted)] italic block mt-1">Unassigned</span>
              )}
            </div>

            {canManage && (
              <div className="pt-2 border-t border-[var(--border)]">
                <label className="text-[12px] text-[var(--text-muted)] block mb-1.5">Change Assignee</label>
                <select
                  value={enquiry.assignedTo || 'UNASSIGNED'}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  disabled={isAssigning}
                  className="w-full px-3 py-1.5 text-[13px] bg-[var(--background)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] font-medium"
                >
                  <option value="UNASSIGNED">Unassigned</option>
                  {internalUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Internal Notes Card */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                Internal Notes ({notes.length})
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0">
                Notes are confidential and visible only to authorized team members.
              </p>
            </div>

            {/* Add Note Form */}
            {canManage && (
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <textarea
                  rows={3}
                  placeholder="Add an internal note or progress update..."
                  value={newNoteBody}
                  onChange={(e) => setNewNoteBody(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[var(--background)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] resize-none placeholder:text-[var(--text-muted)]"
                />
                {noteError && (
                  <p className="text-[12px] text-[var(--status-danger)]">{noteError}</p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteBody.trim()}
                    className="px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground)] text-[13px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isAddingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </form>
            )}

            {/* Notes Timeline */}
            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              {notes.length === 0 ? (
                <p className="text-[12.5px] text-[var(--text-muted)] italic py-2">
                  No internal notes yet.
                </p>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded bg-[var(--background)] border border-[var(--border)] space-y-1.5 text-[12.5px]"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {n.authorName || 'Internal Operator'}
                      </span>
                      <span>{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed m-0">
                      {n.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
