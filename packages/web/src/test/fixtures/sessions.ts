import type { StoredSession } from '@/lib/storage/db';
import type { InterviewStage } from '@/types/interview';

/**
 * Factory function to create a minimal session fixture
 */
export function createSessionFixture(
  overrides: Partial<StoredSession> = {}
): StoredSession {
  // Use fixed timestamp for deterministic test behavior
  const now = new Date('2024-01-01T00:00:00Z');
  return {
    id: 'test-session-001',
    sessionId: 'test-session-001',
    currentStage: 'discovery',
    currentQuestionIndex: 0,
    responses: {},
    requirements: {},
    recommendations: null,
    isComplete: false,
    startedAt: now,
    lastUpdatedAt: now,
    ...overrides,
  };
}

/**
 * Empty session - just started, no responses
 */
export const EMPTY_SESSION: StoredSession = createSessionFixture();

/**
 * Session in discovery stage with partial responses
 */
export const DISCOVERY_STAGE_SESSION: StoredSession = createSessionFixture({
  id: 'session-discovery-001',
  sessionId: 'session-discovery-001',
  currentStage: 'discovery',
  currentQuestionIndex: 1,
  responses: {
    q1_agent_name: 'Test Agent',
  },
  requirements: {
    name: 'Test Agent',
    description: 'Test Agent',
  },
});

/**
 * Session in requirements stage
 */
export const REQUIREMENTS_STAGE_SESSION: StoredSession = createSessionFixture({
  id: 'session-requirements-001',
  sessionId: 'session-requirements-001',
  currentStage: 'requirements',
  currentQuestionIndex: 0,
  responses: {
    q1_agent_name: 'Code Review Bot',
    q2_primary_outcome: 'Automated code quality analysis',
    q3_target_audience: ['Developers', 'Product Managers'],
  },
  requirements: {
    name: 'Code Review Bot',
    description: 'Agent for: Automated code quality analysis',
    primaryOutcome: 'Automated code quality analysis',
    targetAudience: ['Developers', 'Product Managers'],
  },
});

/**
 * Session in architecture stage
 */
export const ARCHITECTURE_STAGE_SESSION: StoredSession = createSessionFixture({
  id: 'session-architecture-001',
  sessionId: 'session-architecture-001',
  currentStage: 'architecture',
  currentQuestionIndex: 2,
  responses: {
    q1_agent_name: 'Data Pipeline Agent',
    q2_primary_outcome: 'Process and transform data streams',
    q3_target_audience: ['Data Scientists', 'Developers'],
    q4_interaction_style: 'task-focused',
    q5_delivery_channels: ['API', 'CLI'],
    q6_success_metrics: ['Processing speed', 'Task completion rate'],
    q7_memory_needs: 'short-term',
    q8_file_access: true,
  },
  requirements: {
    name: 'Data Pipeline Agent',
    description: 'Agent for: Process and transform data streams',
    primaryOutcome: 'Process and transform data streams',
    targetAudience: ['Data Scientists', 'Developers'],
    interactionStyle: 'task-focused',
    deliveryChannels: ['API', 'CLI'],
    successMetrics: ['Processing speed', 'Task completion rate'],
    capabilities: {
      memory: 'short-term',
      fileAccess: true,
      webAccess: false,
      codeExecution: false,
      dataAnalysis: false,
      toolIntegrations: [],
    },
  },
});

/**
 * Session in output stage
 */
export const OUTPUT_STAGE_SESSION: StoredSession = createSessionFixture({
  id: 'session-output-001',
  sessionId: 'session-output-001',
  currentStage: 'output',
  currentQuestionIndex: 0,
  responses: {
    q1_agent_name: 'Research Assistant',
    q2_primary_outcome: 'Conduct web research and summarize findings',
    q3_target_audience: ['Business Analysts', 'Product Managers'],
    q4_interaction_style: 'conversational',
    q5_delivery_channels: ['Web Application', 'Slack/Discord'],
    q6_success_metrics: ['User satisfaction scores', 'Response accuracy'],
    q7_memory_needs: 'long-term',
    q8_file_access: false,
    q9_web_access: true,
    q10_code_execution: false,
    q11_data_analysis: true,
    q12_tool_integrations: 'Jira, Confluence, Notion',
  },
  requirements: {
    name: 'Research Assistant',
    description: 'Agent for: Conduct web research and summarize findings',
    primaryOutcome: 'Conduct web research and summarize findings',
    targetAudience: ['Business Analysts', 'Product Managers'],
    interactionStyle: 'conversational',
    deliveryChannels: ['Web Application', 'Slack/Discord'],
    successMetrics: ['User satisfaction scores', 'Response accuracy'],
    capabilities: {
      memory: 'long-term',
      fileAccess: false,
      webAccess: true,
      codeExecution: false,
      dataAnalysis: true,
      toolIntegrations: ['Jira', 'Confluence', 'Notion'],
    },
  },
});

