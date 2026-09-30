import type { ReactNode } from 'react';
import { ConnectedNodesIcon } from '../../components/shell/OperationsIcons';
import { EmptyState } from '../../components/workspace';

export function DistributorEmptyState({ title, description, action }: {
  kind: 'registry' | 'hubs'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <EmptyState
      icon={<ConnectedNodesIcon className="w-20 h-20 text-[var(--text-muted)]" />}
      title={title}
      description={description}
      action={action}
    />
  );
}
