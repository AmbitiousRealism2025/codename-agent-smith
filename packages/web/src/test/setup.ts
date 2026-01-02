/**
 * Vitest global test setup
 *
 * This file is automatically loaded before each test file.
 * Provides global test utilities, mocks, and configuration including:
 * - DOM environment mocks (matchMedia, ResizeObserver, IntersectionObserver)
 * - Zustand store reset between tests
 * - localStorage/sessionStorage mocks
 * - Web Crypto API mock for encryption testing
 */

import { beforeEach, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { clearPersistedStores } from "@/test/mocks/zustand";

// Extend Vitest's expect with @testing-library/jest-dom matchers
import '@testing-library/jest-dom/vitest';

/**
 * Mock window.matchMedia for components using media queries
 * Required for theme detection and responsive components
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })),
});

/**
 * Mock ResizeObserver for components using it
 * Required for layout components and responsive containers
 */
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {
    // Callback stored for potential future use in triggering resize events
  }

  observe() {}
  unobserve() {}
  disconnect() {}
};

/**
 * Mock IntersectionObserver for components using it
 * Required for lazy loading and infinite scroll components
 */
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

/**
 * Mock scrollTo for components that scroll programmatically
 */
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

/**
 * Mock Web Crypto API for encryption testing
 * Used by lib/storage/crypto.ts for API key encryption
 */
if (!global.crypto) {
  Object.defineProperty(global, "crypto", {
    value: {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
      randomUUID: () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },
      subtle: {
        generateKey: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        importKey: vi.fn(),
        exportKey: vi.fn(),
        deriveBits: vi.fn(),
        deriveKey: vi.fn(),
        digest: vi.fn(),
        sign: vi.fn(),
        verify: vi.fn(),
        wrapKey: vi.fn(),
        unwrapKey: vi.fn(),
      },
    },
  });
}

/**
 * Create a proper localStorage mock that persists during tests
 */
function createStorageMock(): Storage {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
    getItem(key: string): string | null {
      return store[key] ?? null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
}

// Apply storage mocks if not already present
if (typeof window !== "undefined" && !window.localStorage.getItem) {
  Object.defineProperty(window, "localStorage", {
    value: createStorageMock(),
    writable: true,
  });
  Object.defineProperty(window, "sessionStorage", {
    value: createStorageMock(),
    writable: true,
  });
}

/**
 * Global beforeEach hook
 * Runs before each test to ensure clean state
 */
beforeEach(() => {
  // Clear any localStorage/sessionStorage data from previous tests
  localStorage.clear();
  sessionStorage.clear();

  // Clear Zustand persisted stores
  clearPersistedStores();
});

/**
 * Global afterEach hook
 * Runs after each test to clean up React Testing Library
 */
afterEach(() => {
  // Cleanup React Testing Library renders
  cleanup();

  // Clear all mocks
  vi.clearAllMocks();
});

/**
 * Console warning suppression for specific known warnings
 * Uncomment and customize as needed
 */
// const originalWarn = console.warn;
// console.warn = (...args) => {
//   // Suppress specific warnings during tests
//   const suppressedWarnings = [
//     'React does not recognize the `%s` prop',
//   ];
//   if (suppressedWarnings.some((warning) =>
//     args[0]?.includes?.(warning)
//   )) {
//     return;
//   }
//   originalWarn.apply(console, args);
// };
