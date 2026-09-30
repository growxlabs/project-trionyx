import type { ReactNode } from 'react';
import { SerialStockTraysIcon } from '../../components/shell/OperationsIcons';
import { EmptyState } from '../../components/workspace';

export function ProductEmptyState({ title, description, action }: {
  kind: 'registry' | 'attention' | 'families'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <EmptyState
      icon={<SerialStockTraysIcon className="w-20 h-20 text-[var(--text-muted)]" />}
      title={title}
      description={description}
      action={action}
    />
  );
}
