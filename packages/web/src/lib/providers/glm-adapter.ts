import type { ProviderAdapter, ModelInfo, ValidationResult, RequestConfig } from './types';

const GLM_MODELS: ModelInfo[] = [
  {
    id: 'glm-4-plus',
    name: 'GLM-4 Plus',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.7, outputPer1M: 0.7 },
  },
  {
    id: 'glm-4',
    name: 'GLM-4',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.14, outputPer1M: 0.14 },
  },
  {
    id: 'glm-4-air',
    name: 'GLM-4 Air',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.007, outputPer1M: 0.007 },
  },
  {
    id: 'glm-4-flash',
    name: 'GLM-4 Flash',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.001, outputPer1M: 0.001 },
  },
  {
    id: 'glm-4-long',
    name: 'GLM-4 Long',
    contextWindow: 1000000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.14, outputPer1M: 0.14 },
  },
];

export const glmAdapter: ProviderAdapter = {
  id: 'glm',
  name: 'Zhipu AI (GLM)',
  logo: '/providers/glm.svg',
  description: 'Access to GLM-4 models via Zhipu AI API',
  supportedModels: GLM_MODELS,
  defaultModel: 'glm-4',
  authentication: 'bearer',

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
    } else if (apiKey.length < 20) {
      errors.push('API key appears too short');
    } else if (!apiKey.includes('.')) {
      errors.push('Invalid API key format. Zhipu AI keys contain a period separator');
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
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
