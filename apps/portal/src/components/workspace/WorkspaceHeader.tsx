import React from 'react';

interface WorkspaceHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  meta,
  action,
}: WorkspaceHeaderProps) {
  return (
    <header className="mb-8 pb-5 border-b border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] block mb-1.5">
              {eyebrow}
            </span>
          )}
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-[28px] sm:text-[32px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] leading-tight m-0">
              {title}
            </h1>
            {meta && (
              <div className="text-[13px] text-[var(--text-secondary)]">
                {meta}
              </div>
            )}
          </div>
          {description && (
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-1.5 m-0 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-3 shrink-0 sm:self-end">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
