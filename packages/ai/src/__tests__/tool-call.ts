/** Maps the former 25 tool names onto the 9 current tools so fixtures can keep describing intent by the old names. */
type Input = Record<string, unknown>;
const same = (tool: string): [string, (i: Input) => Input] => [tool, i => i];
const MAP: Record<string, [string, (i: Input) => Input]> = {
  lookupSerial: ['searchInventory', ({ serialNumber, ...rest }) => ({ ...rest, query: serialNumber })],
  searchInventory: same('searchInventory'), getInventorySummary: same('searchInventory'),
  getRecentSerialMovements: ['changes', ({ fromDate, toDate }) => ({ module: 'inventory', from: fromDate, to: toDate })],
  getInventoryExceptions: ['attention', () => ({ module: 'inventory' })],
  searchDealers: same('searchDealers'),
  getDealerDetails: ['searchDealers', ({ dealerName, ...rest }) => ({ ...rest, ...(dealerName ? { query: dealerName } : {}) })],
  searchDistributors: same('searchDistributors'),
  getDistributorDetails: ['searchDistributors', ({ distributorName, ...rest }) => ({ ...rest, ...(distributorName ? { query: distributorName } : {}) })],
  getDealerNetworkSummary: ['searchDealers', ({ dealerStatus, ...rest }) => ({ ...rest, ...(dealerStatus ? { status: dealerStatus } : {}) })],
  getDealerAssignmentHistory: ['changes', ({ dealerId, distributorId, ...rest }) => ({ ...rest, module: dealerId || !distributorId ? 'dealers' : 'distributors', recordId: dealerId ?? distributorId })],
  getDealerNetworkExceptions: ['attention', ({ type, ...rest }) => ({ ...rest, module: 'dealers', rule: type })],
  searchEnquiries: same('searchEnquiries'), getEnquiryDetails: same('searchEnquiries'), getEnquirySummary: same('searchEnquiries'),
  getEnquiryAttention: ['attention', i => ({ ...i, module: 'enquiries' })],
  getRecentEnquiryChanges: ['changes', ({ enquiryId, changeType: _changeType, ...rest }) => ({ ...rest, module: 'enquiries', recordId: enquiryId })],
  getWarrantyBySerial: same('searchWarranties'), searchWarranties: same('searchWarranties'), getWarrantySummary: same('searchWarranties'),
  getWarrantyExceptions: ['attention', i => ({ ...i, module: 'warranties' })],
  getExecutiveOverview: same('overview'), getRecentOperationalChanges: same('changes'),
  prepareDealerDistributorAssignment: ['prepareChange', params => ({ kind: 'dealer_distributor', params })],
  prepareEnquiryAssignment: ['prepareChange', params => ({ kind: 'enquiry_owner', params })],
  prepareEnquiryStatusChange: ['prepareChange', params => ({ kind: 'enquiry_status', params })],
  prepareInventoryTransfer: ['prepareChange', params => ({ kind: 'inventory_transfer', params })],
};
/** Current tool name for a former tool name. */
export const activityName = (name: string) => MAP[name]?.[0] ?? name;
export function toolCallPart(toolCallId: string, name: string, input: unknown) {
  const mapped = MAP[name];
  if (!mapped) return { type: 'tool-call' as const, toolCallId, toolName: name, input: typeof input === 'string' ? input : JSON.stringify(input) };
  let parsed = input;
  if (typeof input === 'string') { try { parsed = JSON.parse(input); } catch { return { type: 'tool-call' as const, toolCallId, toolName: mapped[0], input }; } }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { type: 'tool-call' as const, toolCallId, toolName: mapped[0], input: JSON.stringify(parsed) };
  const reshaped = Object.fromEntries(Object.entries(mapped[1](parsed as Input)).filter(([, value]) => value !== undefined));
  return { type: 'tool-call' as const, toolCallId, toolName: mapped[0], input: JSON.stringify(reshaped) };
}

import { MockLanguageModelV3 } from 'ai/test';
export const textResult = { content: [{ type: 'text' as const, text: 'Done.' }], finishReason: { unified: 'stop' as const, raw: undefined },
  usage: { inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 1, text: 1, reasoning: undefined } }, warnings: [] };
/** Like the stock mock, but a repeated request for tool calls after the first step gets a final text answer instead, so the agent loop ends. */
export class ChainMockModel extends MockLanguageModelV3 {
  constructor(options: ConstructorParameters<typeof MockLanguageModelV3>[0]) {
    super(options);
    const original = this.doGenerate.bind(this);
    let steps = 0;
    this.doGenerate = (async (o: Parameters<typeof original>[0]) => {
      const result = await original(o);
      return steps++ > 0 && result.content.some(part => part.type === 'tool-call') ? textResult : result;
    }) as typeof original;
  }
}
