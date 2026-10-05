import type { Client } from '@libsql/client';
import { getDbClient } from '../db';

export type AgentToolEvent = {
  toolName: 'lookupSerial' | 'searchInventory' | 'getInventorySummary' | 'getRecentSerialMovements' | 'getInventoryExceptions' | 'unsupported' | string;
  toolStatus: 'started' | 'succeeded' | 'failed';
  toolDurationMs: number;
  resultSummary: 'started' | 'found' | 'not_found' | 'failed' | 'blocked' | string;
  inputSummary: 'serial_number_supplied' | 'invalid_input' | 'unsupported_input' | string;
  errorCode: string | null;
};
export type AgentExecutionLog = {
  metrics?: { requestDurationMs: number; modelDurationMs: number; inputTokens: number | null; outputTokens: number | null; estimatedCostUsd: number | null; providerCostCredits?:number|null };
  id: string;
  sessionId: string;
  conversationId?: string;
  userId: string;
  modelProvider: string;
  modelName: string;
  timestamp: string;
  requestSummary: string;
  toolEvents: AgentToolEvent[];
  responseType: 'pending' | 'serial_record' | 'inventory_list' | 'inventory_summary' | 'serial_movements' | 'inventory_exceptions' | 'message' | 'dealer_list' | 'dealer_detail' | 'distributor_list' | 'distributor_detail' | 'dealer_network_summary' | 'dealer_assignment_history' | 'dealer_network_exceptions' | 'enquiry_list' | 'enquiry_detail' | 'enquiry_summary' | 'enquiry_attention' | 'enquiry_changes' | 'warranty_record' | 'warranty_list' | 'warranty_summary' | 'warranty_exceptions' | 'executive_overview' | 'operational_changes' | 'prepared_action';
  errorCode: string | null;
};

export const agentLogsRepository = {
  async create(log: AgentExecutionLog, client: Client = getDbClient()) {
    await client.execute({
      sql: `INSERT INTO agent_execution_logs (id, session_id, conversation_id, user_id, agent_name, model_provider, model_name, timestamp, request_summary, tool_events, response_type, error_code, error_summary, metrics)
            VALUES (?, ?, ?, ?, 'TRIX', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [log.id, log.sessionId, log.conversationId ?? null, log.userId, log.modelProvider, log.modelName, log.timestamp, log.requestSummary,
        JSON.stringify(log.toolEvents), log.responseType, log.errorCode, log.errorCode ? 'Execution could not complete' : null, log.metrics ? JSON.stringify(log.metrics) : null],
    });
  },
  async update(log: AgentExecutionLog, client: Client = getDbClient()) {
    await client.execute({
      sql: 'UPDATE agent_execution_logs SET tool_events = ?, response_type = ?, error_code = ?, error_summary = ?, metrics = ? WHERE id = ? AND user_id = ?',
      args: [JSON.stringify(log.toolEvents), log.responseType, log.errorCode, log.errorCode ? 'Execution could not complete' : null, log.metrics ? JSON.stringify(log.metrics) : null, log.id, log.userId],
    });
  },
};
