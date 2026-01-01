import type { ProviderAdapter, ProviderId, ModelInfo } from './types';
import { anthropicAdapter } from './anthropic-adapter';
import { openrouterAdapter } from './openrouter-adapter';
import { minimaxAdapter } from './minimax-adapter';

const PROVIDER_REGISTRY: Record<ProviderId, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openrouter: openrouterAdapter,
  minimax: minimaxAdapter,
};

export function getProvider(id: ProviderId): ProviderAdapter {
  const provider = PROVIDER_REGISTRY[id];
  if (!provider) {
    throw new Error(`Unknown provider: ${id}`);
  }
  return provider;
}

export function getAllProviders(): ProviderAdapter[] {
  return Object.values(PROVIDER_REGISTRY);
}

export function getProviderIds(): ProviderId[] {
  return Object.keys(PROVIDER_REGISTRY) as ProviderId[];
}

export function isValidProviderId(id: string): id is ProviderId {
  return id in PROVIDER_REGISTRY;
}

export function getModelsForProvider(id: ProviderId): ModelInfo[] {
  return getProvider(id).supportedModels;
}

export function getDefaultModel(id: ProviderId): string {
  return getProvider(id).defaultModel;
}

export function validateProviderApiKey(id: ProviderId, apiKey: string) {
  return getProvider(id).validateApiKey(apiKey);
}
