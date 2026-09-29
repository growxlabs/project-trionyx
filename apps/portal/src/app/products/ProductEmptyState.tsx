import type { ReactNode } from 'react';

export function ProductEmptyState({ kind, title, description, action }: {
  kind: 'registry' | 'attention' | 'families'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center px-6 py-10 text-center">
      <svg width="176" height="142" viewBox="0 0 208 168" fill="none" aria-hidden="true" focusable="false">
        <ellipse cx="103" cy="151" rx="72" ry="7" fill="var(--surface-subtle)" />
        {kind === 'registry' ? (
          <>
            <path d="M52 139V62l51-28 51 28v77" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m44 65 59-33 59 33M47 140h112" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="68" y="75" width="70" height="64" rx="3" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.4" />
            <path d="M78 75v-8h14v8m22 0v-8h14v8" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="M78 97h50m-50 9h35m-35 9h43" stroke="var(--border-strong)" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="149" cy="121" r="21" fill="var(--surface)" />
            <circle cx="149" cy="121" r="16" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="M149 114v14m-7-7h14" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : kind === 'attention' ? (
          <>
            <path d="M43 136V76h111v60M38 137h121M43 101h111" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M57 90h20l7 8v2H55v-2l2-8Zm5 0 3-5h8l4 5m-20 8h22m-19 0v2m16-2v2" stroke="var(--text-secondary)" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M101 92v-3l-3-4v-7h15v7l-3 4v12h-9V92Z" fill="var(--surface-subtle)" stroke="var(--text-secondary)" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M101 91h9v6h-9z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.3" />
            <rect x="126" y="81" width="17" height="20" rx="2" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.4" />
            <path d="M130 88h9m-9 4h9" stroke="var(--border-strong)" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="157" cy="120" r="20" fill="var(--surface)" />
            <circle cx="157" cy="120" r="15" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="m150 120 5 5 9-10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <path d="m104 32 58 31-58 31-58-31 58-31Z" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m46 63 58 31 58-31M46 83l58 31 58-31M46 103l58 31 58-31" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m104 94 58-31v40l-58 31V94Zm-58-31 58 31v40l-58-31V63Z" fill="var(--surface)" fillOpacity=".55" />
            <path d="m104 94 58-31M104 94v40M46 63l58 31" stroke="var(--text-muted)" strokeWidth="1.5" />
            <circle cx="153" cy="118" r="22" fill="var(--surface)" />
            <circle cx="153" cy="118" r="17" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="M153 111v14m-7-7h14" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
      <h3 className="mt-4 mb-0 text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1.5 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
