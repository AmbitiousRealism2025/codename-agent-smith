import type { ProviderAdapter, ModelInfo, ValidationResult, RequestConfig } from './types';

const MINIMAX_MODELS: ModelInfo[] = [
  {
    id: 'MiniMax-M2',
    name: 'MiniMax M2',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
  },
];

export const minimaxAdapter: ProviderAdapter = {
  id: 'minimax',
  name: 'MiniMax',
  logo: '/providers/minimax.svg',
  description: 'MiniMax AI models with Anthropic-compatible API',
  supportedModels: MINIMAX_MODELS,
  defaultModel: 'MiniMax-M2',
  authentication: 'jwt',

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push('JWT token is required');
    } else if (apiKey.split('.').length !== 3) {
      errors.push('Invalid JWT token format. Should have 3 parts separated by dots');
    } else if (apiKey.length < 100) {
      errors.push('JWT token appears too short');
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: 'https://api.minimax.io/anthropic/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
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
