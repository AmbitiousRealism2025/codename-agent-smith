export type InteractionStyle = 'conversational' | 'task-focused' | 'collaborative';

export interface AgentCapabilities {
  memory: 'none' | 'short-term' | 'long-term';
  fileAccess: boolean;
  webAccess: boolean;
  codeExecution: boolean;
  dataAnalysis: boolean;
  toolIntegrations: string[];
  notes?: string;
}

export interface EnvironmentPreferences {
  runtime: 'cloud' | 'local' | 'hybrid';
  deploymentTargets?: string[];
  complianceRequirements?: string[];
}

export interface AgentRequirements {
  name: string;
  description: string;
  primaryOutcome: string;
  targetAudience: string[];
  interactionStyle: InteractionStyle;
  deliveryChannels: string[];
  successMetrics: string[];
  constraints?: string[];
  preferredTechnologies?: string[];
  capabilities: AgentCapabilities;
  environment?: EnvironmentPreferences;
  additionalNotes?: string;
}

export interface ToolConfiguration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiredPermissions: string[];
}

export interface MCPServerConfiguration {
  name: string;
  description: string;
  url: string;
  authentication?: 'apiKey' | 'oauth' | 'none';
}

export interface AgentRecommendations {
  agentType: string;
  requiredDependencies: string[];
  mcpServers: MCPServerConfiguration[];
  systemPrompt?: string;
  toolConfigurations: ToolConfiguration[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  notes?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  capabilityTags: string[];
  idealFor: string[];
  systemPrompt: string;
  defaultTools: ToolConfiguration[];
  requiredDependencies: string[];
  recommendedIntegrations: string[];
}
