'use client';

import React, { useState, useTransition } from 'react';
import { EmptyStockTrayIcon, OperationsBoardIcon } from './StatusIcons';

export interface StatusPageProps {
  kind: 'not-found' | 'error';
  brand?: string;
  homeHref?: string;
  homeLabel?: string;
  embedded?: boolean;
  retry?: () => void;
  digest?: string;
}

export function StatusPage({ kind, brand = 'Trionyx', homeHref = '/', homeLabel = 'Back to home', embedded = false, retry, digest }: StatusPageProps) {
  const missing = kind === 'not-found';
  const [pending, startTransition] = useTransition();
  const [retryFailed, setRetryFailed] = useState(false);
  const Icon = missing ? EmptyStockTrayIcon : OperationsBoardIcon;

  function tryAgain() {
    setRetryFailed(false);
    if (!retry) { window.location.reload(); return; }
    startTransition(() => {
      try { retry(); } catch { setRetryFailed(true); }
    });
  }

  return (
    <section className={`tx-status-page${embedded ? ' tx-status-embedded' : ''}`} aria-labelledby="status-heading">
      {!embedded && <header className="tx-status-top"><a href={homeHref}>{brand}</a><span>Support / {missing ? '404' : 'Page error'}</span></header>}
      <div className="tx-status-body">
        <div className="tx-status-art" aria-hidden="true"><span className="tx-status-code">{missing ? '404' : '!'}</span><div className="tx-status-icon-frame"><Icon /></div><span className="tx-status-art-label">{missing ? 'No matching record' : 'Request interrupted'}</span></div>
        <div className="tx-status-copy">
          <p className="tx-status-eyebrow">{missing ? 'Page not found' : 'Something went wrong'}</p>
          <h1 id="status-heading">{missing ? 'This link leads\nto an empty bay.' : 'A brief pause.\nLet’s try again.'}</h1>
          <p className="tx-status-description">{missing ? 'The page may have moved, or this record is no longer available. Check the address or return to a familiar place.' : 'We couldn’t load this page. Try again in a moment. If it still won’t open, return home and try another page.'}</p>
          <div className="tx-status-actions">
            {!missing && <button className="tx-status-primary" onClick={tryAgain} disabled={pending}>{pending ? 'Trying again…' : 'Try again'}<span aria-hidden="true">↻</span></button>}
            <a className={missing ? 'tx-status-primary' : 'tx-status-secondary'} href={homeHref}>{homeLabel}<span aria-hidden="true">→</span></a>
            {missing && <button className="tx-status-secondary" onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign(homeHref)}>Go back</button>}
          </div>
          {retryFailed && <p role="alert" className="tx-status-description">That attempt didn’t complete. Please try again or use the link above.</p>}
          <div className="tx-status-footnote">{missing ? 'Check the link spelling, including any record ID.' : 'Your connection or the service may be temporarily unavailable.'}{!missing && digest && <span>Reference: {digest}</span>}</div>
        </div>
      </div>
      {!embedded && <footer className="tx-status-bottom"><span>{brand}</span><span>{missing ? 'A clear route back.' : 'Ready when you are.'}</span></footer>}
    </section>
  );
}
