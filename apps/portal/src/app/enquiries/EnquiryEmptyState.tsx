import { OperationalLedgerIcon } from '../../components/shell/OperationsIcons';

export function EnquiryEmptyState({ title, description, action }: {
  kind: 'registry' | 'caught-up'; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center px-6 py-9 text-center">
      <OperationalLedgerIcon className="w-20 h-20 text-[var(--text-muted)]" />
      <h3 className="mt-3 mb-0 text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1.5 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
