import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export function getModelMetadata(_purpose: 'trix') {
  if (_purpose !== 'trix') throw new Error('PROVIDER_NOT_CONFIGURED');
  const provider = process.env.TRIX_MODEL_PROVIDER || 'openrouter';
  if (provider !== 'openrouter') throw new Error('PROVIDER_NOT_CONFIGURED');
  const modelName = (process.env.TRIX_MODEL || 'openrouter/free').trim();
  if (!modelName || !/^[a-zA-Z0-9/_.:-]{1,150}$/.test(modelName)) throw new Error('PROVIDER_NOT_CONFIGURED');
  return { modelProvider: 'openrouter', modelName };
}

// The sole gateway adapter. Future Growx support belongs here, not in the agent/tools/UI.
export function getModel(purpose: 'trix') {
  const { modelName } = getModelMetadata(purpose);
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error('PROVIDER_NOT_CONFIGURED');
  return createOpenAICompatible({ name: 'openrouter', baseURL: 'https://openrouter.ai/api/v1', apiKey })(modelName);
}
