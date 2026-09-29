import type { ReactNode } from 'react';

export function DistributorEmptyState({ kind, title, description, action }: {
  kind: 'registry' | 'hubs'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center px-6 py-9 text-center">
      <svg width="176" height="140" viewBox="0 0 208 164" fill="none" aria-hidden="true" focusable="false">
        <ellipse cx="101" cy="148" rx="69" ry="6" fill="var(--surface-subtle)" />
        {kind === 'registry' ? (
          <>
            <path d="M48 137V65l53-30 53 30v72" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m40 68 61-35 61 35M43 138h117" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="65" y="77" width="73" height="60" rx="3" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.4" />
            <path d="M76 77v-9h16v9m25 0v-9h16v9" stroke="var(--accent)" strokeWidth="1.5" />
            <path d="M76 97h51m-51 9h40m-40 9h45" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="153" cy="118" r="21" fill="var(--surface)" />
            <circle cx="153" cy="118" r="16" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="M153 112v12m-6-6h12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M39 70 99 39l61 31v65H39V70Z" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m32 71 67-35 68 35M35 136h132" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M54 82h89m-89 10h89m-89 10h89" stroke="var(--border-strong)" strokeWidth="1.4" />
            <rect x="62" y="76" width="22" height="12" rx="2" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.2" />
            <rect x="109" y="96" width="24" height="13" rx="2" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.2" />
            <path d="M74 113v22m43-22v22" stroke="var(--text-muted)" strokeWidth="2" />
            <circle cx="157" cy="116" r="21" fill="var(--surface)" />
            <circle cx="157" cy="116" r="16" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="M157 108v9l6 4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      <h3 className="mt-3 mb-0 text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1.5 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