/**
 * Completed session with all responses and recommendations
 */
export const COMPLETED_SESSION: StoredSession = createSessionFixture({
  id: 'session-complete-001',
  sessionId: 'session-complete-001',
  currentStage: 'complete',
  currentQuestionIndex: 0,
  isComplete: true,
  responses: {
    q1_agent_name: 'DevOps Assistant',
    q2_primary_outcome: 'Automate deployment and monitoring tasks',
    q3_target_audience: ['Developers', 'Customer Support'],
    q4_interaction_style: 'task-focused',
    q5_delivery_channels: ['CLI', 'API', 'Slack/Discord'],
    q6_success_metrics: ['Task completion rate', 'Processing speed', 'Cost efficiency'],
    q7_memory_needs: 'short-term',
    q8_file_access: true,
    q9_web_access: true,
    q10_code_execution: true,
    q11_data_analysis: false,
    q12_tool_integrations: 'GitHub, Docker, Kubernetes',
    q13_runtime_preference: 'hybrid',
    q14_constraints: 'Budget under $500/month, SOC2 compliance',
    q15_additional_notes: 'Integrate with existing CI/CD pipeline',
  },
  requirements: {
    name: 'DevOps Assistant',
    description: 'Agent for: Automate deployment and monitoring tasks',
    primaryOutcome: 'Automate deployment and monitoring tasks',
    targetAudience: ['Developers', 'Customer Support'],
    interactionStyle: 'task-focused',
    deliveryChannels: ['CLI', 'API', 'Slack/Discord'],
    successMetrics: ['Task completion rate', 'Processing speed', 'Cost efficiency'],
    capabilities: {
      memory: 'short-term',
      fileAccess: true,
      webAccess: true,
      codeExecution: true,
      dataAnalysis: false,
      toolIntegrations: ['GitHub', 'Docker', 'Kubernetes'],
    },
    environment: {
      runtime: 'hybrid',
    },
    constraints: ['Budget under $500/month', 'SOC2 compliance'],
    additionalNotes: 'Integrate with existing CI/CD pipeline',
  },
  recommendations: {
    agentType: 'automation-agent',
    requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'docker-client'],
    mcpServers: [
      {
        name: 'github-mcp',
        description: 'GitHub API integration',
        url: 'https://github.mcp.example.com',
        authentication: 'oauth',
      },
    ],
    systemPrompt: 'You are a DevOps assistant specializing in deployment automation and monitoring.',
    toolConfigurations: [
      {
        name: 'deploy',
        description: 'Deploy applications to target environments',
        parameters: {
          type: 'object',
          properties: {
            environment: { type: 'string', enum: ['staging', 'production'] },
            version: { type: 'string' },
          },
          required: ['environment', 'version'],
        },
        requiredPermissions: ['deploy:write'],
      },
    ],
    estimatedComplexity: 'medium',
    implementationSteps: [
      'Set up MCP server connections',
      'Configure deployment tool',
      'Implement monitoring integration',
      'Set up alerting',
    ],
    notes: 'Consider rate limiting for production deployments',
  },
});

/**
 * Collection of all session fixtures
 */
export const ALL_SESSION_FIXTURES = [
  EMPTY_SESSION,
  DISCOVERY_STAGE_SESSION,
  REQUIREMENTS_STAGE_SESSION,
  ARCHITECTURE_STAGE_SESSION,
  OUTPUT_STAGE_SESSION,
  COMPLETED_SESSION,
] as const;

/**
 * Get a session fixture by stage
 */
export function getSessionByStage(stage: InterviewStage): StoredSession {
  switch (stage) {
    case 'discovery':
      return DISCOVERY_STAGE_SESSION;
    case 'requirements':
      return REQUIREMENTS_STAGE_SESSION;
    case 'architecture':
      return ARCHITECTURE_STAGE_SESSION;
    case 'output':
      return OUTPUT_STAGE_SESSION;
    case 'complete':
      return COMPLETED_SESSION;
    default:
      return EMPTY_SESSION;
  }
}
