import type { StorageAdapter, SessionData } from './types';
import { api } from '../../../../../convex/_generated/api';
import type { ConvexReactClient } from 'convex/react';

export function createConvexAdapter(client: ConvexReactClient): StorageAdapter {
  return {
    async saveSession(session: SessionData): Promise<string> {
      const existingSession = await client.query(api.sessions.get, { sessionId: session.sessionId });

      if (existingSession) {
        await client.mutation(api.sessions.update, {
          sessionId: session.sessionId,
          currentStage: session.currentStage,
          currentQuestionIndex: session.currentQuestionIndex,
          isComplete: session.isComplete,
        });
      } else {
        await client.mutation(api.sessions.create, {
          sessionId: session.sessionId,
          selectedProvider: session.selectedProvider || '',
          selectedModel: session.selectedModel || '',
        });
      }

      for (const [questionId, value] of Object.entries(session.responses)) {
        await client.mutation(api.responses.record, {
          sessionId: session.sessionId,
          questionId,
          value,
        });
      }

      return session.sessionId;
    },

    async getSession(sessionId: string): Promise<SessionData | null> {
      const session = await client.query(api.sessions.get, { sessionId });
      if (!session) return null;

      const responses = await client.query(api.responses.getBySession, { sessionId });
      const responsesMap: Record<string, SessionData['responses'][string]> = {};
      for (const r of responses) {
        responsesMap[r.questionId] = r.value;
      }

      return {
        sessionId: session.sessionId,
        currentStage: session.currentStage,
        currentQuestionIndex: session.currentQuestionIndex,
        responses: responsesMap,
        requirements: {},
        recommendations: null,
        isComplete: session.isComplete,
        startedAt: new Date(session.createdAt),
        lastUpdatedAt: new Date(session.lastUpdatedAt),
        selectedProvider: session.selectedProvider,
        selectedModel: session.selectedModel,
      };
    },

    async getLatestSession(): Promise<SessionData | null> {
      const sessions = await client.query(api.sessions.list, {});
      const latest = sessions[0];
      if (!latest) return null;

      return this.getSession(latest.sessionId);
    },

    async deleteSession(sessionId: string): Promise<void> {
      await client.mutation(api.responses.removeBySession, { sessionId });
      await client.mutation(api.documents.remove, { sessionId });
      await client.mutation(api.sessions.remove, { sessionId });
    },

    async listSessions(limit = 20): Promise<SessionData[]> {
      const sessions = await client.query(api.sessions.list, {});
      const result: SessionData[] = [];

      for (const s of sessions.slice(0, limit)) {
        const session = await this.getSession(s.sessionId);
        if (session) result.push(session);
      }

      return result;
    },

    async saveDocument(sessionId: string, templateId: string, content: string): Promise<string> {
      await client.mutation(api.documents.save, { sessionId, templateId, content });
      return sessionId;
    },

    async getDocument(sessionId: string): Promise<{ templateId: string; content: string } | null> {
      const doc = await client.query(api.documents.getBySession, { sessionId });
      if (!doc) return null;
      return { templateId: doc.templateId, content: doc.content };
    },
  };
}
