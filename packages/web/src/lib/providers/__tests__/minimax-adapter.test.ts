import { describe, it, expect } from 'vitest';
import { minimaxAdapter } from '../minimax-adapter';

describe('minimaxAdapter', () => {
  describe('adapter properties', () => {
    it('should have correct id', () => {
      expect(minimaxAdapter.id).toBe('minimax');
    });

    it('should have correct name', () => {
      expect(minimaxAdapter.name).toBe('MiniMax');
    });

    it('should have a logo path', () => {
      expect(minimaxAdapter.logo).toBe('/providers/minimax.svg');
    });

    it('should have a description', () => {
      expect(minimaxAdapter.description).toBe('MiniMax AI models with Anthropic-compatible API');
    });

    it('should have jwt authentication type', () => {
      expect(minimaxAdapter.authentication).toBe('jwt');
    });

    it('should have supported models', () => {
      expect(minimaxAdapter.supportedModels).toBeDefined();
      expect(minimaxAdapter.supportedModels.length).toBeGreaterThan(0);
    });

    it('should have a default model', () => {
      expect(minimaxAdapter.defaultModel).toBe('MiniMax-M2');
    });

    it('should have default model in supported models list', () => {
      const modelIds = minimaxAdapter.supportedModels.map((m) => m.id);
      expect(modelIds).toContain(minimaxAdapter.defaultModel);
    });
  });

  describe('supported models', () => {
    it('should include MiniMax M2', () => {
      const model = minimaxAdapter.supportedModels.find((m) => m.id === 'MiniMax-M2');
      expect(model).toBeDefined();
      expect(model?.name).toBe('MiniMax M2');
      expect(model?.contextWindow).toBe(128000);
      expect(model?.maxOutputTokens).toBe(8192);
      expect(model?.supportsStreaming).toBe(true);
    });

    it('should support streaming for all models', () => {
      minimaxAdapter.supportedModels.forEach((model) => {
        expect(model.supportsStreaming).toBe(true);
      });
    });
  });

  describe('validateApiKey - JWT validation', () => {
    it('should invalidate empty JWT token', () => {
      const result = minimaxAdapter.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('JWT token is required');
    });

    it('should invalidate JWT token with only one part', () => {
      const result = minimaxAdapter.validateApiKey('singleparttoken');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid JWT token format. Should have 3 parts separated by dots');
    });

    it('should invalidate JWT token with only two parts', () => {
      const result = minimaxAdapter.validateApiKey('header.payload');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid JWT token format. Should have 3 parts separated by dots');
    });

    it('should invalidate JWT token with four or more parts', () => {
      const result = minimaxAdapter.validateApiKey('part1.part2.part3.part4');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid JWT token format. Should have 3 parts separated by dots');
    });

    it('should invalidate JWT token that is too short', () => {
      const shortToken = 'a.b.c'; // 5 characters, less than 100
      const result = minimaxAdapter.validateApiKey(shortToken);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('JWT token appears too short');
    });

    it('should invalidate JWT token with 3 parts but too short overall', () => {
      const token = 'header.payload.signature'; // 24 characters, less than 100
      const result = minimaxAdapter.validateApiKey(token);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('JWT token appears too short');
    });

    it('should validate correct JWT token format with 3 parts', () => {
      // Create a valid JWT-like token with 3 parts and > 100 characters
      const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const payload = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
      const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const validToken = `${header}.${payload}.${signature}`;

      const result = minimaxAdapter.validateApiKey(validToken);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate JWT token with exactly 100 characters', () => {
      // Create a token with exactly 100 characters (including dots)
      // Format: header.payload.signature (2 dots = 2 chars)
      // So we need 98 chars for the 3 parts combined
      const header = 'a'.repeat(32);
      const payload = 'b'.repeat(33);
      const signature = 'c'.repeat(33);
      const token = `${header}.${payload}.${signature}`; // 32 + 1 + 33 + 1 + 33 = 100 chars

      const result = minimaxAdapter.validateApiKey(token);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate JWT token with more than 100 characters', () => {
      const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const payload = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9';
      const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5cVeryLongSignature';
      const longToken = `${header}.${payload}.${signature}`;

      const result = minimaxAdapter.validateApiKey(longToken);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return only one error for empty input', () => {
      const result = minimaxAdapter.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
    });

    it('should validate real-world JWT structure', () => {
      // A more realistic JWT token structure
      const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1pbmltYXgtMjAyNCJ9.eyJpc3MiOiJtaW5pbWF4IiwiYXVkIjoiaHR0cHM6Ly9hcGkubWluaW1heC5pbyIsInN1YiI6InVzZXItMTIzNDU2Nzg5MCIsImlhdCI6MTcwMzk4MDAwMCwiZXhwIjoxNzAzOTgzNjAwfQ.signature_placeholder_that_is_long_enough_to_make_this_token_valid';

      const result = minimaxAdapter.validateApiKey(token);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('buildRequestConfig', () => {
    // Create a valid test JWT token (> 100 chars with 3 parts)
    const testPrompt = 'Hello, MiniMax!';
    const testModel = 'MiniMax-M2';
    const testApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    it('should return correct URL', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.url).toBe('https://api.minimax.io/anthropic/v1/messages');
    });

    it('should use POST method', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.method).toBe('POST');
    });

    it('should include Content-Type header', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['Content-Type']).toBe('application/json');
    });

    it('should include x-api-key header with JWT token', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['x-api-key']).toBe(testApiKey);
    });

    it('should include anthropic-version header', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      expect(config.headers['anthropic-version']).toBe('2023-06-01');
    });

    it('should include model in body', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(testModel);
    });

    it('should include max_tokens in body', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { max_tokens: number };
      expect(body.max_tokens).toBe(4096);
    });

    it('should enable streaming in body', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { stream: boolean };
      expect(body.stream).toBe(true);
    });

    it('should include messages array with user role and prompt', () => {
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ role: string; content: string }> };
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0]!.role).toBe('user');
      expect(body.messages[0]!.content).toBe(testPrompt);
    });

    it('should use provided model correctly', () => {
      const differentModel = 'MiniMax-M3';
      const config = minimaxAdapter.buildRequestConfig(testPrompt, differentModel, testApiKey);
      const body = config.body as { model: string };
      expect(body.model).toBe(differentModel);
    });

    it('should use provided JWT token correctly', () => {
      const differentToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWZmZXJlbnQiLCJpYXQiOjE1MTYyMzkwMjJ9.differentSignatureHere1234567890abcdef';
      const config = minimaxAdapter.buildRequestConfig(testPrompt, testModel, differentToken);
      expect(config.headers['x-api-key']).toBe(differentToken);
    });

    it('should handle empty prompt', () => {
      const config = minimaxAdapter.buildRequestConfig('', testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe('');
    });

    it('should handle multiline prompt', () => {
      const multilinePrompt = 'Line 1\nLine 2\nLine 3';
      const config = minimaxAdapter.buildRequestConfig(multilinePrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(multilinePrompt);
    });

    it('should handle prompt with special characters', () => {
      const specialPrompt = 'Test with <special> & "characters" \'quotes\'';
      const config = minimaxAdapter.buildRequestConfig(specialPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(specialPrompt);
    });

    it('should handle prompt with unicode characters', () => {
      const unicodePrompt = 'Hello 你好 مرحبا 🎉';
      const config = minimaxAdapter.buildRequestConfig(unicodePrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(unicodePrompt);
    });

    it('should handle very long prompt', () => {
      const longPrompt = 'A'.repeat(10000);
      const config = minimaxAdapter.buildRequestConfig(longPrompt, testModel, testApiKey);
      const body = config.body as { messages: Array<{ content: string }> };
      expect(body.messages[0]!.content).toBe(longPrompt);
      expect(body.messages[0]!.content.length).toBe(10000);
    });
  });

  describe('request config structure', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    it('should have all required properties', () => {
      const config = minimaxAdapter.buildRequestConfig('test', 'MiniMax-M2', validToken);
      expect(config).toHaveProperty('url');
      expect(config).toHaveProperty('method');
      expect(config).toHaveProperty('headers');
      expect(config).toHaveProperty('body');
    });

    it('should have all required headers', () => {
      const config = minimaxAdapter.buildRequestConfig('test', 'MiniMax-M2', validToken);
      expect(Object.keys(config.headers)).toContain('Content-Type');
      expect(Object.keys(config.headers)).toContain('x-api-key');
      expect(Object.keys(config.headers)).toContain('anthropic-version');
    });

    it('should have all required body properties', () => {
      const config = minimaxAdapter.buildRequestConfig('test', 'MiniMax-M2', validToken);
      const body = config.body as Record<string, unknown>;
      expect(body).toHaveProperty('model');
      expect(body).toHaveProperty('max_tokens');
      expect(body).toHaveProperty('stream');
      expect(body).toHaveProperty('messages');
    });
  });

  describe('JWT-specific authentication differences', () => {
    it('should use jwt authentication instead of apiKey', () => {
      expect(minimaxAdapter.authentication).toBe('jwt');
      expect(minimaxAdapter.authentication).not.toBe('apiKey');
      expect(minimaxAdapter.authentication).not.toBe('bearer');
    });

    it('should validate JWT format (3 dot-separated parts) not API key prefix', () => {
      // This looks like an API key but fails JWT validation
      const apiKeyFormat = 'sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const result = minimaxAdapter.validateApiKey(apiKeyFormat);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid JWT token format. Should have 3 parts separated by dots');
    });

    it('should use x-api-key header for JWT (Anthropic-compatible)', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const config = minimaxAdapter.buildRequestConfig('test', 'MiniMax-M2', validToken);

      // Should use x-api-key, not Authorization Bearer
      expect(config.headers['x-api-key']).toBe(validToken);
      expect(config.headers['Authorization']).toBeUndefined();
    });
  });
});
