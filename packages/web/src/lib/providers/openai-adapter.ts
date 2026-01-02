import type { ProviderAdapter, ModelInfo, ValidationResult, RequestConfig } from './types';

const OPENAI_MODELS: ModelInfo[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsStreaming: true,
    pricing: { inputPer1M: 2.5, outputPer1M: 10.0 },
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.15, outputPer1M: 0.6 },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 10.0, outputPer1M: 30.0 },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.5, outputPer1M: 1.5 },
  },
  {
    id: 'o1-preview',
    name: 'o1 Preview',
    contextWindow: 128000,
    maxOutputTokens: 32768,
    supportsStreaming: true,
    pricing: { inputPer1M: 15.0, outputPer1M: 60.0 },
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    contextWindow: 128000,
    maxOutputTokens: 65536,
    supportsStreaming: true,
    pricing: { inputPer1M: 3.0, outputPer1M: 12.0 },
  },
];

export const openaiAdapter: ProviderAdapter = {
  id: 'openai',
  name: 'OpenAI',
  logo: '/providers/openai.svg',
  description: 'Access to GPT-4, GPT-4o, and o1 models via OpenAI API',
  supportedModels: OPENAI_MODELS,
  defaultModel: 'gpt-4o',
  authentication: 'bearer',

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
    } else if (!apiKey.startsWith('sk-')) {
      errors.push('Invalid API key format. OpenAI keys start with "sk-"');
    } else if (apiKey.length < 40) {
      errors.push('API key appears too short');
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: {
        model,
        max_tokens: 4096,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      },
    };
  },
};
