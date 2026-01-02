import type { StorageAdapter, AdapterType } from './types';
import { dexieAdapter } from './dexie-adapter';
import { createConvexAdapter } from './convex-adapter';
import type { ConvexReactClient } from 'convex/react';

let currentAdapter: StorageAdapter = dexieAdapter;
let currentType: AdapterType = 'dexie';

export function getAdapter(): StorageAdapter {
  return currentAdapter;
}

export function getAdapterType(): AdapterType {
  return currentType;
}

export function setAdapter(type: AdapterType, convexClient?: ConvexReactClient): void {
  if (type === 'convex' && convexClient) {
    currentAdapter = createConvexAdapter(convexClient);
    currentType = 'convex';
  } else {
    currentAdapter = dexieAdapter;
    currentType = 'dexie';
  }
}

export function resetToLocalAdapter(): void {
  currentAdapter = dexieAdapter;
  currentType = 'dexie';
}
