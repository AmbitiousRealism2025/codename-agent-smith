import type { ProviderAdapter, ModelInfo, ValidationResult, RequestConfig } from './types';

const ANTHROPIC_MODELS: ModelInfo[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    contextWindow: 200000,
    maxOutputTokens: 64000,
    supportsStreaming: true,
    pricing: { inputPer1M: 3.0, outputPer1M: 15.0 },
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    pricing: { inputPer1M: 3.0, outputPer1M: 15.0 },
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.8, outputPer1M: 4.0 },
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 15.0, outputPer1M: 75.0 },
  },
];

export const anthropicAdapter: ProviderAdapter = {
  id: 'anthropic',
  name: 'Anthropic',
  logo: '/providers/anthropic.svg',
  description: 'Direct access to Claude models via Anthropic API',
  supportedModels: ANTHROPIC_MODELS,
  defaultModel: 'claude-sonnet-4-20250514',
  authentication: 'apiKey',

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
    } else if (!apiKey.startsWith('sk-ant-')) {
      errors.push('Invalid API key format. Anthropic keys start with "sk-ant-"');
    } else if (apiKey.length < 40) {
      errors.push('API key appears too short');
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: 'https://api.anthropic.com/v1/messages',
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
