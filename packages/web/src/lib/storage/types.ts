import type { InterviewStage, ResponseValue, AgentRequirements, AgentRecommendations } from '@/types/interview';

export interface SessionData {
  sessionId: string;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  responses: Record<string, ResponseValue>;
  requirements: Partial<AgentRequirements>;
  recommendations: AgentRecommendations | null;
  isComplete: boolean;
  startedAt: Date | null;
  lastUpdatedAt: Date;
  selectedProvider?: string;
  selectedModel?: string;
}

export interface StorageAdapter {
  saveSession(session: SessionData): Promise<string>;
  getSession(sessionId: string): Promise<SessionData | null>;
  getLatestSession(): Promise<SessionData | null>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(limit?: number): Promise<SessionData[]>;

  saveDocument(sessionId: string, templateId: string, content: string): Promise<string>;
  getDocument(sessionId: string): Promise<{ templateId: string; content: string } | null>;
}

export type AdapterType = 'dexie' | 'convex';
