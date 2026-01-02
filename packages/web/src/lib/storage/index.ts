export {
  db,
  saveSession,
  getSession,
  getLatestSession,
  getIncompleteSessions,
  deleteSession,
  clearAllSessions,
  saveApiKey,
  getApiKey,
  deleteApiKey,
  updateApiKeyLastUsed,
  saveSetting,
  getSetting,
  deleteSetting,
  type StoredSession,
  type StoredApiKey,
  type StoredSettings,
} from './db';

export { encryptApiKey, decryptApiKey, generateSessionPassphrase } from './crypto';

export type { StorageAdapter, SessionData, AdapterType } from './types';
export { getAdapter, getAdapterType, setAdapter, resetToLocalAdapter } from './adapter-factory';
export { dexieAdapter } from './dexie-adapter';
export { createConvexAdapter } from './convex-adapter';
