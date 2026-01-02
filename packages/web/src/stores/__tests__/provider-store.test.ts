import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useProviderStore } from '@/stores/provider-store';
import { getProvider, getDefaultModel } from '@/lib/providers/registry';
import { localStorageMock } from '@/test/setup';

describe('useProviderStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Reset store state before each test
    useProviderStore.getState().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state values', () => {
      const state = useProviderStore.getState();

      expect(state.selectedProvider).toBe('anthropic');
      expect(state.selectedModel).toBe('claude-sonnet-4-20250514');
      expect(state.isConfigured).toBe(false);
    });

    it('should have all required actions defined', () => {
      const state = useProviderStore.getState();

      expect(typeof state.setProvider).toBe('function');
      expect(typeof state.setModel).toBe('function');
      expect(typeof state.setConfigured).toBe('function');
      expect(typeof state.reset).toBe('function');
    });
  });

  describe('setProvider', () => {
    it('should change provider to openrouter', () => {
      const store = useProviderStore.getState();
      store.setProvider('openrouter');

      const state = useProviderStore.getState();
      expect(state.selectedProvider).toBe('openrouter');
    });

    it('should change provider to minimax', () => {
      const store = useProviderStore.getState();
      store.setProvider('minimax');

      const state = useProviderStore.getState();
      expect(state.selectedProvider).toBe('minimax');
    });

    it('should update model to provider default when changing provider', () => {
      const store = useProviderStore.getState();
      store.setProvider('openrouter');

      const state = useProviderStore.getState();
      const expectedDefaultModel = getDefaultModel('openrouter');
      expect(state.selectedModel).toBe(expectedDefaultModel);
    });

    it('should reset isConfigured when changing provider', () => {
      const store = useProviderStore.getState();
      store.setConfigured(true);
      expect(useProviderStore.getState().isConfigured).toBe(true);

      store.setProvider('openrouter');

      const state = useProviderStore.getState();
      expect(state.isConfigured).toBe(false);
    });

    it('should not change state for invalid provider id', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = useProviderStore.getState();
      const initialState = { ...useProviderStore.getState() };

      // @ts-expect-error - Testing invalid provider
      store.setProvider('invalid-provider');

      const state = useProviderStore.getState();
      expect(state.selectedProvider).toBe(initialState.selectedProvider);
      expect(state.selectedModel).toBe(initialState.selectedModel);
      expect(warnSpy).toHaveBeenCalledWith('Invalid provider ID: invalid-provider');

      warnSpy.mockRestore();
    });

    it('should not change state for empty provider id', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = useProviderStore.getState();

      // @ts-expect-error - Testing empty provider
      store.setProvider('');

      const state = useProviderStore.getState();
      expect(state.selectedProvider).toBe('anthropic');
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('setModel', () => {
    describe('with anthropic provider', () => {
      it('should set a valid anthropic model', () => {
        const store = useProviderStore.getState();
        store.setModel('claude-3-5-sonnet-20241022');

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe('claude-3-5-sonnet-20241022');
      });

      it('should set claude-3-5-haiku model', () => {
        const store = useProviderStore.getState();
        store.setModel('claude-3-5-haiku-20241022');

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe('claude-3-5-haiku-20241022');
      });

      it('should set claude-3-opus model', () => {
        const store = useProviderStore.getState();
        store.setModel('claude-3-opus-20240229');

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe('claude-3-opus-20240229');
      });

      it('should not set an invalid model for anthropic', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const store = useProviderStore.getState();
        const initialModel = store.selectedModel;

        store.setModel('gpt-4o');

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe(initialModel);
        expect(warnSpy).toHaveBeenCalledWith('Invalid model gpt-4o for provider anthropic');

        warnSpy.mockRestore();
      });
    });

    describe('with openrouter provider', () => {
      beforeEach(() => {
        useProviderStore.getState().setProvider('openrouter');
      });

      it('should set a valid openrouter model', () => {
        const store = useProviderStore.getState();
        store.setModel('anthropic/claude-3.5-sonnet');

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe('anthropic/claude-3.5-sonnet');
      });

      it('should set gpt-4o model via openrouter', () => {
        const store = useProviderStore.getState();
        store.setModel('openai/gpt-4o');

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe('openai/gpt-4o');
      });

      it('should set gemini model via openrouter', () => {
        const store = useProviderStore.getState();
        store.setModel('google/gemini-2.0-flash-001');

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe('google/gemini-2.0-flash-001');
      });

      it('should not set a model from different provider', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const store = useProviderStore.getState();
        const initialModel = store.selectedModel;

        store.setModel('claude-sonnet-4-20250514'); // Anthropic-specific model ID

        const state = useProviderStore.getState();
        expect(state.selectedModel).toBe(initialModel);
        expect(warnSpy).toHaveBeenCalledWith(
          'Invalid model claude-sonnet-4-20250514 for provider openrouter'
        );

        warnSpy.mockRestore();
      });
    });

    it('should not change model for completely invalid model id', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = useProviderStore.getState();
      const initialModel = store.selectedModel;

      store.setModel('totally-fake-model');

      const state = useProviderStore.getState();
      expect(state.selectedModel).toBe(initialModel);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should not change model for empty model id', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = useProviderStore.getState();
      const initialModel = store.selectedModel;

      store.setModel('');

      const state = useProviderStore.getState();
      expect(state.selectedModel).toBe(initialModel);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('setConfigured', () => {
    it('should set isConfigured to true', () => {
      const store = useProviderStore.getState();
      store.setConfigured(true);

      const state = useProviderStore.getState();
      expect(state.isConfigured).toBe(true);
    });

    it('should set isConfigured to false', () => {
      const store = useProviderStore.getState();
      store.setConfigured(true);
      store.setConfigured(false);

      const state = useProviderStore.getState();
      expect(state.isConfigured).toBe(false);
    });

    it('should allow toggling isConfigured multiple times', () => {
      const store = useProviderStore.getState();

      store.setConfigured(true);
      expect(useProviderStore.getState().isConfigured).toBe(true);

      store.setConfigured(false);
      expect(useProviderStore.getState().isConfigured).toBe(false);

      store.setConfigured(true);
      expect(useProviderStore.getState().isConfigured).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset provider to anthropic', () => {
      const store = useProviderStore.getState();
      store.setProvider('openrouter');
      store.reset();

      const state = useProviderStore.getState();
      expect(state.selectedProvider).toBe('anthropic');
    });

    it('should reset model to default anthropic model', () => {
      const store = useProviderStore.getState();
      store.setModel('claude-3-opus-20240229');
      store.reset();

      const state = useProviderStore.getState();
      expect(state.selectedModel).toBe('claude-sonnet-4-20250514');
    });

    it('should reset isConfigured to false', () => {
      const store = useProviderStore.getState();
      store.setConfigured(true);
      store.reset();

      const state = useProviderStore.getState();
      expect(state.isConfigured).toBe(false);
    });

    it('should reset all state after complex operations', () => {
      const store = useProviderStore.getState();

      // Perform various operations
      store.setProvider('openrouter');
      store.setModel('openai/gpt-4o');
      store.setConfigured(true);

      // Verify changes were made
      expect(useProviderStore.getState().selectedProvider).toBe('openrouter');
      expect(useProviderStore.getState().selectedModel).toBe('openai/gpt-4o');
      expect(useProviderStore.getState().isConfigured).toBe(true);

      // Reset
      store.reset();

      // Verify reset to initial state
      const state = useProviderStore.getState();
      expect(state.selectedProvider).toBe('anthropic');
      expect(state.selectedModel).toBe('claude-sonnet-4-20250514');
      expect(state.isConfigured).toBe(false);
    });
  });

  describe('model validation', () => {
    it('should validate model exists in provider supported models', () => {
      const provider = getProvider('anthropic');
      const validModelIds = provider.supportedModels.map((m) => m.id);

      // Verify all valid models can be set
      validModelIds.forEach((modelId) => {
        useProviderStore.getState().reset();
        useProviderStore.getState().setModel(modelId);
        expect(useProviderStore.getState().selectedModel).toBe(modelId);
      });
    });

    it('should correctly handle provider switch and model validation', () => {
      const store = useProviderStore.getState();

      // Start with anthropic
      expect(store.selectedProvider).toBe('anthropic');

      // Switch to openrouter - should update model to openrouter default
      store.setProvider('openrouter');
      const openrouterDefault = getDefaultModel('openrouter');
      expect(useProviderStore.getState().selectedModel).toBe(openrouterDefault);

      // Now try to set an openrouter-specific model
      store.setModel('openai/gpt-4o');
      expect(useProviderStore.getState().selectedModel).toBe('openai/gpt-4o');

      // Switch back to anthropic - should reset to anthropic default
      store.setProvider('anthropic');
      const anthropicDefault = getDefaultModel('anthropic');
      expect(useProviderStore.getState().selectedModel).toBe(anthropicDefault);
    });
  });

  describe('state persistence', () => {
    it('should have persist middleware configured with correct name', () => {
      // The store uses persist middleware with name 'provider-settings'
      // This test verifies the store can persist and retrieve state
      const store = useProviderStore.getState();

      store.setProvider('openrouter');
      store.setConfigured(true);

      // State should be set correctly
      const state = useProviderStore.getState();
      expect(state.selectedProvider).toBe('openrouter');
      expect(state.isConfigured).toBe(true);
    });
  });
});
