import type { ReactNode } from 'react';
import { LayeredCoatingSheetsIcon } from '../../components/shell/OperationsIcons';

export function DealerEmptyState({ title, description, action }: {
  kind?: 'registry' | 'unassigned' | 'coverage'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="min-h-[320px] flex flex-col items-center justify-center px-6 py-10 text-center">
      <LayeredCoatingSheetsIcon className="w-20 h-20 text-[var(--text-muted)]" />
      <h3 className="mt-5 mb-0 text-[16px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
