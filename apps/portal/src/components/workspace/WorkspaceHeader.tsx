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
    <header className={`mb-4 pb-2.5 border-b border-[var(--border)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] leading-none m-0">
            {title}
          </h1>
          {meta && (
            <div className="text-[12px] font-mono text-[var(--text-muted)] font-normal">
              {meta}
            </div>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-2 shrink-0">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
