import { describe, it, expect } from 'vitest';
import {
  getProvider,
  getAllProviders,
  getProviderIds,
  isValidProviderId,
  getModelsForProvider,
  getDefaultModel,
  validateProviderApiKey,
} from '../registry';
import { anthropicAdapter } from '../anthropic-adapter';
import { openrouterAdapter } from '../openrouter-adapter';
import { minimaxAdapter } from '../minimax-adapter';
import type { ProviderId } from '../types';

describe('registry', () => {
  describe('getProvider', () => {
    it('should return anthropic adapter for anthropic id', () => {
      const provider = getProvider('anthropic');
      expect(provider).toBe(anthropicAdapter);
      expect(provider.id).toBe('anthropic');
      expect(provider.name).toBe('Anthropic');
    });

    it('should return openrouter adapter for openrouter id', () => {
      const provider = getProvider('openrouter');
      expect(provider).toBe(openrouterAdapter);
      expect(provider.id).toBe('openrouter');
      expect(provider.name).toBe('OpenRouter');
    });

    it('should return minimax adapter for minimax id', () => {
      const provider = getProvider('minimax');
      expect(provider).toBe(minimaxAdapter);
      expect(provider.id).toBe('minimax');
      expect(provider.name).toBe('MiniMax');
    });

    it('should throw error for unknown provider id', () => {
      expect(() => getProvider('unknown' as ProviderId)).toThrow('Unknown provider: unknown');
    });

    it('should throw error for empty provider id', () => {
      expect(() => getProvider('' as ProviderId)).toThrow('Unknown provider: ');
    });

    it('should return provider with all required properties', () => {
      const provider = getProvider('anthropic');
      expect(provider).toHaveProperty('id');
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('logo');
      expect(provider).toHaveProperty('description');
      expect(provider).toHaveProperty('supportedModels');
      expect(provider).toHaveProperty('defaultModel');
      expect(provider).toHaveProperty('authentication');
      expect(provider).toHaveProperty('validateApiKey');
      expect(provider).toHaveProperty('buildRequestConfig');
    });
  });

  describe('getAllProviders', () => {
    it('should return an array of providers', () => {
      const providers = getAllProviders();
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should return exactly 3 providers', () => {
      const providers = getAllProviders();
      expect(providers).toHaveLength(3);
    });

    it('should include anthropic adapter', () => {
      const providers = getAllProviders();
      expect(providers).toContain(anthropicAdapter);
    });

    it('should include openrouter adapter', () => {
      const providers = getAllProviders();
      expect(providers).toContain(openrouterAdapter);
    });

    it('should include minimax adapter', () => {
      const providers = getAllProviders();
      expect(providers).toContain(minimaxAdapter);
    });

    it('should return providers with unique ids', () => {
      const providers = getAllProviders();
      const ids = providers.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return all providers with valid structure', () => {
      const providers = getAllProviders();
      providers.forEach((provider) => {
        expect(provider.id).toBeDefined();
        expect(provider.name).toBeDefined();
        expect(provider.supportedModels.length).toBeGreaterThan(0);
        expect(typeof provider.validateApiKey).toBe('function');
        expect(typeof provider.buildRequestConfig).toBe('function');
      });
    });
  });

  describe('getProviderIds', () => {
    it('should return an array of provider ids', () => {
      const ids = getProviderIds();
      expect(Array.isArray(ids)).toBe(true);
    });

    it('should return exactly 3 provider ids', () => {
      const ids = getProviderIds();
      expect(ids).toHaveLength(3);
    });

    it('should include anthropic id', () => {
      const ids = getProviderIds();
      expect(ids).toContain('anthropic');
    });

    it('should include openrouter id', () => {
      const ids = getProviderIds();
      expect(ids).toContain('openrouter');
    });

    it('should include minimax id', () => {
      const ids = getProviderIds();
      expect(ids).toContain('minimax');
    });

    it('should return only string values', () => {
      const ids = getProviderIds();
      ids.forEach((id) => {
        expect(typeof id).toBe('string');
      });
    });

    it('should return unique ids', () => {
      const ids = getProviderIds();
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should match providers from getAllProviders', () => {
      const ids = getProviderIds();
      const providers = getAllProviders();
      const providerIds = providers.map((p) => p.id);
      expect(ids.sort()).toEqual(providerIds.sort());
    });
  });

  describe('isValidProviderId', () => {
    it('should return true for anthropic', () => {
      expect(isValidProviderId('anthropic')).toBe(true);
    });

    it('should return true for openrouter', () => {
      expect(isValidProviderId('openrouter')).toBe(true);
    });

    it('should return true for minimax', () => {
      expect(isValidProviderId('minimax')).toBe(true);
    });

    it('should return false for unknown provider id', () => {
      expect(isValidProviderId('unknown')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidProviderId('')).toBe(false);
    });

    it('should return false for null-like values', () => {
      expect(isValidProviderId('null')).toBe(false);
      expect(isValidProviderId('undefined')).toBe(false);
    });

    it('should return false for similar but incorrect ids', () => {
      expect(isValidProviderId('Anthropic')).toBe(false);
      expect(isValidProviderId('ANTHROPIC')).toBe(false);
      expect(isValidProviderId('anthropic ')).toBe(false);
      expect(isValidProviderId(' anthropic')).toBe(false);
    });

    it('should return false for partial matches', () => {
      expect(isValidProviderId('anthro')).toBe(false);
      expect(isValidProviderId('openroute')).toBe(false);
      expect(isValidProviderId('mini')).toBe(false);
    });

    it('should work as a type guard', () => {
      const id: string = 'anthropic';
      if (isValidProviderId(id)) {
        // If this compiles, the type guard works
        const provider = getProvider(id);
        expect(provider.id).toBe('anthropic');
      }
    });

    it('should validate all known provider ids', () => {
      const ids = getProviderIds();
      ids.forEach((id) => {
        expect(isValidProviderId(id)).toBe(true);
      });
    });
  });

  describe('getModelsForProvider', () => {
    it('should return models for anthropic', () => {
      const models = getModelsForProvider('anthropic');
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('should return models for openrouter', () => {
      const models = getModelsForProvider('openrouter');
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('should return models for minimax', () => {
      const models = getModelsForProvider('minimax');
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('should return same models as adapter supportedModels', () => {
      const anthropicModels = getModelsForProvider('anthropic');
      expect(anthropicModels).toBe(anthropicAdapter.supportedModels);

      const openrouterModels = getModelsForProvider('openrouter');
      expect(openrouterModels).toBe(openrouterAdapter.supportedModels);

      const minimaxModels = getModelsForProvider('minimax');
      expect(minimaxModels).toBe(minimaxAdapter.supportedModels);
    });

    it('should return models with required properties', () => {
      const models = getModelsForProvider('anthropic');
      models.forEach((model) => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('contextWindow');
        expect(model).toHaveProperty('maxOutputTokens');
        expect(model).toHaveProperty('supportsStreaming');
      });
    });

    it('should throw for unknown provider', () => {
      expect(() => getModelsForProvider('unknown' as ProviderId)).toThrow('Unknown provider: unknown');
    });
  });

  describe('getDefaultModel', () => {
    it('should return default model for anthropic', () => {
      const defaultModel = getDefaultModel('anthropic');
      expect(typeof defaultModel).toBe('string');
      expect(defaultModel.length).toBeGreaterThan(0);
    });

    it('should return default model for openrouter', () => {
      const defaultModel = getDefaultModel('openrouter');
      expect(typeof defaultModel).toBe('string');
      expect(defaultModel.length).toBeGreaterThan(0);
    });

    it('should return default model for minimax', () => {
      const defaultModel = getDefaultModel('minimax');
      expect(typeof defaultModel).toBe('string');
      expect(defaultModel.length).toBeGreaterThan(0);
    });

    it('should return same default model as adapter', () => {
      expect(getDefaultModel('anthropic')).toBe(anthropicAdapter.defaultModel);
      expect(getDefaultModel('openrouter')).toBe(openrouterAdapter.defaultModel);
      expect(getDefaultModel('minimax')).toBe(minimaxAdapter.defaultModel);
    });

    it('should return a model that exists in supported models', () => {
      const ids: ProviderId[] = ['anthropic', 'openrouter', 'minimax'];
      ids.forEach((id) => {
        const defaultModel = getDefaultModel(id);
        const models = getModelsForProvider(id);
        const modelIds = models.map((m) => m.id);
        expect(modelIds).toContain(defaultModel);
      });
    });

    it('should throw for unknown provider', () => {
      expect(() => getDefaultModel('unknown' as ProviderId)).toThrow('Unknown provider: unknown');
    });
  });

  describe('validateProviderApiKey', () => {
    it('should validate anthropic API key', () => {
      const validKey = 'sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const result = validateProviderApiKey('anthropic', validKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate incorrect anthropic API key', () => {
      const invalidKey = 'invalid-key';
      const result = validateProviderApiKey('anthropic', invalidKey);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate openrouter API key', () => {
      const validKey = 'sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijkl';
      const result = validateProviderApiKey('openrouter', validKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate incorrect openrouter API key', () => {
      const invalidKey = 'invalid-key';
      const result = validateProviderApiKey('openrouter', invalidKey);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate minimax API key', () => {
      const validKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = validateProviderApiKey('minimax', validKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate incorrect minimax API key', () => {
      const invalidKey = 'not-a-jwt';
      const result = validateProviderApiKey('minimax', invalidKey);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return validation result with valid and errors properties', () => {
      const result = validateProviderApiKey('anthropic', 'any-key');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should invalidate empty API key for all providers', () => {
      const ids: ProviderId[] = ['anthropic', 'openrouter', 'minimax'];
      ids.forEach((id) => {
        const result = validateProviderApiKey(id, '');
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should throw for unknown provider', () => {
      expect(() => validateProviderApiKey('unknown' as ProviderId, 'any-key')).toThrow(
        'Unknown provider: unknown'
      );
    });

    it('should delegate to provider adapter validateApiKey', () => {
      const apiKey = 'test-key';
      const registryResult = validateProviderApiKey('anthropic', apiKey);
      const directResult = anthropicAdapter.validateApiKey(apiKey);
      expect(registryResult).toEqual(directResult);
    });
  });

  describe('registry consistency', () => {
    it('should have consistent provider count across functions', () => {
      const providers = getAllProviders();
      const ids = getProviderIds();
      expect(providers.length).toBe(ids.length);
    });

    it('should allow getting provider for each id returned by getProviderIds', () => {
      const ids = getProviderIds();
      ids.forEach((id) => {
        expect(() => getProvider(id)).not.toThrow();
      });
    });

    it('should have each getAllProviders entry accessible via getProvider', () => {
      const providers = getAllProviders();
      providers.forEach((provider) => {
        const retrieved = getProvider(provider.id);
        expect(retrieved).toBe(provider);
      });
    });

    it('should validate isValidProviderId for all registered providers', () => {
      const providers = getAllProviders();
      providers.forEach((provider) => {
        expect(isValidProviderId(provider.id)).toBe(true);
      });
    });

    it('should have models available for all registered providers', () => {
      const ids = getProviderIds();
      ids.forEach((id) => {
        const models = getModelsForProvider(id);
        expect(models.length).toBeGreaterThan(0);
      });
    });

    it('should have default model available for all registered providers', () => {
      const ids = getProviderIds();
      ids.forEach((id) => {
        const defaultModel = getDefaultModel(id);
        expect(defaultModel).toBeTruthy();
      });
    });

    it('should have validateApiKey working for all registered providers', () => {
      const ids = getProviderIds();
      ids.forEach((id) => {
        const result = validateProviderApiKey(id, 'test-key');
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('errors');
      });
    });
  });
});
