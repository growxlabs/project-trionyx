import { OperationalLedgerIcon } from '../../components/shell/OperationsIcons';
import { EmptyState } from '../../components/workspace';

export function EnquiryEmptyState({ title, description, action }: {
  kind: 'registry' | 'caught-up'; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <EmptyState
      icon={<OperationalLedgerIcon className="w-20 h-20 text-[var(--text-muted)]" />}
      title={title}
      description={description}
      action={action}
    />
  );
}
