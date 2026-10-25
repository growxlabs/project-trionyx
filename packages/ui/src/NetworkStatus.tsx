'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { DisconnectedWorkshopIcon, OperationsBoardIcon } from './StatusIcons';

export const SLOW_LOADING_DELAY_MS = 8000;

function subscribeConnection(update: () => void) {
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  return () => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  };
}

function useOffline() {
  return useSyncExternalStore(subscribeConnection, () => !navigator.onLine, () => false);
}

/** Remains non-modal so an interrupted connection never hides entered form data. */
export function NetworkStatus() {
  const offline = useOffline();
  return offline ? <OfflineNotice /> : null;
}

function OfflineNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return <aside className="tx-network-notice" aria-label="Connection status">
    <DisconnectedWorkshopIcon />
    <div role="status"><strong>You’re offline</strong><p>Check your connection. Keep this page open to preserve anything you’ve entered.</p></div>
    <button className="tx-network-dismiss" aria-label="Dismiss connection notice" onClick={() => setDismissed(true)}>×</button>
  </aside>;
}

/** Only mounted inside an active loading boundary; cleared as soon as content arrives. */
export function SlowLoadingNotice() {
  const offline = useOffline();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timeout = window.setTimeout(() => setSlow(true), SLOW_LOADING_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, []);
  if (!slow || offline) return null;
  return <div className="tx-slow-notice" role="status"><OperationsBoardIcon /><div><strong>Taking a little longer</strong><p>We’re still waiting for this page. You can keep waiting or use another link.</p></div></div>;
}
