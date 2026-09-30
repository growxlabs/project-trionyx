import React from 'react';

interface WorkspaceHeaderProps {
  title: string;
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
    <header className={className}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)] m-0">
            {title}
          </h1>
          {meta && <div className="text-[13px] text-[var(--text-muted)]">{meta}</div>}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2 lg:pb-1">{action}</div>
        )}
      </div>
    </header>
  );
}
