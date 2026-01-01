import type { Response, ResponseValue, InterviewStage } from '@/types/interview';
import { INTERVIEW_QUESTIONS } from '@/lib/interview/questions';

/**
 * Factory function to create a response fixture
 */
export function createResponseFixture(
  questionId: string,
  value: ResponseValue,
  timestamp?: Date
): Response {
  return {
    questionId,
    value,
    timestamp: timestamp ?? new Date(),
  };
}

// Discovery Stage Responses

export const AGENT_NAME_RESPONSE: Response = createResponseFixture(
  'q1_agent_name',
  'Test Agent'
);

export const PRIMARY_OUTCOME_RESPONSE: Response = createResponseFixture(
  'q2_primary_outcome',
  'Automate code review and provide feedback'
);

export const TARGET_AUDIENCE_RESPONSE: Response = createResponseFixture(
  'q3_target_audience',
  ['Developers', 'Product Managers']
);

// Requirements Stage Responses

export const INTERACTION_STYLE_CONVERSATIONAL: Response = createResponseFixture(
  'q4_interaction_style',
  'conversational'
);

export const INTERACTION_STYLE_TASK_FOCUSED: Response = createResponseFixture(
  'q4_interaction_style',
  'task-focused'
);

export const INTERACTION_STYLE_COLLABORATIVE: Response = createResponseFixture(
  'q4_interaction_style',
  'collaborative'
);

export const DELIVERY_CHANNELS_RESPONSE: Response = createResponseFixture(
  'q5_delivery_channels',
  ['Web Application', 'API', 'CLI']
);

export const SUCCESS_METRICS_RESPONSE: Response = createResponseFixture(
  'q6_success_metrics',
  ['Task completion rate', 'Response accuracy', 'User satisfaction scores']
);

// Architecture Stage Responses

export const MEMORY_NONE_RESPONSE: Response = createResponseFixture(
  'q7_memory_needs',
  'none'
);

export const MEMORY_SHORT_TERM_RESPONSE: Response = createResponseFixture(
  'q7_memory_needs',
  'short-term'
);

export const MEMORY_LONG_TERM_RESPONSE: Response = createResponseFixture(
  'q7_memory_needs',
  'long-term'
);

export const FILE_ACCESS_ENABLED: Response = createResponseFixture(
  'q8_file_access',
  true
);

export const FILE_ACCESS_DISABLED: Response = createResponseFixture(
  'q8_file_access',
  false
);

export const WEB_ACCESS_ENABLED: Response = createResponseFixture(
  'q9_web_access',
  true
);

export const WEB_ACCESS_DISABLED: Response = createResponseFixture(
  'q9_web_access',
  false
);

export const CODE_EXECUTION_ENABLED: Response = createResponseFixture(
  'q10_code_execution',
  true
);

export const CODE_EXECUTION_DISABLED: Response = createResponseFixture(
  'q10_code_execution',
  false
);

export const DATA_ANALYSIS_ENABLED: Response = createResponseFixture(
  'q11_data_analysis',
  true
);

export const DATA_ANALYSIS_DISABLED: Response = createResponseFixture(
  'q11_data_analysis',
  false
);

export const TOOL_INTEGRATIONS_RESPONSE: Response = createResponseFixture(
  'q12_tool_integrations',
  'GitHub, Jira, Slack, PostgreSQL'
);

export const TOOL_INTEGRATIONS_EMPTY: Response = createResponseFixture(
  'q12_tool_integrations',
  ''
);

// Output Stage Responses

export const RUNTIME_CLOUD_RESPONSE: Response = createResponseFixture(
  'q13_runtime_preference',
  'cloud'
);

export const RUNTIME_LOCAL_RESPONSE: Response = createResponseFixture(
  'q13_runtime_preference',
  'local'
);

export const RUNTIME_HYBRID_RESPONSE: Response = createResponseFixture(
  'q13_runtime_preference',
  'hybrid'
);

export const CONSTRAINTS_RESPONSE: Response = createResponseFixture(
  'q14_constraints',
  'Budget under $1000/month, GDPR compliance required'
);

export const CONSTRAINTS_EMPTY: Response = createResponseFixture(
  'q14_constraints',
  ''
);

export const ADDITIONAL_NOTES_RESPONSE: Response = createResponseFixture(
  'q15_additional_notes',
  'Need integration with existing authentication system'
);

export const ADDITIONAL_NOTES_EMPTY: Response = createResponseFixture(
  'q15_additional_notes',
  ''
);

/**
 * Complete set of responses for a full interview
 */
export const COMPLETE_RESPONSES: Record<string, ResponseValue> = {
  q1_agent_name: 'Complete Test Agent',
  q2_primary_outcome: 'Provide comprehensive testing automation',
  q3_target_audience: ['Developers', 'Data Scientists', 'Business Analysts'],
  q4_interaction_style: 'task-focused',
  q5_delivery_channels: ['CLI', 'API', 'Web Application'],
  q6_success_metrics: ['Task completion rate', 'Processing speed', 'Response accuracy'],
  q7_memory_needs: 'short-term',
  q8_file_access: true,
  q9_web_access: true,
  q10_code_execution: true,
  q11_data_analysis: true,
  q12_tool_integrations: 'GitHub, Docker, Kubernetes',
  q13_runtime_preference: 'hybrid',
  q14_constraints: 'Must support offline mode',
  q15_additional_notes: 'Priority on developer experience',
};

