'use client';

import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-6">
        <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed m-0">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--background)] active:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
              isDestructive
                ? 'bg-[var(--status-danger)] hover:bg-[var(--status-danger)] active:bg-[var(--status-danger)] text-[var(--background)]'
                : 'bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] active:bg-[var(--surface-subtle)] text-[var(--background)]'
            }`}
          >
            {isLoading && (
              <svg className="animate-spin h-3.5 w-3.5 text-[var(--background)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
