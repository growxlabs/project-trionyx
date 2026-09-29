export function EnquiryEmptyState({ kind, title, description, action }: {
  kind: 'registry' | 'caught-up'; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center px-6 py-9 text-center">
      <svg width="168" height="132" viewBox="0 0 200 156" fill="none" aria-hidden="true" focusable="false">
        <ellipse cx="99" cy="140" rx="66" ry="6" fill="var(--surface-subtle)" />
        <rect x="43" y="35" width="103" height="82" rx="6" fill="var(--surface-subtle)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <path d="M51 45h87v64H51z" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
        <path d="m53 48 42 33 42-33" stroke="var(--text-secondary)" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M56 105h30m-30-7h18" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" />
        {kind === 'registry' ? (
          <>
            <path d="M106 22h38a5 5 0 0 1 5 5v30h-43a5 5 0 0 1-5-5V27a5 5 0 0 1 5-5Z" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
            <path d="m102 28 23 18 23-18" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="157" cy="111" r="21" fill="var(--surface)" />
            <circle cx="157" cy="111" r="16" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="M157 105v12m-6-6h12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="153" cy="108" r="24" fill="var(--surface)" />
            <circle cx="153" cy="108" r="18" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
            <path d="m145 108 5 5 11-11" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      <h3 className="mt-3 mb-0 text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1.5 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
