export type ProviderId = 'anthropic' | 'openrouter' | 'minimax' | 'openai' | 'glm';

export type AuthenticationType = 'apiKey' | 'jwt' | 'bearer';

export interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  pricing?: {
    inputPer1M: number;
    outputPer1M: number;
  };
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  authentication: AuthenticationType;
  headers?: Record<string, string>;
  rateLimit?: { requestsPerMinute: number };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface StreamingEvent {
  type: 'text' | 'tool_use' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolInput?: unknown;
  error?: string;
}

export interface ProviderAdapter {
  id: ProviderId;
  name: string;
  logo: string;
  description: string;
  supportedModels: ModelInfo[];
  defaultModel: string;
  authentication: AuthenticationType;
  
  validateApiKey(apiKey: string): ValidationResult;
  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig;
}

export interface RequestConfig {
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  body: unknown;
}
