import type { ProviderAdapter, ModelInfo, ValidationResult, RequestConfig } from './types';

const OPENROUTER_MODELS: ModelInfo[] = [
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4 (via OpenRouter)',
    contextWindow: 200000,
    maxOutputTokens: 64000,
    supportsStreaming: true,
    pricing: { inputPer1M: 3.0, outputPer1M: 15.0 },
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (via OpenRouter)',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    pricing: { inputPer1M: 3.0, outputPer1M: 15.0 },
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku (via OpenRouter)',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.8, outputPer1M: 4.0 },
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (via OpenRouter)',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsStreaming: true,
    pricing: { inputPer1M: 2.5, outputPer1M: 10.0 },
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash (via OpenRouter)',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.1, outputPer1M: 0.4 },
  },
];

export const openrouterAdapter: ProviderAdapter = {
  id: 'openrouter',
  name: 'OpenRouter',
  logo: '/providers/openrouter.svg',
  description: 'Access multiple AI providers through a unified API',
  supportedModels: OPENROUTER_MODELS,
  defaultModel: 'anthropic/claude-sonnet-4',
  authentication: 'bearer',

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
    } else if (!apiKey.startsWith('sk-or-')) {
      errors.push('Invalid API key format. OpenRouter keys start with "sk-or-"');
    } else if (apiKey.length < 40) {
      errors.push('API key appears too short');
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://agent-advisor.app',
        'X-Title': 'Agent Advisor',
      },
      body: {
        model,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      },
    };
  },
};
