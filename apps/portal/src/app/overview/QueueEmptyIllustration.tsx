export function QueueEmptyIllustration({ kind }: { kind: 'studios' | 'partners' }) {
  return (
    <svg width="192" height="152" viewBox="0 0 224 176" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="110" cy="158" rx="86" ry="8" fill="var(--surface-subtle)" />
      {kind === 'studios' ? (
        <>
          <path d="M35 139V73l34-22 34 22v66" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="m29 76 40-27 40 27M30 140h79" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="47" y="86" width="44" height="53" rx="2" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
          <path d="M48 94h42m-42 7h42" stroke="var(--border-strong)" strokeWidth="1.5" />
          <path d="m52 124 4-8h24l6 8v8H52v-8Zm8-8 4-6h10l4 6" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M58 132v4m22-4v4" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <path d="M107 95h14a9 9 0 0 0 9-9V69" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 5" />
          <rect x="128" y="35" width="53" height="60" rx="4" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
          <path d="M136 35v-8h37v8M141 95V73h27v22" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M140 49h7m14 0h7m-28 11h7m14 0h7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="60" y="33" width="86" height="103" rx="6" transform="rotate(-8 60 33)" fill="var(--surface-subtle)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <path d="M76 26h57l21 21v83H76a5 5 0 0 1-5-5V31a5 5 0 0 1 5-5Z" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M133 26v17a4 4 0 0 0 4 4h17" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" />
          <circle cx="96" cy="61" r="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M83 82a13 13 0 0 1 26 0M119 64h21m-21 10h16M84 96h56m-56 10h37" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="m45 120 12-15h16m80 0h12l13 15v25a4 4 0 0 1-4 4H49a4 4 0 0 1-4-4v-25Z" fill="var(--surface-subtle)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M45 120h43l6 10h34l6-10h44" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
        </>
      )}
      <circle cx="176" cy="130" r="24" fill="var(--surface)" />
      <circle cx="176" cy="130" r="19" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
      <path d="m168 130 5 5 11-11" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
