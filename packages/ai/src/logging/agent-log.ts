import { randomUUID, createHash } from 'node:crypto';
import { agentLogsRepository, type AgentExecutionLog, type AgentToolEvent } from '@trionyx/database';

export type LogStore = Pick<typeof agentLogsRepository, 'create' | 'update'>;
export async function startAgentLog(context: { userId: string; sessionId: string; conversationId: string },
  model: { modelProvider: string; modelName: string }, store: LogStore = agentLogsRepository) {
  const log: AgentExecutionLog = {
    id: randomUUID(), userId: context.userId,
    sessionId: createHash('sha256').update(`${context.sessionId}:${context.conversationId}`).digest('hex'),
    conversationId: context.conversationId,
    ...model, timestamp: new Date().toISOString(), requestSummary: 'trix_read_request',
    toolEvents: [], responseType: 'pending', errorCode: null,
  };
  try { await store.create(log); } catch { throw new Error('TRIX_LOGGING_FAILED'); }
  let queue = Promise.resolve();
  function persist() {
    const snapshot = structuredClone(log);
    queue = queue.then(() => store.update(snapshot)).catch(() => { throw new Error('TRIX_LOGGING_FAILED'); });
    return queue;
  }
  return {
    id: log.id,
    async tool(event: AgentToolEvent) { log.toolEvents.push(event); await persist(); },
    async finish(responseType: AgentExecutionLog['responseType'], errorCode: string | null, metrics?: AgentExecutionLog['metrics']) {
      log.metrics = metrics;
      log.responseType = responseType; log.errorCode = errorCode; await persist();
    },
  };
}
