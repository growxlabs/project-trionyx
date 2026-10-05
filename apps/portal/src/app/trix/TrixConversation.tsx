'use client';
import { PreparedActionCard } from './PreparedActionCard';
import { TrixResultCard } from './TrixResultCards';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Add, Restart } from '@carbon/icons-react';
import { responseSchema, type TrixExecution, type TrixProgress, type TrixStreamEvent } from '@trionyx/ai/responses';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
  MessageCopyAction,
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  Shimmer,
} from '@/components/ai-elements';
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
  const input = useRef<HTMLTextAreaElement>(null);
  function suggest(query: string) { onMessageChange(query); input.current?.focus(); }
  return <section className={styles.workspace} aria-label="TRIX workspace"><div className={styles.frame}>
    <header className={styles.header}>
      <div><h1>TRIX</h1><p>Ask across Trionyx</p></div>
      <button type="button" className={styles.newConversation} onClick={() => { onNewConversation(); input.current?.focus(); }} aria-label="New conversation">
        <span>New conversation</span><Add size={20} className={styles.mobileAdd} />
      </button>
    </header>
    <Conversation className={styles.conversation} aria-busy={busy}>
      <ConversationContent className={styles.entries}>
        {!entries.length ? (
          <ConversationEmptyState
            title="What do you want to know?"
            description="Search, analyse and navigate Trionyx operations."
            suggestions={[
              { label: 'Find a serial', prompt: 'Where is serial ', onClick: () => suggest('Where is serial ') },
              { label: 'Check inventory', prompt: 'Check inventory availability.', onClick: () => suggest('Check inventory availability.') },
              { label: 'Review enquiries', prompt: 'Review enquiries.', onClick: () => suggest('Review enquiries.') },
            ]}
          />
        ) : (
          entries.map(entry => (
            <article key={entry.id} className={styles.entry}>
              <Message from="user">
                <p className={styles.speaker}>You</p>
                <MessageContent>
                  <p className="whitespace-pre-wrap break-words">{entry.question}</p>
                </MessageContent>
              </Message>

              <Message from="assistant" className="mt-4">
                <p className={styles.speaker}>TRIX</p>
                <MessageContent>
                  {entry.failure ? (
                    <ConnectionFailure failure={entry.failure} onRetry={() => onRetry(entry)} disabled={busy} />
                  ) : entry.result ? (
                    <TrixAnswer entry={entry} onRetry={() => onRetry(entry)} disabled={busy} />
                  ) : (
                    <TrixThinking />
                  )}
                </MessageContent>
              </Message>
            </article>
          ))
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
    <footer className={styles.footer}>
      <PromptInput
        onSubmit={({ text }) => {
          if (!busy && text.trim()) onSend();
        }}
      >
        <PromptInputTextarea
          ref={input}
          aria-label="Message TRIX"
          placeholder="Ask TRIX anything about Trionyx..."
          value={message}
          onChange={event => onMessageChange(event.target.value)}
          maxLength={2000}
          disabled={busy}
        />
        <PromptInputSubmit
          status={busy ? 'streaming' : 'ready'}
          disabled={busy || !message.trim()}
        />
      </PromptInput>
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
  const messageText = result.answer || (response.type === 'message' ? response.summary : null);

  return (
    <>
      {messageText && !providerFailure && (
        <MessageResponse isAnimating={false}>
          {messageText}
        </MessageResponse>
      )}

      {providerFailure ? (
        <ConnectionFailure
          failure={{
            title: response.type === 'message' && response.errorCode === 'PROVIDER_LIMIT_REACHED'
              ? 'TRIX reached the AI provider limit.'
              : "TRIX couldn't connect.",
            description: response.type === 'message' && response.errorCode === 'PROVIDER_LIMIT_REACHED'
              ? response.summary
              : 'The AI service is temporarily unavailable.',
            code: response.type === 'message' ? response.errorCode! : 'PROVIDER_ERROR',
          }}
          onRetry={onRetry}
          disabled={disabled}
        />
      ) : response.type === 'message' ? null : response.type === 'prepared_action' ? (
        <PreparedActionCard key={response.action.preparationId} initial={response.action} />
      ) : (
        <TrixResultCard response={response} />
      )}

      {messageText && !providerFailure && (
        <MessageActions>
          <MessageCopyAction content={messageText} />
          <MessageAction label="Retry" onClick={onRetry} disabled={disabled}>
            <Restart size={14} />
          </MessageAction>
        </MessageActions>
      )}

      <details className={styles.activity}>
        <summary>Activity · {result.activity.length} {result.activity.length === 1 ? 'step' : 'steps'}</summary>
        <ol>
          {result.activity.map((step, index) => (
            <li key={index}>
              <p className={styles.toolName}>{step.status === 'succeeded' ? '✓' : '—'} {step.toolName}</p>
              <p className={styles.muted}>{step.status === 'succeeded' ? 'Completed' : 'Failed'} · {step.durationMs} ms</p>
              <dl>
                <div><dt>Looked up</dt><dd>{step.inputSummary}</dd></div>
                <div><dt>Result</dt><dd>{step.resultSummary}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
        {!result.activity.length && <p className={styles.muted}>No data tool was used.</p>}
      </details>
    </>
  );
}

function TrixThinking() {
  return (
    <Shimmer className={styles.working}>
      Thinking…
    </Shimmer>
  );
}
