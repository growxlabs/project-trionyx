import React from 'react';

interface RecordSectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function RecordSection({
  title,
  action,
  children,
  className = '',
}: RecordSectionProps) {
  return (
    <section className={`pt-6 border-t border-[var(--border)] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] m-0">
          {title}
        </h2>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}
