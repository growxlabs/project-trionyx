import type { ReactNode } from 'react';
import { LayeredCoatingSheetsIcon } from '../../components/shell/OperationsIcons';
import { EmptyState } from '../../components/workspace';

export function DealerEmptyState({ title, description, action }: {
  kind?: 'registry' | 'unassigned' | 'coverage'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <EmptyState
      icon={<LayeredCoatingSheetsIcon className="w-20 h-20 text-[var(--text-muted)]" />}
      title={title}
      description={description}
      action={action}
    />
  );
}
