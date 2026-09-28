'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Warranty, SafeUser } from '@trionyx/types';
import { Modal } from '../../../components/ui/Modal';

interface WarrantyDetailViewProps {
  warranty: Warranty;
  auditLogs: Array<{
    id: string;
    event: string;
    createdAt: string;
    ipAddress: string | null;
    metadata: any;
  }>;
  user: SafeUser;
}

export function WarrantyDetailView({
  warranty: initialWarranty,
  auditLogs: initialAuditLogs,
  user,
}: WarrantyDetailViewProps) {
  const router = useRouter();

  const [warranty, setWarranty] = useState<Warranty>(initialWarranty);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  // Void modal state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);

  const canVoid = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Calculate days remaining or expired
  const now = new Date();
  const endDate = new Date(warranty.warrantyEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const handleVoidWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidReason.trim() || voidReason.trim().length < 3) {
      setVoidError('Please provide a specific void reason (minimum 3 characters)');
      return;
    }

    setIsVoiding(true);
    setVoidError(null);

    try {
      const res = await fetch(`/api/v1/internal/warranties/${warranty.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setVoidError(json.error?.message || 'Failed to void warranty');
        return;
      }

      setWarranty(json.data);
      setShowVoidModal(false);
      setVoidReason('');
      router.refresh();
    } catch {
      setVoidError('Network connection error. Please try again.');
    } finally {
      setIsVoiding(false);
    }
  };

  const statusBadge = () => {
    if (warranty.status === 'VOID') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
          Voided
        </span>
      );
    }
    if (warranty.derivedStatus === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
        Active Warranty
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="mb-2">
            <Link
              href="/warranty"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Warranty
            </Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-mono text-[20px] font-semibold text-[var(--text-primary)] m-0">
              {warranty.serialNumber}
            </h1>
            {statusBadge()}
          </div>
        </div>

        {canVoid && warranty.status !== 'VOID' && (
          <button
            type="button"
            onClick={() => {
              setVoidReason('');
              setVoidError(null);
              setShowVoidModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] hover:bg-[var(--status-danger-soft)] text-[var(--status-danger)] text-[13px] font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            Void Warranty
          </button>
        )}
      </div>

      {/* Void Notice Alert if Voided */}
      {warranty.status === 'VOID' && (
        <div className="p-4 rounded-[8px] bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] flex items-start gap-3 text-[13px]">
          <svg className="w-5 h-5 text-[var(--status-danger)] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="space-y-1">
            <p className="font-bold text-[var(--status-danger)] m-0">
              This warranty registration has been officially VOIDED.
            </p>
            <p className="text-[var(--text-primary)] m-0">
              <strong>Void Reason:</strong> {warranty.voidReason || 'No reason specified'}
            </p>
            {warranty.voidedAt && (
              <p className="text-[12px] text-[var(--text-secondary)] m-0">
                Actioned on {new Date(warranty.voidedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-5 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4">
          <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] m-0 pb-2 border-b border-[var(--border)]">
            Product Formulation
          </h2>

          <div className="space-y-3 text-[13px]">
            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Product Name
              </span>
              <p className="font-medium text-[var(--text-primary)] m-0 mt-0.5">
                {warranty.productName || 'Unknown Product'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Product Code
              </span>
              <span className="font-mono font-bold text-[var(--accent-text)]">
                {warranty.productCode || '—'}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <Link
                href={`/products/${warranty.productId}`}
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--accent-text)] hover:underline"
              >
                View Product Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Warranty Timeline */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-5 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4">
          <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] m-0 pb-2 border-b border-[var(--border)]">
            Warranty Timeline
          </h2>

          <div className="space-y-3 text-[13px]">
            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Installation / Application Date
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                {warranty.installationDate}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Coverage Period
              </span>
              <span className="text-[var(--text-primary)]">
                {warranty.warrantyStartDate} to {warranty.warrantyEndDate}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Remaining Term
              </span>
              <span
                className={`font-semibold ${
                  warranty.status === 'VOID'
                    ? 'text-[var(--status-danger)]'
                    : diffDays > 0
                    ? 'text-[var(--status-success)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {warranty.status === 'VOID'
                  ? 'Voided (No Coverage)'
                  : diffDays > 0
                  ? `${diffDays} days remaining`
                  : `Expired ${Math.abs(diffDays)} days ago`}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Context */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-5 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4">
          <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] m-0 pb-2 border-b border-[var(--border)]">
            Registration Context
          </h2>

          <div className="space-y-3 text-[13px]">
            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Channel / Dealer
              </span>
              <p className="font-medium text-[var(--text-primary)] m-0 mt-0.5">
                {warranty.dealerName || 'Internal Direct Registration'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Activated By
              </span>
              <p className="text-[var(--text-primary)] m-0 mt-0.5">
                {warranty.activatedByName || 'System Operator'} ({warranty.activatedByType})
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] block">
                Registration Timestamp
              </span>
              <span className="text-[var(--text-secondary)]">
                {new Date(warranty.activatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit History Log */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4 p-5">
        <div className="pb-3 border-b border-[var(--border)]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
            Lifecycle Audit Log
          </h2>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5 m-0">
            Immutable log of warranty activation, policy association, and status modifications.
          </p>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-6 text-center text-[var(--text-muted)] text-[13px]">
            No audit records found for this warranty.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[var(--border)] rounded-[4px]">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                  <th className="py-2.5 px-4 w-40">Timestamp</th>
                  <th className="py-2.5 px-4 w-36">Event</th>
                  <th className="py-2.5 px-4">Operator / Actor</th>
                  <th className="py-2.5 px-4">Details / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                    <td className="py-2.5 px-4 text-[var(--text-muted)] whitespace-nowrap text-[12px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium border ${
                          log.event === 'WARRANTY_ACTIVATED'
                            ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]'
                            : 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]'
                        }`}
                      >
                        {log.event === 'WARRANTY_ACTIVATED' ? 'Activated' : 'Voided'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium text-[14px]">
                      {log.metadata?.activatedByName || log.metadata?.voidedByName || 'Internal Staff'}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-secondary)] text-[13px]">
                      {log.metadata?.reason ? (
                        <span>Reason: <em>{log.metadata.reason}</em></span>
                      ) : (
                        <span>Serial: <code className="font-mono text-[12px]">{log.metadata?.serialNumber}</code></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Void Warranty Modal */}
      <Modal
        isOpen={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        title="Void Warranty Registration"
        subtitle={`Serial #${warranty.serialNumber}`}
      >
        <form onSubmit={handleVoidWarranty} className="space-y-4">
          {voidError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {voidError}
            </div>
          )}

          <div className="p-3.5 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[12.5px] text-[var(--status-danger)] space-y-1">
            <p className="font-bold m-0">Warning: Irreversible Operational Action</p>
            <p className="m-0">
              Voiding this warranty terminates official warranty coverage. The public lookup will immediately report this warranty as expired or inactive.
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Mandatory Void Reason *
            </label>
            <textarea
              required
              rows={3}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="e.g. Serial packaging was damaged prior to installation, or counterfeit application detected."
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1 m-0">
              This reason will be permanently recorded in the system audit log.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowVoidModal(false)}
              disabled={isVoiding}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVoiding || voidReason.trim().length < 3}
              className="px-4 py-2 rounded-[6px] bg-[var(--status-danger)] hover:bg-[var(--status-danger)] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {isVoiding ? 'Voiding...' : 'Confirm Void Warranty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
