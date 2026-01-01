export type {
  AgentRequirements,
  AgentRecommendations,
  AgentCapabilities,
  InteractionStyle,
} from './agent';

export type InterviewStage = 'discovery' | 'requirements' | 'architecture' | 'output' | 'complete';

export type QuestionType = 'text' | 'choice' | 'multiselect' | 'boolean';

export type ResponseValue = string | boolean | string[];

export interface InterviewQuestion {
  id: string;
  stage: InterviewStage;
  text: string;
  type: QuestionType;
  required: boolean;
  hint?: string;
  options?: string[];
  followUp?: string;
}

export interface Response {
  questionId: string;
  value: ResponseValue;
  timestamp: Date;
}

export interface TemplateScore {
  templateId: string;
  score: number;
  confidence: number;
}
