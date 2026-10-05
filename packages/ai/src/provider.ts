import { createOpenAICompatible, type MetadataExtractor } from '@ai-sdk/openai-compatible';

export function extractOpenRouterCost(body:unknown) {
  const cost=body&&typeof body==='object'&&'usage' in body&&body.usage&&typeof body.usage==='object'&&'cost' in body.usage?body.usage.cost:null;
  return typeof cost==='number'&&Number.isFinite(cost)&&cost>=0?{trixUsage:{costCredits:cost}}:undefined;
}
const costExtractor:MetadataExtractor={extractMetadata:async({parsedBody})=>extractOpenRouterCost(parsedBody),createStreamExtractor:()=>{
  let metadata:ReturnType<typeof extractOpenRouterCost>;return {processChunk(chunk){metadata=extractOpenRouterCost(chunk)??metadata;},buildMetadata(){return metadata;}};
}};

/** Copy numeric usage only. Provider metadata and raw headers never leave this adapter. */
export function safeModelUsage(usage: {inputTokens?: number;outputTokens?: number},metadata:unknown[]=[]) {
  const count=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:null;
  const costs=metadata.flatMap(item=>{const value=item&&typeof item==='object'&&'trixUsage' in item&&item.trixUsage&&typeof item.trixUsage==='object'&&'costCredits' in item.trixUsage?item.trixUsage.costCredits:null;return typeof value==='number'&&Number.isFinite(value)&&value>=0?[value]:[];});
  return {inputTokens:count(usage.inputTokens),outputTokens:count(usage.outputTokens),estimatedCostUsd:null,providerCostCredits:costs.length?costs.reduce((a,b)=>a+b,0):null};
}

export function getModelMetadata(_purpose: 'trix') {
  if (_purpose !== 'trix') throw new Error('PROVIDER_NOT_CONFIGURED');
  const provider = process.env.TRIX_MODEL_PROVIDER || 'openrouter';
  if (provider !== 'openrouter') throw new Error('PROVIDER_NOT_CONFIGURED');
  const modelName = (process.env.TRIX_MODEL || 'anthropic/claude-sonnet-4.6').trim();
  if (!modelName || !/^[a-zA-Z0-9/_.:-]{1,150}$/.test(modelName)) throw new Error('PROVIDER_NOT_CONFIGURED');
  return { modelProvider: 'openrouter', modelName };
}

// The sole gateway adapter. Future Growx support belongs here, not in the agent/tools/UI.
export function getModel(purpose: 'trix') {
  const { modelName } = getModelMetadata(purpose);
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error('PROVIDER_NOT_CONFIGURED');
  return createOpenAICompatible({ name: 'openrouter', baseURL: 'https://openrouter.ai/api/v1', apiKey, metadataExtractor:costExtractor })(modelName);
}
