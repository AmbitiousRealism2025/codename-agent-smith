import Dexie, { type EntityTable } from 'dexie';
import type {
  InterviewStage,
  ResponseValue,
  AgentRequirements,
  AgentRecommendations,
} from '@/types/interview';

export interface StoredSession {
  id: string;
  sessionId: string;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  responses: Record<string, ResponseValue>;
  requirements: Partial<AgentRequirements>;
  recommendations: AgentRecommendations | null;
  isComplete: boolean;
  startedAt: Date | null;
  lastUpdatedAt: Date;
}

export interface StoredApiKey {
  id: string;
  provider: 'anthropic' | 'openrouter' | 'minimax';
  encryptedKey: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export interface StoredSettings {
  id: string;
  key: string;
  value: unknown;
  updatedAt: Date;
}

class AdvisorDatabase extends Dexie {
  sessions!: EntityTable<StoredSession, 'id'>;
  apiKeys!: EntityTable<StoredApiKey, 'id'>;
  settings!: EntityTable<StoredSettings, 'id'>;

  constructor() {
    super('AgentAdvisorDB');

    this.version(1).stores({
      sessions: 'id, sessionId, lastUpdatedAt, isComplete',
      apiKeys: 'id, provider',
      settings: 'id, key',
    });
  }
}

export const db = new AdvisorDatabase();

export async function saveSession(session: Omit<StoredSession, 'id' | 'lastUpdatedAt'>): Promise<string> {
  const id = session.sessionId;
  const storedSession: StoredSession = {
    ...session,
    id,
    lastUpdatedAt: new Date(),
  };
  await db.sessions.put(storedSession);
  return id;
}

export async function getSession(sessionId: string): Promise<StoredSession | undefined> {
  return db.sessions.get(sessionId);
}

export async function getLatestSession(): Promise<StoredSession | undefined> {
  return db.sessions.orderBy('lastUpdatedAt').reverse().first();
}

export async function getIncompleteSessions(): Promise<StoredSession[]> {
  return db.sessions.where('isComplete').equals(0).toArray();
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.sessions.delete(sessionId);
}

export async function clearAllSessions(): Promise<void> {
  await db.sessions.clear();
}

export async function saveApiKey(
  provider: StoredApiKey['provider'],
  encryptedKey: string
): Promise<string> {
  const id = provider;
  const storedKey: StoredApiKey = {
    id,
    provider,
    encryptedKey,
    createdAt: new Date(),
    lastUsedAt: null,
  };
  await db.apiKeys.put(storedKey);
  return id;
}

export async function getApiKey(provider: StoredApiKey['provider']): Promise<StoredApiKey | undefined> {
  return db.apiKeys.get(provider);
}

export async function deleteApiKey(provider: StoredApiKey['provider']): Promise<void> {
  await db.apiKeys.delete(provider);
}

export async function updateApiKeyLastUsed(provider: StoredApiKey['provider']): Promise<void> {
  await db.apiKeys.update(provider, { lastUsedAt: new Date() });
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({
    id: key,
    key,
    value,
    updatedAt: new Date(),
  });
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const setting = await db.settings.get(key);
  return setting?.value as T | undefined;
}

export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key);
}