/**
 * Minimal required responses (only required questions)
 */
export const MINIMAL_RESPONSES: Record<string, ResponseValue> = {
  q1_agent_name: 'Minimal Agent',
  q2_primary_outcome: 'Basic task automation',
  q3_target_audience: ['Developers'],
  q4_interaction_style: 'task-focused',
  q5_delivery_channels: ['CLI'],
  q6_success_metrics: ['Task completion rate'],
  q7_memory_needs: 'none',
  q8_file_access: false,
  q9_web_access: false,
  q10_code_execution: false,
  q11_data_analysis: false,
  q13_runtime_preference: 'local',
};

/**
 * Responses for a data-focused agent
 */
export const DATA_ANALYST_RESPONSES: Record<string, ResponseValue> = {
  q1_agent_name: 'Data Analyst Bot',
  q2_primary_outcome: 'Analyze datasets and generate insights',
  q3_target_audience: ['Data Scientists', 'Business Analysts'],
  q4_interaction_style: 'collaborative',
  q5_delivery_channels: ['Web Application', 'API'],
  q6_success_metrics: ['Response accuracy', 'User satisfaction scores'],
  q7_memory_needs: 'long-term',
  q8_file_access: true,
  q9_web_access: false,
  q10_code_execution: true,
  q11_data_analysis: true,
  q12_tool_integrations: 'PostgreSQL, MongoDB, S3',
  q13_runtime_preference: 'cloud',
  q14_constraints: 'Data must not leave EU region',
  q15_additional_notes: 'Focus on visualization capabilities',
};

/**
 * Responses for a code assistant agent
 */
export const CODE_ASSISTANT_RESPONSES: Record<string, ResponseValue> = {
  q1_agent_name: 'Code Review Assistant',
  q2_primary_outcome: 'Review code and suggest improvements',
  q3_target_audience: ['Developers'],
  q4_interaction_style: 'task-focused',
  q5_delivery_channels: ['IDE Extension', 'CLI', 'API'],
  q6_success_metrics: ['Response accuracy', 'Processing speed'],
  q7_memory_needs: 'short-term',
  q8_file_access: true,
  q9_web_access: true,
  q10_code_execution: true,
  q11_data_analysis: false,
  q12_tool_integrations: 'GitHub, GitLab, Jira',
  q13_runtime_preference: 'local',
  q14_constraints: '',
  q15_additional_notes: 'Must support TypeScript and Python',
};

/**
 * Get responses for a specific stage
 */
export function getResponsesForStage(stage: InterviewStage): Record<string, ResponseValue> {
  const stageQuestions = INTERVIEW_QUESTIONS.filter(q => q.stage === stage);
  const responses: Record<string, ResponseValue> = {};

  for (const question of stageQuestions) {
    const value = COMPLETE_RESPONSES[question.id];
    if (value !== undefined) {
      responses[question.id] = value;
    }
  }

  return responses;
}

/**
 * Get all responses up to and including a stage
 */
export function getResponsesUpToStage(stage: InterviewStage): Record<string, ResponseValue> {
  const stageOrder: InterviewStage[] = ['discovery', 'requirements', 'architecture', 'output', 'complete'];
  const stageIndex = stageOrder.indexOf(stage);
  const responses: Record<string, ResponseValue> = {};

  for (let i = 0; i <= stageIndex; i++) {
    const currentStage = stageOrder[i];
    if (!currentStage || currentStage === 'complete') continue;

    const stageResponses = getResponsesForStage(currentStage);
    Object.assign(responses, stageResponses);
  }

  return responses;
}

/**
 * Collection of all individual response fixtures
 */
export const ALL_RESPONSE_FIXTURES = [
  AGENT_NAME_RESPONSE,
  PRIMARY_OUTCOME_RESPONSE,
  TARGET_AUDIENCE_RESPONSE,
  INTERACTION_STYLE_CONVERSATIONAL,
  INTERACTION_STYLE_TASK_FOCUSED,
  INTERACTION_STYLE_COLLABORATIVE,
  DELIVERY_CHANNELS_RESPONSE,
  SUCCESS_METRICS_RESPONSE,
  MEMORY_NONE_RESPONSE,
  MEMORY_SHORT_TERM_RESPONSE,
  MEMORY_LONG_TERM_RESPONSE,
  FILE_ACCESS_ENABLED,
  FILE_ACCESS_DISABLED,
  WEB_ACCESS_ENABLED,
  WEB_ACCESS_DISABLED,
  CODE_EXECUTION_ENABLED,
  CODE_EXECUTION_DISABLED,
  DATA_ANALYSIS_ENABLED,
  DATA_ANALYSIS_DISABLED,
  TOOL_INTEGRATIONS_RESPONSE,
  TOOL_INTEGRATIONS_EMPTY,
  RUNTIME_CLOUD_RESPONSE,
  RUNTIME_LOCAL_RESPONSE,
  RUNTIME_HYBRID_RESPONSE,
  CONSTRAINTS_RESPONSE,
  CONSTRAINTS_EMPTY,
  ADDITIONAL_NOTES_RESPONSE,
  ADDITIONAL_NOTES_EMPTY,
] as const;
