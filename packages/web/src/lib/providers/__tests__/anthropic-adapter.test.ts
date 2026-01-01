import { describe, it, expect } from 'vitest';
import { anthropicAdapter } from '../anthropic-adapter';

describe('anthropicAdapter', () => {
  describe('adapter properties', () => {
    it('should have correct id', () => {
      expect(anthropicAdapter.id).toBe('anthropic');
    });

    it('should have correct name', () => {
      expect(anthropicAdapter.name).toBe('Anthropic');
    });

    it('should have a logo path', () => {
      expect(anthropicAdapter.logo).toBe('/providers/anthropic.svg');
    });

    it('should have a description', () => {
      expect(anthropicAdapter.description).toBe('Direct access to Claude models via Anthropic API');
    });

    it('should have apiKey authentication type', () => {
      expect(anthropicAdapter.authentication).toBe('apiKey');
    });

    it('should have supported models', () => {
      expect(anthropicAdapter.supportedModels).toBeDefined();
      expect(anthropicAdapter.supportedModels.length).toBeGreaterThan(0);
    });

    it('should have a default model', () => {
      expect(anthropicAdapter.defaultModel).toBe('claude-sonnet-4-20250514');
    });

    it('should have default model in supported models list', () => {
      const modelIds = anthropicAdapter.supportedModels.map((m) => m.id);
      expect(modelIds).toContain(anthropicAdapter.defaultModel);
    });
  });

  describe('supported models', () => {
    it('should include Claude Sonnet 4', () => {
      const model = anthropicAdapter.supportedModels.find((m) => m.id === 'claude-sonnet-4-20250514');
      expect(model).toBeDefined();
      expect(model?.name).toBe('Claude Sonnet 4');
      expect(model?.contextWindow).toBe(200000);
      expect(model?.maxOutputTokens).toBe(64000);
      expect(model?.supportsStreaming).toBe(true);
    });

    it('should include Claude 3.5 Sonnet', () => {
      const model = anthropicAdapter.supportedModels.find((m) => m.id === 'claude-3-5-sonnet-20241022');
      expect(model).toBeDefined();
      expect(model?.name).toBe('Claude 3.5 Sonnet');
      expect(model?.contextWindow).toBe(200000);
      expect(model?.maxOutputTokens).toBe(8192);
    });

    it('should include Claude 3.5 Haiku', () => {
      const model = anthropicAdapter.supportedModels.find((m) => m.id === 'claude-3-5-haiku-20241022');
      expect(model).toBeDefined();
      expect(model?.name).toBe('Claude 3.5 Haiku');
    });

    it('should include Claude 3 Opus', () => {
      const model = anthropicAdapter.supportedModels.find((m) => m.id === 'claude-3-opus-20240229');
      expect(model).toBeDefined();
      expect(model?.name).toBe('Claude 3 Opus');
    });

    it('should have pricing information for all models', () => {
      anthropicAdapter.supportedModels.forEach((model) => {
        expect(model.pricing).toBeDefined();
        expect(model.pricing?.inputPer1M).toBeGreaterThan(0);
        expect(model.pricing?.outputPer1M).toBeGreaterThan(0);
      });
    });

    it('should support streaming for all models', () => {
      anthropicAdapter.supportedModels.forEach((model) => {
        expect(model.supportsStreaming).toBe(true);
      });
    });
  });

  describe('validateApiKey', () => {
    it('should invalidate empty API key', () => {
      const result = anthropicAdapter.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key is required');
    });

    it('should invalidate API key that does not start with sk-ant-', () => {
      const result = anthropicAdapter.validateApiKey('sk-1234567890abcdefghijklmnopqrstuvwxyz123456');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid API key format. Anthropic keys start with "sk-ant-"');
    });

    it('should invalidate API key with wrong prefix', () => {
      const result = anthropicAdapter.validateApiKey('api-key-1234567890abcdefghijklmnopqrstuvwxyz');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should invalidate API key that is too short', () => {
      const result = anthropicAdapter.validateApiKey('sk-ant-short');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key appears too short');
    });

    it('should invalidate API key with only prefix', () => {
      const result = anthropicAdapter.validateApiKey('sk-ant-');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key appears too short');
    });

    it('should validate correct API key format', () => {
      const validApiKey = 'sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const result = anthropicAdapter.validateApiKey(validApiKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate API key with exactly 40 characters', () => {
      const apiKey = 'sk-ant-' + 'a'.repeat(33); // 7 + 33 = 40 characters
      const result = anthropicAdapter.validateApiKey(apiKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate API key with more than 40 characters', () => {
      const apiKey = 'sk-ant-' + 'a'.repeat(100);
      const result = anthropicAdapter.validateApiKey(apiKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return multiple errors when applicable', () => {
      // Empty string only returns one error
      const result = anthropicAdapter.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('buildRequestConfig', () => {
    const testPrompt = 'Hello, Claude!';
    const testModel = 'claude-sonnet-4-20250514';
    const testApiKey = 'sk-ant-api03-test-key-12345678901234567890';

    it('should return correct URL', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.url).toBe('https://api.anthropic.com/v1/messages');
    });

    it('should use POST method', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.method).toBe('POST');
    });

    it('should include Content-Type header', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['Content-Type']).toBe('application/json');
    });

    it('should include x-api-key header with API key', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['x-api-key']).toBe(testApiKey);
    });

    it('should include anthropic-version header', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['anthropic-version']).toBe('2023-06-01');
    });

    it('should include model in body', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(testModel);
    });

    it('should include max_tokens in body', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { max_tokens: number };
      expect(body.max_tokens).toBe(4096);
    });

    it('should enable streaming in body', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { stream: boolean };
      expect(body.stream).toBe(true);
    });

    it('should include messages array with user role and prompt', () => {
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ role: string; content: string }> };
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
      expect(body.messages[0].content).toBe(testPrompt);
    });

    it('should use provided model correctly', () => {
      const differentModel = 'claude-3-opus-20240229';
      const config = anthropicAdapter.buildRequestConfig(testPrompt, differentModel, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(differentModel);
    });

    it('should use provided API key correctly', () => {
      const differentApiKey = 'sk-ant-api03-different-key-123456789012345';
      const config = anthropicAdapter.buildRequestConfig(testPrompt, testModel, differentApiKey);
      expect(config.headers['x-api-key']).toBe(differentApiKey);
    });

    it('should handle empty prompt', () => {
      const config = anthropicAdapter.buildRequestConfig('', testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0].content).toBe('');
    });

    it('should handle multiline prompt', () => {
      const multilinePrompt = 'Line 1\nLine 2\nLine 3';
      const config = anthropicAdapter.buildRequestConfig(multilinePrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0].content).toBe(multilinePrompt);
    });

    it('should handle prompt with special characters', () => {
      const specialPrompt = 'Test with <special> & "characters" \'quotes\'';
      const config = anthropicAdapter.buildRequestConfig(specialPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0].content).toBe(specialPrompt);
    });

    it('should handle prompt with unicode characters', () => {
      const unicodePrompt = 'Hello 你好 مرحبا 🎉';
      const config = anthropicAdapter.buildRequestConfig(unicodePrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0].content).toBe(unicodePrompt);
    });

    it('should handle very long prompt', () => {
      const longPrompt = 'A'.repeat(10000);
      const config = anthropicAdapter.buildRequestConfig(longPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0].content).toBe(longPrompt);
      expect(body.messages[0].content.length).toBe(10000);
    });
  });

  describe('request config structure', () => {
    it('should have all required properties', () => {
      const config = anthropicAdapter.buildRequestConfig('test', 'claude-sonnet-4-20250514', 'sk-ant-test-1234567890123456789012345678901234567890');
      expect(config).toHaveProperty('url');
      expect(config).toHaveProperty('method');
      expect(config).toHaveProperty('headers');
      expect(config).toHaveProperty('body');
    });

    it('should have all required headers', () => {
      const config = anthropicAdapter.buildRequestConfig('test', 'claude-sonnet-4-20250514', 'sk-ant-test-1234567890123456789012345678901234567890');
      expect(Object.keys(config.headers)).toContain('Content-Type');
      expect(Object.keys(config.headers)).toContain('x-api-key');
      expect(Object.keys(config.headers)).toContain('anthropic-version');
    });

    it('should have all required body properties', () => {
      const config = anthropicAdapter.buildRequestConfig('test', 'claude-sonnet-4-20250514', 'sk-ant-test-1234567890123456789012345678901234567890');
      const body = config.body as Record<string, unknown>;
      expect(body).toHaveProperty('model');
      expect(body).toHaveProperty('max_tokens');
      expect(body).toHaveProperty('stream');
      expect(body).toHaveProperty('messages');
    });
  });
});
