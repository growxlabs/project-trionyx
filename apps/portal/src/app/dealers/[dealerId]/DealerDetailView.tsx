'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  DealerWithRelations,
  DealerDistributorHistory,
  DealerRequest,
  InternalNote,
  SafeUser,
  DealerStatus,
  DealerRequestStatus,
  DealerRequestType,
  DealerRequestPriority,
  DealerUser,
} from '@trionyx/types';
import { StatusBadge } from '../../../components/workspace';

interface DealerDetailViewProps {
  dealer: DealerWithRelations;
  history: DealerDistributorHistory[];
  requests: DealerRequest[];
  initialNotes: InternalNote[];
  distributors: Array<{ id: string; distributorCode: string; businessName: string; city: string; state: string }>;
  initialPortalUsers?: DealerUser[];
  user: SafeUser;
}

export function DealerDetailView({
  dealer: initialDealer,
  history: initialHistory,
  requests: initialRequests,
  initialNotes,
  distributors,
  initialPortalUsers = [],
  user,
}: DealerDetailViewProps) {
  const router = useRouter();
  const [dealer, setDealer] = useState<DealerWithRelations>(initialDealer);
  const [history, setHistory] = useState<DealerDistributorHistory[]>(initialHistory);
  const [requests, setRequests] = useState<DealerRequest[]>(initialRequests);
  const [notes, setNotes] = useState<InternalNote[]>(initialNotes);
  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'profile' | 'notes' | 'portal_access'>('requests');
  const [portalUsers, setPortalUsers] = useState<DealerUser[]>(initialPortalUsers);

  // Invite Dealer User state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccessLink, setInviteSuccessLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DealerStatus>(dealer.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [newDistributorId, setNewDistributorId] = useState<string>(dealer.distributorId || '');
  const [reassignReason, setReassignReason] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignError, setReassignError] = useState<string | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqType, setReqType] = useState<DealerRequestType>('PRODUCT_ENQUIRY');
  const [reqSubject, setReqSubject] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqPriority, setReqPriority] = useState<DealerRequestPriority>('MEDIUM');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Note form state
  const [newNoteBody, setNewNoteBody] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';
  const canReassign = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  const getStatusBadge = (status: DealerStatus) => <StatusBadge status={status} />;
  const getRequestStatusBadge = (status: DealerRequestStatus) => <StatusBadge status={status} />;

  const getPriorityBadge = (priority: DealerRequestPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[11px] font-medium text-[var(--status-danger)]">Urgent</span>;
      case 'HIGH':
        return <span className="text-[11px] font-medium text-[var(--status-warning)]">High</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-medium text-[var(--status-warning)]">Medium</span>;
      case 'LOW':
        return <span className="text-[11px] font-medium text-[var(--text-secondary)]">Low</span>;
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/dealers/${dealer.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      setDealer(data.dealer);
      setIsStatusModalOpen(false);
      router.refresh();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignReason.trim() || reassignReason.trim().length < 3) {
      setReassignError('A detailed reason (at least 3 characters) is required for reassignment.');
      return;
    }

    setReassignError(null);
    setIsReassigning(true);

    try {
      const res = await fetch(`/api/dealers/${dealer.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDistributorId: newDistributorId || null,
          reason: reassignReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reassign distributor');
      }

      setDealer(data.dealer);
      setHistory([data.history, ...history]);
      setIsReassignModalOpen(false);
      setReassignReason('');
      router.refresh();
    } catch (err) {
      setReassignError(err instanceof Error ? err.message : 'Error during reassignment');
    } finally {
      setIsReassigning(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    setIsSubmittingRequest(true);

    try {
      const res = await fetch(`/api/dealers/${dealer.id}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reqType,
          subject: reqSubject.trim(),
          description: reqDescription.trim(),
          priority: reqPriority,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to log request');
      }

      setRequests([data.request, ...requests]);
      setIsRequestModalOpen(false);
      setReqSubject('');
      setReqDescription('');
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Error logging request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: DealerRequestStatus) => {
    try {
      const res = await fetch(`/api/dealers/${dealer.id}/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update request');
      }

      setRequests(requests.map((r) => (r.id === requestId ? data.request : r)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update request status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteBody.trim()) return;

    setNoteError(null);
    setIsAddingNote(true);

    try {
      const res = await fetch(`/api/dealers/${dealer.id}/notes`, {
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

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setIsInviting(true);

    try {
      const res = await fetch(`/api/dealers/${dealer.id}/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate invitation');
      }

      setPortalUsers((prev) => [data.user, ...prev.filter((u) => u.id !== data.user.id)]);
      setInviteSuccessLink(data.invitationLink);
    } catch (err: any) {
      setInviteError(err.message || 'Error creating invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setTogglingUserId(userId);

    try {
      const res = await fetch(`/api/dealers/${dealer.id}/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to update user status');
        return;
      }

      setPortalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus, lockedUntil: null } : u))
      );
    } catch {
      alert('Error updating user status');
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[12px] font-medium text-[var(--text-secondary)]">
                {dealer.dealerCode}
              </span>
              {getStatusBadge(dealer.status)}
            </div>
            <h1 className="text-[20px] font-semibold text-[var(--text-primary)] m-0">
              {dealer.businessName}
            </h1>
            {dealer.legalName && (
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5 m-0 font-normal">
                {dealer.legalName}
              </p>
            )}
            <p className="text-[12px] text-[var(--text-muted)] mt-1 m-0">
              {dealer.city}, {dealer.state} • Contact: {dealer.contactPerson} ({dealer.phone})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-3.5 py-1.5 rounded-[4px] text-[13px] font-semibold bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground)] transition shadow-xs cursor-pointer"
            >
              + Log Request
            </button>

            {canReassign && (
              <button
                onClick={() => {
                  setNewDistributorId(dealer.distributorId || '');
                  setIsReassignModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition shadow-xs cursor-pointer"
              >
                Reassign Distributor
              </button>
            )}

            {canManage && (
              <>
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition shadow-xs cursor-pointer"
                >
                  Change Status
                </button>
                <Link
                  href={`/dealers/${dealer.id}/edit`}
                  className="px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition shadow-xs"
                >
                  Edit Dealer
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Distributor Association Banner */}
        <div className="mt-5 p-3.5 rounded-[4px] bg-[var(--surface-subtle)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[12px] font-medium text-[var(--text-secondary)] block">
              Assigned Regional Distributor
            </span>
            {dealer.distributor ? (
              <div className="flex items-center gap-2 mt-0.5">
                <Link
                  href={`/distributors/${dealer.distributor.id}`}
                  className="font-medium text-[14px] text-[var(--text-primary)] hover:text-[var(--accent)]"
                >
                  {dealer.distributor.businessName}
                </Link>
                <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                  ({dealer.distributor.distributorCode})
                </span>
                <span className="text-[12px] text-[var(--text-muted)]">
                  • {dealer.distributor.city}, {dealer.distributor.state}
                </span>
              </div>
            ) : (
              <div className="text-[13px] text-[var(--status-warning)] font-medium mt-0.5">
                No distributor currently assigned (Direct factory account / Unassigned)
              </div>
            )}
          </div>
          {dealer.distributor && (
            <div className="text-[12px] text-[var(--text-secondary)]">
              Distributor Contact: <span className="font-medium text-[var(--text-primary)]">{dealer.distributor.contactPerson}</span> ({dealer.distributor.phone})
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex space-x-6 text-[13.5px]">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'requests'
                ? 'border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Requests & Inquiries ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'history'
                ? 'border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Distributor History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'profile'
                ? 'border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Studio Profile & Address
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
          <button
            onClick={() => setActiveTab('portal_access')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'portal_access'
                ? 'border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Dealer Portal Access ({portalUsers.length})
          </button>
        </nav>
      </div>

      {/* Tab 1: Requests & Inquiries */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
              Logged Requests & Enquiries
            </h2>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="text-[12.5px] font-medium text-[var(--accent-text)] hover:underline"
            >
              + Log New Request
            </button>
          </div>

          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded overflow-hidden shadow-sm">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-[13px]">
                No enquiries or requests logged for this dealer yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {requests.map((req) => (
                  <div key={req.id} className="p-4 hover:bg-[var(--surface)] transition space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-medium text-[var(--text-secondary)]">
                          {req.requestCode}
                        </span>
                        {getRequestStatusBadge(req.status)}
                        {getPriorityBadge(req.priority)}
                        <span className="text-[11.5px] font-medium px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {req.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-[var(--text-muted)]">
                        Logged by {req.createdByName || 'Operator'} on {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">{req.subject}</h4>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1 whitespace-pre-wrap m-0">
                        {req.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[12px] border-t border-[var(--border)]">
                      <div className="text-[var(--text-muted)]">
                        {req.resolvedAt && (
                          <span>Resolved on: {new Date(req.resolvedAt).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Status transitions */}
                      <div className="flex items-center gap-2">
                        {req.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'IN_PROGRESS')}
                            className="px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[11.5px] font-medium"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {(req.status === 'OPEN' || req.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'RESOLVED')}
                            className="px-2.5 py-1 rounded bg-[var(--status-success)] hover:bg-[var(--status-success)] text-[var(--background)] text-[11.5px] font-medium"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {req.status === 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'CLOSED')}
                            className="px-2.5 py-1 rounded border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background)] text-[11.5px] font-medium"
                          >
                            Close Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Distributor History Ledger */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
                Distributor Assignment & Reassignment Ledger
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0">
                Audited chronological log of distributor associations with mandatory change reasons.
              </p>
            </div>
            {canReassign && (
              <button
                onClick={() => {
                  setNewDistributorId(dealer.distributorId || '');
                  setIsReassignModalOpen(true);
                }}
                className="text-[12.5px] font-medium text-[var(--accent-text)] hover:underline"
              >
                + Reassign Distributor
              </button>
            )}
          </div>

          <div className="overflow-hidden">
            {history.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-[13px]">
                No distributor transitions recorded for this dealer.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--border)]/60 text-[12px] font-semibold text-[var(--text-secondary)]">
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Previous Distributor</th>
                    <th className="py-2.5 px-4">New Distributor</th>
                    <th className="py-2.5 px-4">Reason for Change</th>
                    <th className="py-2.5 px-4">Changed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-[var(--surface-subtle)] transition">
                      <td className="py-2.5 px-4 text-[var(--text-muted)] whitespace-nowrap text-[12px]">
                        {new Date(h.changedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {h.previousDistributorName ? (
                          <span>{h.previousDistributorName}</span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">Unassigned (Direct)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {h.newDistributorName ? (
                          <span className="text-[var(--status-success)] font-semibold">{h.newDistributorName}</span>
                        ) : (
                          <span className="text-[var(--status-warning)] font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)] font-medium max-w-xs break-words">
                        {h.reason || '—'}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {h.changedByName || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Studio Profile & Address */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-3 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
              Studio Location & Address
            </h3>
            <div className="text-[13px] space-y-2 text-[var(--text-secondary)]">
              <div>
                <span className="font-medium text-[var(--text-primary)]">Address Line 1:</span>{' '}
                {dealer.addressLine1 || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Address Line 2:</span>{' '}
                {dealer.addressLine2 || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">City:</span> {dealer.city}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">District:</span>{' '}
                {dealer.district || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">State:</span> {dealer.state}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Postal Code:</span>{' '}
                {dealer.postalCode || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Country:</span> {dealer.country}
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-3 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
              Registration & Studio Specs
            </h3>
            <div className="text-[13px] space-y-2 text-[var(--text-secondary)]">
              <div>
                <span className="font-medium text-[var(--text-primary)]">Legal Name:</span>{' '}
                {dealer.legalName || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">GSTIN:</span>{' '}
                <span className="font-mono">{dealer.gstin || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Primary Phone:</span> {dealer.phone}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Alternate Phone:</span>{' '}
                {dealer.alternatePhone || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Email:</span>{' '}
                {dealer.email || '—'}
              </div>
              <div>
                <span className="font-medium text-[var(--text-primary)]">Registered On:</span>{' '}
                {new Date(dealer.createdAt).toLocaleDateString()}
              </div>
              {dealer.notes && (
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <span className="font-medium text-[var(--text-primary)] block mb-1">Studio Specifications:</span>
                  <p className="text-[12.5px] bg-[var(--surface)] p-3 rounded border border-[var(--border)] text-[var(--text-primary)] whitespace-pre-wrap">
                    {dealer.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Internal Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 shadow-sm space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">Add Internal Note</h3>
            <p className="text-[12px] text-[var(--text-secondary)] m-0">
              Notes are internal records visible to Trionyx operations and authorized distributors.
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
                placeholder="Log studio inspection details, credit feedback, warranty enquiries, or relationship notes..."
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

      {/* Tab 5: Dealer Portal Access */}
      {activeTab === 'portal_access' && (
        <div className="space-y-5">
          {/* Header & Status Card */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[15px] font-bold text-[var(--text-primary)] m-0">
                  Dealer Portal Credentials & Access
                </h3>
                <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5 m-0">
                  Manage individual user logins authorized to view products, stock availability, and submit requests for this dealership.
                </p>
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setInviteName('');
                    setInviteEmail('');
                    setInviteError(null);
                    setInviteSuccessLink(null);
                    setLinkCopied(false);
                    setIsInviteModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded text-[13px] font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] transition shadow-sm self-start sm:self-auto"
                >
                  + Invite Portal User
                </button>
              )}
            </div>

            {/* Portal Readiness Notice */}
            {dealer.status !== 'ACTIVE' ? (
              <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[12.5px] text-[var(--status-danger)]">
                <strong>Warning:</strong> Dealership is currently <strong>{dealer.status}</strong>.
                Portal users cannot sign in to the Dealer Portal until the dealership business status is set to <strong>ACTIVE</strong>.
              </div>
            ) : (
              <div className="p-3 rounded bg-[var(--status-success-soft)] border border-[var(--status-success-border)] text-[12.5px] text-[var(--status-success)] flex items-center justify-between">
                <span>
                  ✓ <strong>Portal Active:</strong> Dealership is verified and authorized for Dealer Portal access.
                </span>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--status-success)] underline text-[12px]"
                >
                  Open Portal ↗
                </a>
              </div>
            )}
          </div>

          {/* Authorized Users Table */}
          <div className="overflow-hidden">
            {portalUsers.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] text-[13px]">
                <p className="font-medium text-[var(--text-primary)]">No portal users provisioned yet.</p>
                <p className="mt-1 text-[12.5px]">
                  Click &ldquo;Invite Portal User&rdquo; to generate a secure activation link for this dealership.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--border)]/60 text-[12px] font-semibold text-[var(--text-secondary)]">
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Security / Lockout</th>
                    <th className="py-2.5 px-4">Last Login</th>
                    {canManage && <th className="py-2.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {portalUsers.map((u) => {
                    const isLocked = u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now();
                    return (
                      <tr key={u.id} className="hover:bg-[var(--surface-subtle)] transition">
                        <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">{u.name}</td>
                        <td className="py-2.5 px-4 text-[13px] text-[var(--text-secondary)]">{u.email}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium ${
                              u.status === 'ACTIVE'
                                ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                                : u.status === 'INVITED'
                                ? 'bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]'
                                : 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Active' : u.status === 'INVITED' ? 'Invited' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[12px]">
                          {isLocked ? (
                            <span className="text-[var(--status-danger)] font-medium">Locked Out (5 failed attempts)</span>
                          ) : u.failedLoginCount > 0 ? (
                            <span className="text-[var(--status-warning)]">{u.failedLoginCount} failed attempts</span>
                          ) : (
                            <span className="text-[var(--status-success)]">Healthy</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[12px] text-[var(--text-secondary)]">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-right">
                            {u.status === 'INVITED' ? (
                              <button
                                onClick={() => {
                                  setInviteName(u.name);
                                  setInviteEmail(u.email);
                                  setInviteError(null);
                                  setInviteSuccessLink(null);
                                  setIsInviteModalOpen(true);
                                }}
                                className="text-[12px] text-[var(--accent-text)] hover:underline font-semibold"
                              >
                                Re-Invite / Token
                              </button>
                            ) : (
                              <button
                                disabled={togglingUserId === u.id}
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className={`text-[12px] font-semibold hover:underline ${
                                  u.status === 'ACTIVE' ? 'text-[var(--status-danger)]' : 'text-[var(--status-success)]'
                                }`}
                              >
                                {togglingUserId === u.id
                                  ? 'Saving...'
                                  : u.status === 'ACTIVE'
                                  ? 'Disable Access'
                                  : 'Enable Access'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border)] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
              Update Dealer Status
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] m-0">
              Set the operational status for <strong>{dealer.businessName}</strong> ({dealer.dealerCode}).
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
                      Studio is active and authorized to receive product deliveries.
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
                      Studio is dormant, renovated, or undergoing compliance review.
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
                      Studio blocked due to contractual, quality, or payment failure.
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

      {/* Reassign Distributor Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border)] shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
              Reassign Distributor for {dealer.businessName}
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] m-0">
              Reassigning a dealer updates the fulfillment network and automatically writes an immutable record to the relationship ledger.
            </p>

            {reassignError && (
              <div className="p-2.5 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[12px]">
                {reassignError}
              </div>
            )}

            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                  New Distributor
                </label>
                <select
                  value={newDistributorId}
                  onChange={(e) => setNewDistributorId(e.target.value)}
                  className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none bg-[var(--surface-raised)]"
                >
                  <option value="">— Unassign (No Distributor / Direct Account) —</option>
                  {distributors.map((dst) => (
                    <option key={dst.id} value={dst.id}>
                      {dst.businessName} ({dst.distributorCode}) — {dst.city}, {dst.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                  Mandatory Reassignment Reason <span className="text-[var(--accent-text)]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this dealer is being reassigned (e.g. territory reorganization, distributor contract termination, dealer expansion)..."
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
                />
                <span className="text-[11.5px] text-[var(--text-muted)] block mt-1">
                  Minimum 3 characters. Stored permanently in audit trail.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-4 py-2 rounded text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReassigning || !reassignReason.trim()}
                  className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium disabled:opacity-50"
                >
                  {isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border)] shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
              Log Request / Enquiry for {dealer.businessName}
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] m-0">
              Record a dealer inquiry, stock demand, or technical support requirement.
            </p>

            {requestError && (
              <div className="p-2.5 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[12px]">
                {requestError}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                    Request Type <span className="text-[var(--accent-text)]">*</span>
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value as DealerRequestType)}
                    className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] outline-none bg-[var(--surface-raised)]"
                  >
                    <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
                    <option value="AVAILABILITY">Stock Availability</option>
                    <option value="GENERAL_SUPPORT">General Support</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                    Priority <span className="text-[var(--accent-text)]">*</span>
                  </label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as DealerRequestPriority)}
                    className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] outline-none bg-[var(--surface-raised)]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                  Subject <span className="text-[var(--accent-text)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent demand for Graphene Coating 50ml"
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                  Description <span className="text-[var(--accent-text)]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the studio requirement, customer timeline, batch requirements..."
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest || !reqSubject.trim() || !reqDescription.trim()}
                  className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium disabled:opacity-50"
                >
                  {isSubmittingRequest ? 'Logging...' : 'Log Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Portal User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border)] shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
              Invite User to Dealer Portal
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] m-0">
              Provision portal access for a representative of <strong>{dealer.businessName}</strong> ({dealer.dealerCode}).
            </p>

            {inviteError && (
              <div className="p-2.5 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[12px]">
                {inviteError}
              </div>
            )}

            {!inviteSuccessLink ? (
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                    Full Name <span className="text-[var(--accent-text)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                    Email Address <span className="text-[var(--accent-text)]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@autodetail.in"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] outline-none"
                  />
                  <span className="text-[11.5px] text-[var(--text-muted)] block mt-1">
                    An activation link will be generated. The user will set their password upon first access.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting || !inviteName.trim() || !inviteEmail.trim()}
                    className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium disabled:opacity-50"
                  >
                    {isInviting ? 'Generating...' : 'Generate Activation Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded bg-[var(--status-success-soft)] border border-[var(--status-success-border)] text-[13px] text-[var(--status-success)] space-y-1">
                  <span className="font-bold block">✓ Invitation Generated Successfully</span>
                  <p className="m-0 text-[12.5px]">
                    Share this one-time activation link with <strong>{inviteName}</strong> ({inviteEmail}).
                  </p>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-primary)] mb-1">
                    Activation URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteSuccessLink}
                      className="w-full px-3 py-2 text-[12px] font-mono bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-primary)] select-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteSuccessLink);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2500);
                      }}
                      className="px-3.5 py-2 rounded bg-[var(--text-primary)] hover:bg-black text-[var(--background)] text-[12px] font-semibold shrink-0"
                    >
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--surface)] border border-[var(--border)] text-[11.5px] text-[var(--text-secondary)]">
                  <strong>Note:</strong> Token expires in 7 days. Once activated, the user can sign in using their email and chosen password at the Dealer Portal.
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setInviteSuccessLink(null);
                    }}
                    className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
