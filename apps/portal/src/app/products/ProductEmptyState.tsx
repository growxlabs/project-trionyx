import type { ReactNode } from 'react';
import { SerialStockTraysIcon } from '../../components/shell/OperationsIcons';

export function ProductEmptyState({ title, description, action }: {
  kind: 'registry' | 'attention' | 'families'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center px-6 py-10 text-center">
      <SerialStockTraysIcon className="w-20 h-20 text-[var(--text-muted)]" />
      <h3 className="mt-4 mb-0 text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1.5 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
