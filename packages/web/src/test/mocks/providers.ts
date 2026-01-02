/**
 * Mock provider adapters for testing
 *
 * Provides mock implementations of ProviderAdapter for isolated testing
 * of classification, document generation, and provider-related functionality.
 */

import { vi } from "vitest";
import type {
  ProviderAdapter,
  ProviderId,
  ModelInfo,
  ValidationResult,
  RequestConfig,
} from "@/lib/providers/types";

/**
 * Mock model definitions for testing
 */
export const MOCK_MODELS: ModelInfo[] = [
  {
    id: "mock-model-standard",
    name: "Mock Standard Model",
    contextWindow: 100000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    pricing: { inputPer1M: 1.0, outputPer1M: 5.0 },
  },
  {
    id: "mock-model-large",
    name: "Mock Large Model",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    pricing: { inputPer1M: 3.0, outputPer1M: 15.0 },
  },
  {
    id: "mock-model-fast",
    name: "Mock Fast Model",
    contextWindow: 50000,
    maxOutputTokens: 2048,
    supportsStreaming: true,
    pricing: { inputPer1M: 0.5, outputPer1M: 2.0 },
  },
];

/**
 * Valid mock API keys for testing
 * Use these keys to simulate successful validation
 */
export const MOCK_API_KEYS = {
  anthropic: "sk-ant-mock-test-key-1234567890abcdef",
  openrouter: "sk-or-mock-test-key-1234567890abcdef",
  minimax: "mock-minimax-key-1234567890abcdef123",
} as const;

/**
 * Invalid mock API keys for testing validation errors
 */
export const INVALID_MOCK_API_KEYS = {
  empty: "",
  tooShort: "sk-ant-short",
  wrongPrefix: "invalid-key-1234567890abcdef",
  malformed: "not-a-valid-key",
} as const;

/**
 * Creates a mock ProviderAdapter with customizable behavior
 *
 * @param overrides - Partial adapter properties to override defaults
 * @returns A mock ProviderAdapter for testing
 *
 * @example
 * ```ts
 * const mockProvider = createMockProvider({
 *   id: 'anthropic',
 *   validateApiKey: () => ({ valid: true, errors: [] }),
 * });
 * ```
 */
export function createMockProvider(
  overrides: Partial<ProviderAdapter> = {}
): ProviderAdapter {
  const defaultAdapter: ProviderAdapter = {
    id: "anthropic" as ProviderId,
    name: "Mock Provider",
    logo: "/providers/mock.svg",
    description: "Mock provider for testing purposes",
    supportedModels: MOCK_MODELS,
    defaultModel: "mock-model-standard",
    authentication: "apiKey",

    validateApiKey(apiKey: string): ValidationResult {
      const errors: string[] = [];

      if (!apiKey) {
        errors.push("API key is required");
      } else if (apiKey.length < 20) {
        errors.push("API key appears too short");
      }

      return { valid: errors.length === 0, errors };
    },

    buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
      return {
        url: "https://mock-api.test/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: {
          model,
          max_tokens: 4096,
          stream: true,
          messages: [{ role: "user", content: prompt }],
        },
      };
    },
  };

  return { ...defaultAdapter, ...overrides };
}

/**
 * Mock Anthropic adapter for testing
 * Simulates Anthropic API key validation and request building
 */
export const mockAnthropicAdapter: ProviderAdapter = createMockProvider({
  id: "anthropic",
  name: "Mock Anthropic",
  logo: "/providers/anthropic.svg",
  description: "Mock Anthropic adapter for testing",
  defaultModel: "claude-sonnet-4-20250514",
  authentication: "apiKey",

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push("API key is required");
    } else if (!apiKey.startsWith("sk-ant-")) {
      errors.push('Invalid API key format. Anthropic keys start with "sk-ant-"');
    } else if (apiKey.length < 40) {
      errors.push("API key appears too short");
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: "https://api.anthropic.com/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model,
        max_tokens: 4096,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      },
    };
  },
});

/**
 * Mock OpenRouter adapter for testing
 * Simulates OpenRouter API key validation and request building
 */
export const mockOpenrouterAdapter: ProviderAdapter = createMockProvider({
  id: "openrouter",
  name: "Mock OpenRouter",
  logo: "/providers/openrouter.svg",
  description: "Mock OpenRouter adapter for testing",
  defaultModel: "anthropic/claude-sonnet-4",
  authentication: "bearer",

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push("API key is required");
    } else if (!apiKey.startsWith("sk-or-")) {
      errors.push('Invalid API key format. OpenRouter keys start with "sk-or-"');
    } else if (apiKey.length < 40) {
      errors.push("API key appears too short");
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://agent-advisor.app",
        "X-Title": "Agent Advisor",
      },
      body: {
        model,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      },
    };
  },
});

