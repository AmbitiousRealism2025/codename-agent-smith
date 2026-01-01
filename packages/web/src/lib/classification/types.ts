export type {
  InteractionStyle,
  AgentCapabilities,
  EnvironmentPreferences,
  AgentRequirements,
  ToolConfiguration,
  MCPServerConfiguration,
  AgentRecommendations,
  AgentTemplate,
} from '@/types/agent';

export interface TemplateScore {
  templateId: string;
  score: number;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  reasoning: string;
}

export interface ClassificationResult {
  scores: TemplateScore[];
  primaryRecommendation: string;
  confidence: number;
}
