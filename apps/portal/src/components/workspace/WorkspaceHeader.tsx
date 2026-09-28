import React from 'react';

interface WorkspaceHeaderProps {
  eyebrow?: string; // deprecated, ignored for subtractive design
  title: string;
  description?: string; // deprecated, ignored for subtractive design
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function WorkspaceHeader({
  title,
  meta,
  action,
  className = '',
}: WorkspaceHeaderProps) {
  return (
    <header className={`mb-6 pb-4 border-b border-[var(--border)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-[24px] sm:text-[28px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] leading-tight m-0">
            {title}
          </h1>
          {meta && (
            <div className="text-[13px] text-[var(--text-muted)] font-normal">
              {meta}
            </div>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-2.5 shrink-0">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
