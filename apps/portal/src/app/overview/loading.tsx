import React from 'react';

export default function OverviewLoading() {
  return (
    <div className="space-y-8 animate-pulse select-none" aria-busy="true" aria-label="Loading overview">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="h-4 w-32 bg-[var(--surface-subtle)] rounded mb-2" />
          <div className="h-8 w-64 bg-[var(--surface-subtle)] rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-24 bg-[var(--surface-subtle)] rounded" />
          <div className="h-7 w-20 bg-[var(--surface-subtle)] rounded" />
        </div>
      </div>

      {/* 4 Summary Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-5 sm:p-6 h-[130px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-[var(--surface-subtle)] rounded" />
              <div className="w-5 h-5 bg-[var(--surface-subtle)] rounded" />
            </div>
            <div className="h-8 w-12 bg-[var(--surface-subtle)] rounded my-2" />
            <div className="h-3 w-28 bg-[var(--surface-subtle)] rounded" />
          </div>
        ))}
      </div>

      {/* 2-column Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Skeleton (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 h-[320px]">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
            <div className="h-4 w-32 bg-[var(--surface-subtle)] rounded" />
            <div className="h-4 w-16 bg-[var(--surface-subtle)] rounded" />
          </div>
          <div className="pt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-48 bg-[var(--surface-subtle)] rounded" />
                  <div className="h-3 w-32 bg-[var(--surface-subtle)] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Needed Skeleton (1 col) */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 h-[320px]">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
            <div className="h-4 w-32 bg-[var(--surface-subtle)] rounded" />
            <div className="h-4 w-14 bg-[var(--surface-subtle)] rounded" />
          </div>
          <div className="pt-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-subtle)] mb-3" />
            <div className="h-4 w-40 bg-[var(--surface-subtle)] rounded mb-2" />
            <div className="h-3 w-48 bg-[var(--surface-subtle)] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
