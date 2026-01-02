import type { StorageAdapter, SessionData } from './types';
import { db, type StoredSession } from './db';

function toSessionData(stored: StoredSession): SessionData {
  return {
    sessionId: stored.sessionId,
    currentStage: stored.currentStage,
    currentQuestionIndex: stored.currentQuestionIndex,
    responses: stored.responses,
    requirements: stored.requirements,
    recommendations: stored.recommendations,
    isComplete: stored.isComplete,
    startedAt: stored.startedAt,
    lastUpdatedAt: stored.lastUpdatedAt,
  };
}

export const dexieAdapter: StorageAdapter = {
  async saveSession(session: SessionData): Promise<string> {
    const storedSession: StoredSession = {
      id: session.sessionId,
      sessionId: session.sessionId,
      currentStage: session.currentStage,
      currentQuestionIndex: session.currentQuestionIndex,
      responses: session.responses,
      requirements: session.requirements,
      recommendations: session.recommendations,
      isComplete: session.isComplete,
      startedAt: session.startedAt,
      lastUpdatedAt: new Date(),
    };
    await db.sessions.put(storedSession);
    return session.sessionId;
  },

  async getSession(sessionId: string): Promise<SessionData | null> {
    const stored = await db.sessions.get(sessionId);
    return stored ? toSessionData(stored) : null;
  },

  async getLatestSession(): Promise<SessionData | null> {
    const stored = await db.sessions.orderBy('lastUpdatedAt').reverse().first();
    return stored ? toSessionData(stored) : null;
  },

  async deleteSession(sessionId: string): Promise<void> {
    await db.sessions.delete(sessionId);
  },

  async listSessions(limit = 20): Promise<SessionData[]> {
    const sessions = await db.sessions.orderBy('lastUpdatedAt').reverse().limit(limit).toArray();
    return sessions.map(toSessionData);
  },

  async saveDocument(_sessionId: string, _templateId: string, _content: string): Promise<string> {
    return _sessionId;
  },

  async getDocument(_sessionId: string): Promise<{ templateId: string; content: string } | null> {
    return null;
  },
};
