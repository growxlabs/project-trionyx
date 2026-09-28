import React from 'react';

interface FilterOption {
  label: string;
  value: string;
}

export interface RegistryFilter {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
}

interface RegistryToolbarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: RegistryFilter[];
  totalCount?: number;
  filteredCount?: number;
  unitLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function RegistryToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  totalCount,
  filteredCount,
  unitLabel = 'records',
  children,
  className = '',
}: RegistryToolbarProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 text-[13px] ${className}`}>
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {onSearchChange !== undefined && (
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <input
              type="text"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-1.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}

        {filters.map((f) => (
          <div key={f.id} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              aria-label={f.label}
              className="px-2.5 py-1.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[12.5px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {children}
      </div>

      {/* Counts / Metainfo */}
      {(totalCount !== undefined || filteredCount !== undefined) && (
        <div className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
          {filteredCount !== undefined && totalCount !== undefined && filteredCount !== totalCount ? (
            <span>Showing {filteredCount} of {totalCount} {unitLabel}</span>
          ) : (
            <span>{totalCount ?? filteredCount} {unitLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
