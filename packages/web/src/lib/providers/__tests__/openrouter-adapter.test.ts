import { describe, it, expect } from 'vitest';
import { openrouterAdapter } from '../openrouter-adapter';

describe('openrouterAdapter', () => {
  describe('adapter properties', () => {
    it('should have correct id', () => {
      expect(openrouterAdapter.id).toBe('openrouter');
    });

    it('should have correct name', () => {
      expect(openrouterAdapter.name).toBe('OpenRouter');
    });

    it('should have a logo path', () => {
      expect(openrouterAdapter.logo).toBe('/providers/openrouter.svg');
    });

    it('should have a description', () => {
      expect(openrouterAdapter.description).toBe('Access multiple AI providers through a unified API');
    });

    it('should have bearer authentication type', () => {
      expect(openrouterAdapter.authentication).toBe('bearer');
    });

    it('should have supported models', () => {
      expect(openrouterAdapter.supportedModels).toBeDefined();
      expect(openrouterAdapter.supportedModels.length).toBeGreaterThan(0);
    });

    it('should have a default model', () => {
      expect(openrouterAdapter.defaultModel).toBe('anthropic/claude-sonnet-4');
    });

    it('should have default model in supported models list', () => {
      const modelIds = openrouterAdapter.supportedModels.map((m) => m.id);
      expect(modelIds).toContain(openrouterAdapter.defaultModel);
    });
  });

  describe('supported models - multi-provider', () => {
    describe('Anthropic models', () => {
      it('should include Claude Sonnet 4', () => {
        const model = openrouterAdapter.supportedModels.find((m) => m.id === 'anthropic/claude-sonnet-4');
        expect(model).toBeDefined();
        expect(model?.name).toBe('Claude Sonnet 4 (via OpenRouter)');
        expect(model?.contextWindow).toBe(200000);
        expect(model?.maxOutputTokens).toBe(64000);
        expect(model?.supportsStreaming).toBe(true);
      });

      it('should include Claude 3.5 Sonnet', () => {
        const model = openrouterAdapter.supportedModels.find((m) => m.id === 'anthropic/claude-3.5-sonnet');
        expect(model).toBeDefined();
        expect(model?.name).toBe('Claude 3.5 Sonnet (via OpenRouter)');
        expect(model?.contextWindow).toBe(200000);
        expect(model?.maxOutputTokens).toBe(8192);
      });

      it('should include Claude 3.5 Haiku', () => {
        const model = openrouterAdapter.supportedModels.find((m) => m.id === 'anthropic/claude-3.5-haiku');
        expect(model).toBeDefined();
        expect(model?.name).toBe('Claude 3.5 Haiku (via OpenRouter)');
      });
    });

    describe('OpenAI models', () => {
      it('should include GPT-4o', () => {
        const model = openrouterAdapter.supportedModels.find((m) => m.id === 'openai/gpt-4o');
        expect(model).toBeDefined();
        expect(model?.name).toBe('GPT-4o (via OpenRouter)');
        expect(model?.contextWindow).toBe(128000);
        expect(model?.maxOutputTokens).toBe(16384);
        expect(model?.supportsStreaming).toBe(true);
      });
    });

    describe('Google models', () => {
      it('should include Gemini 2.0 Flash', () => {
        const model = openrouterAdapter.supportedModels.find((m) => m.id === 'google/gemini-2.0-flash-001');
        expect(model).toBeDefined();
        expect(model?.name).toBe('Gemini 2.0 Flash (via OpenRouter)');
        expect(model?.contextWindow).toBe(1000000);
        expect(model?.maxOutputTokens).toBe(8192);
        expect(model?.supportsStreaming).toBe(true);
      });
    });

    it('should have pricing information for all models', () => {
      openrouterAdapter.supportedModels.forEach((model) => {
        expect(model.pricing).toBeDefined();
        expect(model.pricing?.inputPer1M).toBeGreaterThan(0);
        expect(model.pricing?.outputPer1M).toBeGreaterThan(0);
      });
    });

    it('should support streaming for all models', () => {
      openrouterAdapter.supportedModels.forEach((model) => {
        expect(model.supportsStreaming).toBe(true);
      });
    });

    it('should include models from multiple providers', () => {
      const modelIds = openrouterAdapter.supportedModels.map((m) => m.id);
      const hasAnthropic = modelIds.some((id) => id.startsWith('anthropic/'));
      const hasOpenAI = modelIds.some((id) => id.startsWith('openai/'));
      const hasGoogle = modelIds.some((id) => id.startsWith('google/'));

      expect(hasAnthropic).toBe(true);
      expect(hasOpenAI).toBe(true);
      expect(hasGoogle).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should invalidate empty API key', () => {
      const result = openrouterAdapter.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key is required');
    });

    it('should invalidate API key that does not start with sk-or-', () => {
      const result = openrouterAdapter.validateApiKey('sk-1234567890abcdefghijklmnopqrstuvwxyz123456');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid API key format. OpenRouter keys start with "sk-or-"');
    });

    it('should invalidate API key with wrong prefix', () => {
      const result = openrouterAdapter.validateApiKey('api-key-1234567890abcdefghijklmnopqrstuvwxyz');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should invalidate API key that is too short', () => {
      const result = openrouterAdapter.validateApiKey('sk-or-short');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key appears too short');
    });

    it('should invalidate API key with only prefix', () => {
      const result = openrouterAdapter.validateApiKey('sk-or-');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key appears too short');
    });

    it('should validate correct API key format', () => {
      const validApiKey = 'sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const result = openrouterAdapter.validateApiKey(validApiKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate API key with exactly 40 characters', () => {
      const apiKey = 'sk-or-' + 'a'.repeat(34); // 6 + 34 = 40 characters
      const result = openrouterAdapter.validateApiKey(apiKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate API key with more than 40 characters', () => {
      const apiKey = 'sk-or-' + 'a'.repeat(100);
      const result = openrouterAdapter.validateApiKey(apiKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return multiple errors when applicable', () => {
      // Empty string only returns one error
      const result = openrouterAdapter.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('buildRequestConfig - bearer auth', () => {
    const testPrompt = 'Hello, AI!';
    const testModel = 'anthropic/claude-sonnet-4';
    const testApiKey = 'sk-or-v1-test-key-1234567890123456789012345678';

    it('should return correct URL', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.url).toBe('https://openrouter.ai/api/v1/chat/completions');
    });

    it('should use POST method', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.method).toBe('POST');
    });

    it('should include Content-Type header', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['Content-Type']).toBe('application/json');
    });

    it('should include Authorization header with Bearer token', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['Authorization']).toBe(`Bearer ${testApiKey}`);
    });

    it('should use Bearer authentication format', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['Authorization']).toMatch(/^Bearer\s+/);
    });

    it('should include HTTP-Referer header', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['HTTP-Referer']).toBe('https://agent-advisor.app');
    });

    it('should include X-Title header', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['X-Title']).toBe('Agent Advisor');
    });

    it('should include model in body', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(testModel);
    });

    it('should enable streaming in body', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { stream: boolean };
      expect(body.stream).toBe(true);
    });

    it('should include messages array with user role and prompt', () => {
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ role: string; content: string }> };
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0]!.role).toBe('user');
      expect(body.messages[0]!.content).toBe(testPrompt);
    });

    it('should use provided API key correctly in bearer token', () => {
      const differentApiKey = 'sk-or-v1-different-key-1234567890123456789';
      const config = openrouterAdapter.buildRequestConfig(testPrompt, testModel, differentApiKey);
      expect(config.headers['Authorization']).toBe(`Bearer ${differentApiKey}`);
    });
  });

  describe('buildRequestConfig - multi-model support', () => {
    const testPrompt = 'Hello!';
    const testApiKey = 'sk-or-v1-test-key-1234567890123456789012345678';

    it('should work with Anthropic Claude models', () => {
      const model = 'anthropic/claude-3.5-sonnet';
      const config = openrouterAdapter.buildRequestConfig(testPrompt, model, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(model);
    });

    it('should work with OpenAI GPT models', () => {
      const model = 'openai/gpt-4o';
      const config = openrouterAdapter.buildRequestConfig(testPrompt, model, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(model);
    });

    it('should work with Google Gemini models', () => {
      const model = 'google/gemini-2.0-flash-001';
      const config = openrouterAdapter.buildRequestConfig(testPrompt, model, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(model);
    });

    it('should preserve model path format (provider/model)', () => {
      const models = [
        'anthropic/claude-sonnet-4',
        'anthropic/claude-3.5-haiku',
        'openai/gpt-4o',
        'google/gemini-2.0-flash-001',
      ];

      models.forEach((model) => {
        const config = openrouterAdapter.buildRequestConfig(testPrompt, model, testApiKey);
        const body = config.body as { model: string };
        expect(body.model).toBe(model);
        expect(body.model).toContain('/');
      });
    });

    it('should generate valid config for all supported models', () => {
      openrouterAdapter.supportedModels.forEach((modelInfo) => {
        const config = openrouterAdapter.buildRequestConfig(testPrompt, modelInfo.id, testApiKey);
        const body = config.body as { model: string };
        expect(body.model).toBe(modelInfo.id);
        expect(config.url).toBe('https://openrouter.ai/api/v1/chat/completions');
        expect(config.headers['Authorization']).toBe(`Bearer ${testApiKey}`);
      });
    });
  });

  describe('buildRequestConfig - edge cases', () => {
    const testModel = 'anthropic/claude-sonnet-4';
    const testApiKey = 'sk-or-v1-test-key-1234567890123456789012345678';

    it('should handle empty prompt', () => {
      const config = openrouterAdapter.buildRequestConfig('', testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe('');
    });

    it('should handle multiline prompt', () => {
      const multilinePrompt = 'Line 1\nLine 2\nLine 3';
      const config = openrouterAdapter.buildRequestConfig(multilinePrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(multilinePrompt);
    });

    it('should handle prompt with special characters', () => {
      const specialPrompt = 'Test with <special> & "characters" \'quotes\'';
      const config = openrouterAdapter.buildRequestConfig(specialPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(specialPrompt);
    });

    it('should handle prompt with unicode characters', () => {
      const unicodePrompt = 'Hello 你好 مرحبا 🎉';
      const config = openrouterAdapter.buildRequestConfig(unicodePrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(unicodePrompt);
    });

    it('should handle very long prompt', () => {
      const longPrompt = 'A'.repeat(10000);
      const config = openrouterAdapter.buildRequestConfig(longPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(longPrompt);
      expect(body.messages[0]!.content.length).toBe(10000);
    });
  });

  describe('request config structure', () => {
    it('should have all required properties', () => {
      const config = openrouterAdapter.buildRequestConfig('test', 'anthropic/claude-sonnet-4', 'sk-or-v1-test-1234567890123456789012345678901234');
      expect(config).toHaveProperty('url');
      expect(config).toHaveProperty('method');
      expect(config).toHaveProperty('headers');
      expect(config).toHaveProperty('body');
    });

    it('should have all required headers for OpenRouter', () => {
      const config = openrouterAdapter.buildRequestConfig('test', 'anthropic/claude-sonnet-4', 'sk-or-v1-test-1234567890123456789012345678901234');
      expect(Object.keys(config.headers)).toContain('Content-Type');
      expect(Object.keys(config.headers)).toContain('Authorization');
      expect(Object.keys(config.headers)).toContain('HTTP-Referer');
      expect(Object.keys(config.headers)).toContain('X-Title');
    });

    it('should have all required body properties', () => {
      const config = openrouterAdapter.buildRequestConfig('test', 'anthropic/claude-sonnet-4', 'sk-or-v1-test-1234567890123456789012345678901234');
      const body = config.body as Record<string, unknown>;
      expect(body).toHaveProperty('model');
      expect(body).toHaveProperty('stream');
      expect(body).toHaveProperty('messages');
    });
  });
});