/**
 * Mock MiniMax adapter for testing
 * Simulates MiniMax API key validation and request building
 */
export const mockMinimaxAdapter: ProviderAdapter = createMockProvider({
  id: "minimax",
  name: "Mock MiniMax",
  logo: "/providers/minimax.svg",
  description: "Mock MiniMax adapter for testing",
  defaultModel: "abab6.5s-chat",
  authentication: "apiKey",

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push("API key is required");
    } else if (apiKey.length < 30) {
      errors.push("API key appears too short");
    }

    return { valid: errors.length === 0, errors };
  },

  buildRequestConfig(prompt: string, model: string, apiKey: string): RequestConfig {
    return {
      url: "https://api.minimax.chat/v1/text/chatcompletion_v2",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: {
        model,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      },
    };
  },
});

/**
 * Mock provider registry for testing
 * Maps provider IDs to mock adapters
 */
export const MOCK_PROVIDER_REGISTRY: Record<ProviderId, ProviderAdapter> = {
  anthropic: mockAnthropicAdapter,
  openrouter: mockOpenrouterAdapter,
  minimax: mockMinimaxAdapter,
};

/**
 * Gets a mock provider by ID
 *
 * @param id - The provider ID
 * @returns The mock provider adapter
 * @throws Error if provider ID is not found
 *
 * @example
 * ```ts
 * const provider = getMockProvider('anthropic');
 * const result = provider.validateApiKey('sk-ant-test-key');
 * ```
 */
export function getMockProvider(id: ProviderId): ProviderAdapter {
  const provider = MOCK_PROVIDER_REGISTRY[id];
  if (!provider) {
    throw new Error(`Unknown mock provider: ${id}`);
  }
  return provider;
}

/**
 * Gets all mock providers as an array
 *
 * @returns Array of all mock provider adapters
 */
export function getAllMockProviders(): ProviderAdapter[] {
  return Object.values(MOCK_PROVIDER_REGISTRY);
}

/**
 * Gets all mock provider IDs
 *
 * @returns Array of mock provider IDs
 */
export function getMockProviderIds(): ProviderId[] {
  return Object.keys(MOCK_PROVIDER_REGISTRY) as ProviderId[];
}

/**
 * Creates a spy-able mock provider for verifying method calls
 *
 * @param baseAdapter - The base adapter to wrap with spies
 * @returns Object containing the adapter and spy functions
 *
 * @example
 * ```ts
 * const { adapter, spies } = createSpyProvider(mockAnthropicAdapter);
 * adapter.validateApiKey('test-key');
 * expect(spies.validateApiKey).toHaveBeenCalledWith('test-key');
 * ```
 */
export function createSpyProvider(baseAdapter: ProviderAdapter = mockAnthropicAdapter) {
  const validateApiKeySpy = vi.fn(baseAdapter.validateApiKey.bind(baseAdapter));
  const buildRequestConfigSpy = vi.fn(baseAdapter.buildRequestConfig.bind(baseAdapter));

  const adapter: ProviderAdapter = {
    ...baseAdapter,
    validateApiKey: validateApiKeySpy,
    buildRequestConfig: buildRequestConfigSpy,
  };

  return {
    adapter,
    spies: {
      validateApiKey: validateApiKeySpy,
      buildRequestConfig: buildRequestConfigSpy,
    },
    reset() {
      validateApiKeySpy.mockClear();
      buildRequestConfigSpy.mockClear();
    },
  };
}

/**
 * Creates a mock validation result
 *
 * @param valid - Whether the validation passed
 * @param errors - Array of error messages
 * @returns A ValidationResult object
 */
export function createMockValidationResult(
  valid: boolean,
  errors: string[] = []
): ValidationResult {
  return { valid, errors };
}

/**
 * Mock provider that always validates successfully
 */
export const alwaysValidProvider: ProviderAdapter = createMockProvider({
  validateApiKey: () => ({ valid: true, errors: [] }),
});

/**
 * Mock provider that always fails validation
 */
export const alwaysInvalidProvider: ProviderAdapter = createMockProvider({
  validateApiKey: () => ({ valid: false, errors: ["Mock validation error"] }),
});
