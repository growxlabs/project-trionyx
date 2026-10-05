'use client';
import { PreparedActionCard } from './PreparedActionCard';
import { TrixResultCard } from './TrixResultCards';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Add, Close, Restart, Time, TrashCan } from '@carbon/icons-react';
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
export type StoredTrixConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0 || isNaN(diffMs)) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<StoredTrixConversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const conversationId = useRef<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);

  useEffect(() => () => controller.current?.abort(), []);

  useEffect(() => {
    if (!historyOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setHistoryOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyOpen]);

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/v1/internal/trix/conversations');
      if (res.ok) {
        const body = await res.json();
        setConversations(body?.data?.conversations ?? []);
      }
    } catch {
      // Ignore network errors on listing
    } finally {
      setLoadingHistory(false);
    }
  }

  function toggleHistory() {
    if (!historyOpen) {
      setHistoryOpen(true);
      void fetchHistory();
    } else {
      setHistoryOpen(false);
    }
  }

  function newConversation() {
    generation.current++;
    controller.current?.abort();
    conversationId.current = null;
    setActiveConversationId(null);
    setEntries([]);
    setMessage('');
    setBusy(false);
    setHistoryOpen(false);
  }

  async function selectConversation(id: string) {
    if (id === activeConversationId && entries.length > 0) {
      setHistoryOpen(false);
      return;
    }
    generation.current++;
    controller.current?.abort();
    const currentGeneration = generation.current;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/internal/trix/conversations/${encodeURIComponent(id)}`);
      if (res.ok) {
        const body = await res.json();
        const conv = body?.data?.conversation;
        if (conv && generation.current === currentGeneration) {
          conversationId.current = conv.id;
          setActiveConversationId(conv.id);
          setEntries(conv.entries ?? []);
          setMessage('');
          setHistoryOpen(false);
        }
      }
    } catch {
      // Network error handled gracefully
    } finally {
      if (generation.current === currentGeneration) {
        setBusy(false);
      }
    }
  }

  async function deleteConversation(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    try {
      const res = await fetch(`/api/v1/internal/trix/conversations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (conversationId.current === id) {
          newConversation();
        }
      }
    } catch {
      // Deletion error handled gracefully
    }
  }

  async function send(question: string, retryId?: string) {
    if (busy || !question.trim()) return;
    const id = retryId ?? crypto.randomUUID(), currentGeneration = generation.current;
    if (!conversationId.current) {
      const newId = crypto.randomUUID();
      conversationId.current = newId;
      setActiveConversationId(newId);
    }
    controller.current = new AbortController();
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
  return (
    <TrixWorkspace
      message={message}
      onMessageChange={setMessage}
      entries={entries}
      busy={busy}
      onSend={() => void send(message.trim())}
      onRetry={entry => void send(entry.question, entry.id)}
      onNewConversation={newConversation}
      historyOpen={historyOpen}
      conversations={conversations}
      loadingHistory={loadingHistory}
      activeConversationId={activeConversationId}
      onToggleHistory={toggleHistory}
      onCloseHistory={() => setHistoryOpen(false)}
      onSelectConversation={selectConversation}
      onDeleteConversation={deleteConversation}
    />
  );
}

type WorkspaceProps = {
  message: string;
  onMessageChange: (value: string) => void;
  entries: TrixEntry[];
  busy: boolean;
  onSend: () => void;
  onRetry: (entry: TrixEntry) => void;
  onNewConversation: () => void;
  historyOpen: boolean;
  conversations: StoredTrixConversation[];
  loadingHistory: boolean;
  activeConversationId: string | null;
  onToggleHistory: () => void;
  onCloseHistory: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
};
export function TrixWorkspace({
  message,
  onMessageChange,
  entries,
  busy,
  onSend,
  onRetry,
  onNewConversation,
  historyOpen,
  conversations,
  loadingHistory,
  activeConversationId,
  onToggleHistory,
  onCloseHistory,
  onSelectConversation,
  onDeleteConversation,
}: WorkspaceProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  function suggest(query: string) { onMessageChange(query); input.current?.focus(); }
  return <section className={styles.workspace} aria-label="TRIX workspace"><div className={styles.frame}>
    <header className={styles.header}>
      <div><h1>TRIX</h1><p>Ask across Trionyx</p></div>
      <div className={styles.headerActions}>
        <button
          type="button"
          className={`${styles.historyButton} ${historyOpen ? styles.historyButtonActive : ''}`}
          onClick={onToggleHistory}
          aria-label="Conversation history"
          title="Conversation history"
        >
          <Time size={18} />
          <span>History</span>
        </button>
        <button
          type="button"
          className={styles.newConversation}
          onClick={() => { onNewConversation(); input.current?.focus(); }}
          aria-label="New conversation"
          title="New conversation"
        >
          <span>New conversation</span>
          <Add size={20} className={styles.mobileAdd} />
        </button>
      </div>
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
  </div>
  {historyOpen && (
    <div className={styles.historyBackdrop} onClick={onCloseHistory}>
      <aside
        className={styles.historyDrawer}
        onClick={event => event.stopPropagation()}
        aria-label="Conversation history"
      >
        <div className={styles.historyDrawerHeader}>
          <div className={styles.historyHeaderTitle}>
            <Time size={18} />
            <h2>Past Conversations</h2>
            {conversations.length > 0 && (
              <span className={styles.historyCount}>{conversations.length}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.historyCloseButton}
            onClick={onCloseHistory}
            aria-label="Close history"
            title="Close history"
          >
            <Close size={18} />
          </button>
        </div>

        <div className={styles.historyContent}>
          {loadingHistory ? (
            <div className={styles.historyLoading}>
              <Shimmer className={styles.historyShimmer}>Loading history…</Shimmer>
            </div>
          ) : conversations.length === 0 ? (
            <div className={styles.historyEmpty}>
              <Time size={32} className={styles.historyEmptyIcon} />
              <p className={styles.historyEmptyTitle}>No history yet</p>
              <p className={styles.historyEmptyText}>
                Your conversations with TRIX will appear here so you can review or resume them anytime.
              </p>
            </div>
          ) : (
            <ul className={styles.historyList}>
              {conversations.map(conv => (
                <li
                  key={conv.id}
                  className={`${styles.historyItem} ${conv.id === activeConversationId ? styles.historyItemActive : ''}`}
                  onClick={() => onSelectConversation(conv.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectConversation(conv.id);
                    }
                  }}
                >
                  <div className={styles.historyItemInfo}>
                    <span className={styles.historyItemTitle} title={conv.title}>
                      {conv.title}
                    </span>
                    <span className={styles.historyItemMeta}>
                      {formatRelativeTime(conv.updatedAt)}
                      {conv.messageCount ? ` · ${conv.messageCount} ${conv.messageCount === 1 ? 'message' : 'messages'}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.historyDeleteButton}
                    onClick={event => onDeleteConversation(conv.id, event)}
                    aria-label={`Delete conversation ${conv.title}`}
                    title="Delete conversation"
                  >
                    <TrashCan size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )}
</section>;
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
              : response.type === 'message' && response.errorCode === 'PROVIDER_NOT_CONFIGURED'
              ? 'AI provider not configured.'
              : "TRIX couldn't connect.",
            description: response.type === 'message' && (response.errorCode === 'PROVIDER_LIMIT_REACHED' || response.errorCode === 'PROVIDER_NOT_CONFIGURED')
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
