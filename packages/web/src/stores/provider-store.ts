import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderId } from '@/lib/providers/types';
import { getProvider, getDefaultModel, isValidProviderId } from '@/lib/providers/registry';

interface ProviderStore {
  selectedProvider: ProviderId;
  selectedModel: string;
  isConfigured: boolean;

  setProvider: (id: ProviderId) => void;
  setModel: (model: string) => void;
  setConfigured: (configured: boolean) => void;
  reset: () => void;
}

export const useProviderStore = create<ProviderStore>()(
  persist(
    (set) => ({
      selectedProvider: 'anthropic',
      selectedModel: 'claude-sonnet-4-20250514',
      isConfigured: false,

      setProvider: (id) => {
        if (!isValidProviderId(id)) {
          console.warn(`Invalid provider ID: ${id}`);
          return;
        }
        const defaultModel = getDefaultModel(id);
        set({ selectedProvider: id, selectedModel: defaultModel, isConfigured: false });
      },

      setModel: (model) => {
        set((state) => {
          const provider = getProvider(state.selectedProvider);
          const isValid = provider.supportedModels.some((m) => m.id === model);
          if (!isValid) {
            console.warn(`Invalid model ${model} for provider ${state.selectedProvider}`);
            return state;
          }
          return { selectedModel: model };
        });
      },

      setConfigured: (configured) => set({ isConfigured: configured }),

      reset: () =>
        set({
          selectedProvider: 'anthropic',
          selectedModel: 'claude-sonnet-4-20250514',
          isConfigured: false,
        }),
    }),
    {
      name: 'provider-settings',
    }
  )
);
