/**
 * Zustand mock utilities for testing
 *
 * Provides utilities for resetting Zustand stores between tests and
 * creating mock stores for isolated testing scenarios.
 */

import type { StoreApi, UseBoundStore } from "zustand";

/**
 * Storage keys used by persisted Zustand stores
 * These must match the 'name' property in persist() middleware config
 */
export const STORE_KEYS = {
  advisor: "advisor-session",
  provider: "provider-settings",
  ui: "advisor-ui",
} as const;

type StoreKey = (typeof STORE_KEYS)[keyof typeof STORE_KEYS];

/**
 * Clears localStorage for all Zustand persisted stores
 */
export function clearPersistedStores(): void {
  Object.values(STORE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Clears localStorage for a specific store
 */
export function clearPersistedStore(key: StoreKey): void {
  localStorage.removeItem(key);
}

/**
 * Type helper for extracting state from a Zustand store
 */
type ExtractState<S> = S extends UseBoundStore<StoreApi<infer T>> ? T : never;

/**
 * Resets a Zustand store to its initial state
 *
 * @param store - The Zustand store hook
 * @param initialState - The initial state to reset to (partial state merged with current)
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   resetStore(useAdvisorStore, {
 *     sessionId: null,
 *     currentStage: 'discovery',
 *     responses: {},
 *   });
 * });
 * ```
 */
export function resetStore<S extends UseBoundStore<StoreApi<unknown>>>(
  store: S,
  initialState: Partial<ExtractState<S>>
): void {
  store.setState(initialState as ExtractState<S>);
}

/**
 * Resets a store and clears its persisted data
 */
export function resetStoreWithPersistence<S extends UseBoundStore<StoreApi<unknown>>>(
  store: S,
  storeKey: StoreKey,
  initialState: Partial<ExtractState<S>>
): void {
  clearPersistedStore(storeKey);
  resetStore(store, initialState);
}

/**
 * Creates a store state initializer for use in beforeEach hooks
 *
 * @example
 * ```ts
 * const initAdvisorStore = createStoreInitializer(useAdvisorStore, {
 *   sessionId: null,
 *   currentStage: 'discovery',
 * });
 *
 * beforeEach(() => {
 *   initAdvisorStore();
 * });
 * ```
 */
export function createStoreInitializer<S extends UseBoundStore<StoreApi<unknown>>>(
  store: S,
  initialState: Partial<ExtractState<S>>
): () => void {
  return () => resetStore(store, initialState);
}

/**
 * Default initial states for app stores (state properties only, no actions)
 * Use these to reset stores to their default state in tests
 */
export const DEFAULT_ADVISOR_STATE = {
  sessionId: null,
  currentStage: "discovery" as const,
  currentQuestionIndex: 0,
  responses: {},
  requirements: {},
  recommendations: null,
  isComplete: false,
  isGenerating: false,
  startedAt: null,
};

export const DEFAULT_PROVIDER_STATE = {
  selectedProvider: "anthropic" as const,
  selectedModel: "claude-sonnet-4-20250514",
  isConfigured: false,
};

export const DEFAULT_UI_STATE = {
  theme: "system" as const,
  sidebarOpen: true,
};

/**
 * Resets all app stores to their default states
 * Call this in beforeEach to ensure clean test isolation
 *
 * @example
 * ```ts
 * import { resetAllStores } from '@/test/mocks/zustand';
 *
 * beforeEach(() => {
 *   resetAllStores();
 * });
 * ```
 */
export async function resetAllStores(): Promise<void> {
  // Import stores dynamically to avoid circular dependencies
  const { useAdvisorStore } = await import("@/stores/advisor-store");
  const { useProviderStore } = await import("@/stores/provider-store");
  const { useUIStore } = await import("@/stores/ui-store");

  clearPersistedStores();

  useAdvisorStore.setState(DEFAULT_ADVISOR_STATE);
  useProviderStore.setState(DEFAULT_PROVIDER_STATE);
  useUIStore.setState(DEFAULT_UI_STATE);
}

/**
 * Creates a mock Zustand store for testing
 *
 * @param initialState - The initial state for the mock store
 * @returns A mock store with setState and getState methods
 *
 * @example
 * ```ts
 * const mockStore = createMockStore({
 *   count: 0,
 *   increment: () => {},
 * });
 *
 * vi.mock('@/stores/counter-store', () => ({
 *   useCounterStore: mockStore,
 * }));
 * ```
 */
export function createMockStore<T extends object>(
  initialState: T
): UseBoundStore<StoreApi<T>> {
  let state = { ...initialState };
  const storedInitialState = { ...initialState };
  const listeners = new Set<(state: T, prevState: T) => void>();

  const store = ((selector?: (state: T) => unknown) => {
    if (selector) {
      return selector(state);
    }
    return state;
  }) as UseBoundStore<StoreApi<T>>;

  store.getState = () => state;

  store.setState = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => {
    const prevState = state;
    const nextState = typeof partial === "function" ? partial(state) : partial;

    if (replace) {
      state = nextState as T;
    } else {
      state = { ...state, ...nextState };
    }

    listeners.forEach((listener) => listener(state, prevState));
  };

  store.subscribe = (listener: (state: T, prevState: T) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  store.getInitialState = () => storedInitialState;

  return store;
}

/**
 * Wraps store mutations for testing
 * Use this when testing components that depend on store state
 *
 * @param fn - Function that modifies store state
 *
 * @example
 * ```ts
 * await actWithStore(() => {
 *   useAdvisorStore.getState().initSession();
 * });
 * ```
 */
export async function actWithStore(fn: () => void | Promise<void>): Promise<void> {
  // When @testing-library/react is available, wrap in act()
  // For now, just execute the function directly
  await fn();
}

/**
 * Helper to wrap store operations in React's act() when available
 * Import this in test files that have @testing-library/react
 *
 * @example
 * ```ts
 * import { act } from '@testing-library/react';
 * import { wrapInAct } from '@/test/mocks/zustand';
 *
 * const actStore = wrapInAct(act);
 * await actStore(() => store.getState().doSomething());
 * ```
 */
export function wrapInAct(
  act: (callback: () => void | Promise<void>) => Promise<void>
): (fn: () => void | Promise<void>) => Promise<void> {
  return async (fn) => {
    await act(async () => {
      await fn();
    });
  };
}
