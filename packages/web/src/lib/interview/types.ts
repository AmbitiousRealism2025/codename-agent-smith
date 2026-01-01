export type {
  InterviewStage,
  QuestionType,
  ResponseValue,
  InterviewQuestion,
  Response,
  AgentRequirements,
  AgentRecommendations,
} from '@/types/interview';

import type { AgentRequirements, AgentRecommendations, InterviewStage, Response } from '@/types/interview';

export interface ConversationMetadata {
  advisorSessionId: string | null;
  messageCount: number;
  lastActivity: Date;
  conversationStarted: Date;
}

export interface InterviewState {
  sessionId: string;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  responses: Response[];
  requirements: Partial<AgentRequirements>;
  recommendations: AgentRecommendations | null;
  isComplete: boolean;
  startedAt?: Date;
  lastUpdatedAt?: Date;
  conversationMetadata?: ConversationMetadata;
}

export interface PersistedState {
  sessionId: string;
  timestamp: Date;
  interviewState: InterviewState;
  partialRequirements: Partial<AgentRequirements>;
  conversationMetadata?: ConversationMetadata;
}
