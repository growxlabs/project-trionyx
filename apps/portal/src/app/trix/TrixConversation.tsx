'use client';
import { PreparedActionCard } from './PreparedActionCard';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Add, ArrowUp } from '@carbon/icons-react';
import { responseSchema, serialRoute, type TrixExecution } from '@trionyx/ai/responses';
import { StatusBadge } from '../../components/workspace/StatusBadge';
import styles from './TrixConversation.module.css';

export type TrixEntry = { id: string; question: string; result?: TrixExecution; failure?: { title: string; description: string; code: string } };
export function TrixConversation() {
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState<TrixEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const conversationId = useRef<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  useEffect(() => () => controller.current?.abort(), []);
  function newConversation() {
    generation.current++; controller.current?.abort(); conversationId.current = null;
    setEntries([]); setMessage(''); setBusy(false);
  }
  async function send(question: string, retryId?: string) {
    if (busy || !question.trim()) return;
    const id = retryId ?? crypto.randomUUID(), currentGeneration = generation.current;
    conversationId.current ??= crypto.randomUUID(); controller.current = new AbortController();
    setEntries(previous => retryId ? previous.map(entry => entry.id === id ? { id, question } : entry) : [...previous, { id, question }]);
    setMessage(''); setBusy(true);
    function update(update: Partial<TrixEntry>) {
      if (generation.current === currentGeneration) setEntries(previous => previous.map(entry => entry.id === id ? { ...entry, ...update } : entry));
    }
    try {
      const res = await fetch('/api/v1/internal/trix', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.current.signal,
        body: JSON.stringify({ conversationId: conversationId.current, message: question }) });
      const body = await res.json();
      if (!res.ok) {
        update({ failure: res.status === 401 ? { title: 'Your session has expired.', description: 'Sign in again to use TRIX.', code: 'UNAUTHENTICATED' }
          : res.status === 403 ? { title: 'TRIX access is restricted.', description: 'Sign in with your Managing Director account.', code: 'FORBIDDEN' }
          : { title: "TRIX couldn't connect.", description: 'The AI service is temporarily unavailable.', code: 'SERVICE_UNAVAILABLE' } }); return;
      }
      update({ result: { ...body.data, response: responseSchema.parse(body.data.response) } });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      update({ failure: { title: "TRIX couldn't connect.", description: 'The AI service is temporarily unavailable.', code: 'CONNECTION_ERROR' } });
    } finally { if (generation.current === currentGeneration) setBusy(false); }
  }
  return <TrixWorkspace message={message} onMessageChange={setMessage} entries={entries} busy={busy}
    onSend={() => void send(message.trim())} onRetry={entry => void send(entry.question, entry.id)} onNewConversation={newConversation} />;
}

type WorkspaceProps = { message: string; onMessageChange: (value: string) => void; entries: TrixEntry[]; busy: boolean;
  onSend: () => void; onRetry: (entry: TrixEntry) => void; onNewConversation: () => void };
