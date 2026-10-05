'use client';
import { PreparedActionCard } from './PreparedActionCard';
import { TrixResultCard } from './TrixResultCards';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Add, ArrowUp } from '@carbon/icons-react';
import { responseSchema, type TrixExecution, type TrixProgress, type TrixStreamEvent } from '@trionyx/ai/responses';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './TrixConversation.module.css';

type Failure = { title: string; description: string; code: string };
export type TrixEntry = { id: string; question: string; steps?: TrixProgress[]; result?: TrixExecution; failure?: Failure };

function failureFor(status: number, code?: unknown, message?: unknown): Failure {
  if (status === 401 || code === 'UNAUTHENTICATED') return { title: 'Your session has expired.', description: 'Sign in again to use TRIX.', code: 'UNAUTHENTICATED' };
  if (status === 403 || code === 'FORBIDDEN') return { title: 'TRIX access is restricted.', description: 'Sign in with your Managing Director account.', code: 'FORBIDDEN' };
  if (typeof code === 'string' && typeof message === 'string') return { title: "TRIX couldn't complete the request.", description: message.slice(0, 300), code: code.slice(0, 100) };
  return { title: "TRIX couldn't connect.", description: 'The AI service is temporarily unavailable.', code: 'SERVICE_UNAVAILABLE' };
}
/** A finished event replaces the most recent matching started step; a started event adds a step. */
function withStep(steps: TrixProgress[] = [], step: TrixProgress): TrixProgress[] {
  if (step.status === 'started') return [...steps, step];
  const index = steps.map(s => s.toolName === step.toolName && s.status === 'started').lastIndexOf(true);
  return index < 0 ? [...steps, step] : steps.map((s, i) => i === index ? step : s);
}
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
    function update(change: Partial<TrixEntry> | ((entry: TrixEntry) => Partial<TrixEntry>)) {
      if (generation.current === currentGeneration) setEntries(previous => previous.map(entry => entry.id === id ? { ...entry, ...(typeof change === 'function' ? change(entry) : change) } : entry));
    }
    function finish(data: TrixExecution) { update({ result: { ...data, response: responseSchema.parse(data.response) } }); }
    try {
      const res = await fetch('/api/v1/internal/trix', { method: 'POST', signal: controller.current.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
        body: JSON.stringify({ conversationId: conversationId.current, message: question }) });
      if (!res.ok || !res.body || !res.headers.get('content-type')?.includes('application/x-ndjson')) {
        const body = await res.json().catch(() => null);
        if (res.ok && body?.data) finish(body.data);
        else update({ failure: failureFor(res.status, body?.error?.code, body?.error?.message) });
        return;
      }
      // Progress steps arrive one JSON line at a time, then the result or an error.
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '', settled = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as TrixStreamEvent;
          if (event.type === 'progress') update(entry => ({ steps: withStep(entry.steps, event.step) }));
          else if (event.type === 'result') { settled = true; finish(event.data); }
          else { settled = true; update({ failure: failureFor(res.status, event.code, event.message) }); }
        }
      }
      if (!settled) update({ failure: failureFor(0) });
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
            : <TrixProgressSteps steps={entry.steps ?? []} />}
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

function MarkdownView({ content }: { content: string }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function TrixAnswer({ entry, onRetry, disabled }: { entry: TrixEntry; onRetry: () => void; disabled: boolean }) {
  const result = entry.result!, response = result.response;
  const providerFailure = response.type === 'message' && ['PROVIDER_ERROR', 'PROVIDER_NOT_CONFIGURED', 'PROVIDER_LIMIT_REACHED'].includes(response.errorCode ?? '');
  return <>
    {result.answer && !providerFailure && <MarkdownView content={result.answer} />}
    {providerFailure ? <ConnectionFailure failure={{ title: response.type === 'message' && response.errorCode === 'PROVIDER_LIMIT_REACHED' ? 'TRIX reached the AI provider limit.' : "TRIX couldn't connect.", description: response.type === 'message' && response.errorCode === 'PROVIDER_LIMIT_REACHED' ? response.summary : 'The AI service is temporarily unavailable.', code: response.type === 'message' ? response.errorCode! : 'PROVIDER_ERROR' }} onRetry={onRetry} disabled={disabled} />
      : response.type === 'message' ? <MarkdownView content={response.summary} />
      : response.type === 'prepared_action' ? <PreparedActionCard key={response.action.preparationId} initial={response.action} />
      : <TrixResultCard response={response} />}
    <details className={styles.activity}><summary>Activity · {result.activity.length} {result.activity.length === 1 ? 'step' : 'steps'}</summary>
      <ol>{result.activity.map((step, index) => <li key={index}>
        <p className={styles.toolName}>{step.status === 'succeeded' ? '✓' : '—'} {step.toolName}</p>
        <p className={styles.muted}>{step.status === 'succeeded' ? 'Completed' : 'Failed'} · {step.durationMs} ms</p>
        <dl><div><dt>Looked up</dt><dd>{step.inputSummary}</dd></div><div><dt>Result</dt><dd>{step.resultSummary}</dd></div></dl>
      </li>)}</ol>
      {!result.activity.length && <p className={styles.muted}>No data tool was used.</p>}
    </details>
  </>;
}

const STEP_LABELS: Record<string, [string, string]> = {
  verifyAccess: ['Verifying Managing Director access', 'Verified Managing Director access'],
  checkRequest: ['Checking your request', 'Checked your request'],
  connectData: ['Connecting to Trionyx data', 'Connected to Trionyx data'],
  checkLimit: ['Checking the request limit', 'Within the request limit'],
  searchInventory: ['Searching inventory', 'Searched inventory'],
  searchDealers: ['Searching dealers', 'Searched dealers'],
  searchDistributors: ['Searching distributors', 'Searched distributors'],
  searchEnquiries: ['Searching enquiries', 'Searched enquiries'],
  searchWarranties: ['Searching warranties', 'Searched warranties'],
  changes: ['Reading recent changes', 'Read recent changes'],
  attention: ['Checking what needs attention', 'Checked what needs attention'],
  overview: ['Building the overview', 'Built the overview'],
  prepareChange: ['Preparing the change for your confirmation', 'Prepared the change for your confirmation'],
};
const GATE_STEPS = new Set(['verifyAccess', 'checkRequest', 'connectData', 'checkLimit']);
function TrixProgressSteps({ steps }: { steps: TrixProgress[] }) {
  const running = steps.some(step => step.status === 'started') || steps.some(step => step.status === 'failed');
  const gatesPassed = steps.some(step => step.toolName === 'checkLimit' && step.status === 'succeeded');
  const usedData = steps.some(step => !GATE_STEPS.has(step.toolName));
  return <ol className={styles.progress} role="status" aria-label="TRIX progress">
    {!steps.length && <li className={styles.progressActive}>Sending your request…</li>}
    {steps.map((step, index) => {
      const [active, done] = STEP_LABELS[step.toolName] ?? ['Checking Trionyx data', 'Checked Trionyx data'];
      return <li key={index} className={step.status === 'started' ? styles.progressActive : styles.progressDone}>
        {step.status === 'started' ? `${active}…` : step.status === 'failed' ? `— Couldn't finish: ${active.toLowerCase()}` : `✓ ${done}`}
      </li>;
    })}
    {gatesPassed && !running && <li className={styles.progressActive}>{usedData ? 'Writing the answer…' : 'Reading your question…'}</li>}
  </ol>;
}
