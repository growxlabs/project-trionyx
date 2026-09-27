'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OverviewError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for operational debugging
    console.error('Overview error boundary caught error:', error);
  }, [error]);

  return (
    <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-8 sm:p-12 text-center max-w-xl mx-auto shadow-[0_2px_12px_rgba(23,23,20,0.04)] my-8">
      <div className="w-12 h-12 rounded-full bg-[var(--status-warning-soft)] border border-[var(--status-warning-border)] flex items-center justify-center text-[var(--status-warning)] mx-auto mb-4">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="text-[18px] sm:text-[20px] font-semibold text-[var(--text-primary)] tracking-[-0.02em] m-0">
        Unable to load overview data
      </h2>

      <p className="text-[13.5px] text-[var(--text-secondary)] mt-2 mb-6 max-w-md mx-auto leading-relaxed">
        An error occurred while communicating with the operations database. Please retry or contact system administration if the issue persists.
      </p>

      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center justify-center px-4 py-2.5 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] active:bg-[var(--surface-subtle)] text-[var(--background)] text-[13.5px] font-semibold transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