export function TrixWorkspace({ message, onMessageChange, entries, busy, onSend, onRetry, onNewConversation }: WorkspaceProps) {
  const input = useRef<HTMLTextAreaElement>(null), end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!input.current) return;
    input.current.style.height = 'auto'; input.current.style.height = `${Math.min(input.current.scrollHeight, 160)}px`;
  }, [message]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [entries, busy]);
  function suggest(query: string) { onMessageChange(query); input.current?.focus(); }
  return <section className={styles.workspace} aria-label="TRIX workspace"><div className={styles.frame}>
    <header className={styles.header}>
      <div><h1>TRIX</h1><p>Ask across Trionyx</p></div>
      <button type="button" className={styles.newConversation} onClick={() => { onNewConversation(); input.current?.focus(); }} aria-label="New conversation">
        <span>New conversation</span><Add size={20} className={styles.mobileAdd} />
      </button>
    </header>
    <div className={styles.conversation} role="log" aria-label="TRIX conversation" aria-live="polite" aria-busy={busy}>
      {!entries.length ? <div className={styles.empty}>
        <h2>What do you want to know?</h2><p>Search, analyse and navigate Trionyx operations.</p>
        <div className={styles.suggestions}>
          <button type="button" onClick={() => suggest('Where is serial ')}>Find a serial</button>
          <button type="button" onClick={() => suggest('Check inventory availability.')}>Check inventory</button>
          <button type="button" onClick={() => suggest('Review enquiries.')}>Review enquiries</button>
        </div>
      </div> : <div className={styles.entries}>{entries.map(entry => <article key={entry.id} className={styles.entry}>
        <div className={styles.userMessage}><p className={styles.speaker}>You</p><p>{entry.question}</p></div>
        <div className={styles.answer}><p className={styles.speaker}>TRIX</p>
          {entry.failure ? <ConnectionFailure failure={entry.failure} onRetry={() => onRetry(entry)} disabled={busy} />
            : entry.result ? <TrixAnswer entry={entry} onRetry={() => onRetry(entry)} disabled={busy} />
            : <p className={styles.working} role="status">Checking your request…</p>}
        </div>
      </article>)}</div>}
      <div ref={end} />
    </div>
    <footer className={styles.footer}>
      <form className={styles.composer} onSubmit={event => { event.preventDefault(); if (!busy && message.trim()) onSend(); }}>
        <textarea ref={input} aria-label="Message TRIX" placeholder="Ask TRIX anything about Trionyx..." rows={1}
          value={message} onChange={event => onMessageChange(event.target.value)} maxLength={2000} disabled={busy}
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!busy && message.trim()) onSend(); } }} />
        <button type="submit" className={styles.send} disabled={busy || !message.trim()} aria-label="Send message"><ArrowUp size={20} /></button>
      </form>
    </footer>
  </div></section>;
}

