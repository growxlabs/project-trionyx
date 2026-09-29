import type { ReactNode } from 'react';
import { QueueEmptyIllustration } from '../overview/QueueEmptyIllustration';

export function DealerEmptyState({ kind = 'registry', title, description, action }: {
  kind?: 'registry' | 'unassigned' | 'coverage'; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="min-h-[320px] flex flex-col items-center justify-center px-6 py-10 text-center">
      {kind === 'unassigned' ? <QueueEmptyIllustration kind="studios" /> : (
        <svg width="192" height="152" viewBox="0 0 224 176" fill="none" aria-hidden="true" focusable="false">
          <ellipse cx="111" cy="156" rx="80" ry="7" fill="var(--surface-subtle)" />
          {kind === 'coverage' ? (
            <>
              <path d="m37 65 49-15 51 17 48-15v87l-48 16-51-17-49 15V65Z" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M86 50v88l51 17V67" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
              <path d="m48 117 24-20 35 17 24-13 39 16" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
              <ellipse cx="125" cy="105" rx="15" ry="5" fill="var(--accent-soft)" />
              <path d="M125 31a24 24 0 0 0-24 24c0 19 24 43 24 43s24-24 24-43a24 24 0 0 0-24-24Z" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
              <circle cx="125" cy="55" r="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
            </>
          ) : (
            <>
              <path d="M49 145V64l57-31 57 31v81" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="m40 68 66-37 66 37M43 146h127" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
              <rect x="63" y="77" width="86" height="68" rx="3" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
              <path d="M64 85h84m-84 8h84" stroke="var(--border-strong)" strokeWidth="1.5" />
              <rect x="89" y="54" width="34" height="10" rx="2" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="m75 124 7-11h43l11 11v13H75v-13Zm12-11 8-9h19l8 9M76 125h59" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M84 137v5m43-5v5" stroke="var(--text-secondary)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="170" cy="130" r="23" fill="var(--surface)" />
              <circle cx="170" cy="130" r="18" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M170 123v14m-7-7h14" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </svg>
      )}
      <h3 className="mt-5 mb-0 text-[16px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 mb-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
