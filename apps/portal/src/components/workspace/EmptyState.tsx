import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Canonical empty-state layout, matching the Studios (Dealers) design.
 * No background — it sits directly on the canvas.
 */
export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`min-h-[320px] flex flex-col items-center justify-center px-6 py-10 text-center ${className}`}>
      {icon}
      <h3 className="mt-5 mb-0 text-[16px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