function ConnectionFailure({ failure, onRetry, disabled }: { failure: NonNullable<TrixEntry['failure']>; onRetry: () => void; disabled: boolean }) {
  return <div className={styles.failure}><p className={styles.failureTitle}>{failure.title}</p><p className={styles.muted}>{failure.description}</p>
    {failure.code === 'UNAUTHENTICATED' || failure.code === 'FORBIDDEN' ? <Link href="/login" className={styles.recordAction}>Sign in</Link>
      : <button type="button" onClick={onRetry} disabled={disabled} className={styles.recordAction}>Try again</button>}
    <details className={styles.technical}><summary>Technical details</summary><p>Request status: {failure.code}</p><p>No operational result was returned.</p></details>
  </div>;
}
function TrixAnswer({ entry, onRetry, disabled }: { entry: TrixEntry; onRetry: () => void; disabled: boolean }) {
  const result = entry.result!, response = result.response;
  const providerFailure = response.type === 'message' && ['PROVIDER_ERROR', 'PROVIDER_NOT_CONFIGURED', 'PROVIDER_LIMIT_REACHED'].includes(response.errorCode ?? '');
  return <>
    {providerFailure ? <ConnectionFailure failure={{ title: response.type === 'message' && response.errorCode === 'PROVIDER_LIMIT_REACHED' ? 'TRIX reached the AI provider limit.' : "TRIX couldn't connect.", description: response.type === 'message' && response.errorCode === 'PROVIDER_LIMIT_REACHED' ? response.summary : 'The AI service is temporarily unavailable.', code: response.type === 'message' ? response.errorCode! : 'PROVIDER_ERROR' }} onRetry={onRetry} disabled={disabled} />
      : response.type === 'message' ? <p className={styles.message}>{response.summary}</p>
      : response.type === 'prepared_action' ? <PreparedActionCard key={response.action.preparationId} initial={response.action} />
      : response.type === 'serial_record' ? <div className={styles.serial}>
        <h2>{response.serialRecord.serialNumber}</h2>
        <div className={styles.productRow}><p>{response.serialRecord.productName}</p><StatusBadge status={response.serialRecord.status} label={response.serialRecord.status} /></div>
        <dl className={styles.fields}>
          <div><dt>Current location</dt><dd>{response.serialRecord.locationName ?? 'Not recorded'}</dd></div>
          <div><dt>Last movement</dt><dd>{response.serialRecord.lastMovementAt ? formatMovementDate(response.serialRecord.lastMovementAt) : 'Not recorded'}</dd></div>
        </dl>
        <Link href={serialRoute(response.actions[0], response.serialRecord)} className={styles.recordAction}>Open serial</Link>
      </div>
      : response.type === 'inventory_summary' ? <div className={styles.serial}>
        <h2>Inventory Summary</h2>
        <p className="font-semibold text-base mt-2">Total: {response.total} units (grouped by {response.groupBy})</p>
        <ul className="mt-3 space-y-2">
          {response.groups.map(g => (
            <li key={g.key} className="flex justify-between py-1.5 border-b border-white/10 text-sm">
              <span>{g.label}</span>
              <span className="font-mono font-bold">{g.count}</span>
            </li>
          ))}
        </ul>
      </div>
      : response.type === 'inventory_list' ? <div className={styles.serial}>
        <h2>Inventory Serials ({response.items.length} of {response.pageInfo.total})</h2>
        <ul className="mt-3 space-y-2 max-h-80 overflow-y-auto">
          {response.items.map(item => (
            <li key={item.id} className="py-2 border-b border-white/10 flex justify-between items-center text-sm">
              <div>
                <p className="font-mono font-semibold">{item.serialNumber}</p>
                <p className="text-xs opacity-70">{item.product.name} · {item.location?.name ?? 'No location'}</p>
              </div>
              <StatusBadge status={item.status} label={item.status} />
            </li>
          ))}
        </ul>
      </div>
      : response.type === 'serial_movements' ? <div className={styles.serial}>
        <h2>Recent Movements ({response.items.length})</h2>
        <ul className="mt-3 space-y-2 max-h-80 overflow-y-auto">
          {response.items.map(item => (
            <li key={item.id} className="py-2 border-b border-white/10 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-mono font-semibold">{item.serialNumber}</span>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-white/10">{item.movementType}</span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                {item.fromLocationName ? `${item.fromLocationName} → ` : ''}{item.toLocationName ?? 'N/A'} · {formatMovementDate(item.occurredAt)}
              </p>
            </li>
          ))}
        </ul>
      </div>
      : response.type === 'inventory_exceptions' ? <div className={styles.serial}>
        <h2>Inventory Exceptions ({response.totalExceptions})</h2>
        {response.totalExceptions === 0 ? (
          <p className="text-sm opacity-80 mt-2">No inventory exceptions found. All records meet deterministic rules.</p>
        ) : (
          <ul className="mt-3 space-y-2 max-h-80 overflow-y-auto">
            {response.items.map((item, idx) => (
              <li key={idx} className="p-3 rounded border border-white/10 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-white/10">{item.severity}</span>
                </div>
                <p className="text-xs opacity-80 mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      : null}
    <details className={styles.activity}><summary>Activity · {result.activity.length} {result.activity.length === 1 ? 'step' : 'steps'}</summary>
      <ol>{result.activity.map((step, index) => <li key={index}>
        <p className={styles.toolName}>{step.status === 'succeeded' ? '✓' : '—'} {step.toolName}</p>
        <p className={styles.muted}>{step.status === 'succeeded' ? 'Completed' : 'Failed'} · {step.durationMs} ms</p>
        <dl><div><dt>Looked up</dt><dd>{step.inputSummary}</dd></div><div><dt>Result</dt><dd>{step.resultSummary}</dd></div></dl>
      </li>)}</ol>
      {!result.activity.length && <p className={styles.muted}>No inventory tool was executed.</p>}
    </details>
  </>;
}
function formatMovementDate(value: string) {
  const date = new Date(value); if (Number.isNaN(date.getTime())) return 'Not recorded';
  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' }).format(date);
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(date);
  return `${day} · ${time}`;
}
