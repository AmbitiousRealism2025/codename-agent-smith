import type { InterviewQuestion, InterviewStage } from './types';

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // Discovery Stage
  {
    id: 'q1_agent_name',
    stage: 'discovery',
    text: 'What is the name of your agent?',
    type: 'text',
    required: true,
    hint: 'Choose a descriptive name that reflects the agent\'s purpose'
  },
  {
    id: 'q2_primary_outcome',
    stage: 'discovery',
    text: 'What is the primary outcome or goal this agent should achieve?',
    type: 'text',
    required: true,
    hint: 'Be specific about what success looks like for this agent'
  },
  {
    id: 'q3_target_audience',
    stage: 'discovery',
    text: 'Who are the target users or audience for this agent?',
    type: 'multiselect',
    required: true,
    options: [
      'Developers',
      'End Users',
      'Business Analysts',
      'Data Scientists',
      'Product Managers',
      'Customer Support',
      'Other'
    ],
    hint: 'Select all that apply'
  },

  // Requirements Stage
  {
    id: 'q4_interaction_style',
    stage: 'requirements',
    text: 'What interaction style should the agent use?',
    type: 'choice',
    required: true,
    options: [
      'conversational',
      'task-focused',
      'collaborative'
    ],
    hint: 'Conversational: friendly dialogue, Task-focused: direct and efficient, Collaborative: partner-like engagement'
  },
  {
    id: 'q5_delivery_channels',
    stage: 'requirements',
    text: 'Through which channels will this agent be accessible?',
    type: 'multiselect',
    required: true,
    options: [
      'CLI',
      'Web Application',
      'Mobile App',
      'IDE Extension',
      'API',
      'Slack/Discord',
      'Other'
    ],
    hint: 'Select all delivery channels you plan to support'
  },
  {
    id: 'q6_success_metrics',
    stage: 'requirements',
    text: 'How will you measure the success of this agent?',
    type: 'multiselect',
    required: true,
    options: [
      'User satisfaction scores',
      'Task completion rate',
      'Response accuracy',
      'Processing speed',
      'Cost efficiency',
      'User engagement',
      'Other'
    ],
    hint: 'Select the most important success metrics'
  },

  // Architecture Stage
  {
    id: 'q7_memory_needs',
    stage: 'architecture',
    text: 'What level of memory capability does the agent need?',
    type: 'choice',
    required: true,
    options: [
      'none',
      'short-term',
      'long-term'
    ],
    hint: 'None: stateless, Short-term: session context, Long-term: persistent across sessions'
  },
  {
    id: 'q8_file_access',
    stage: 'architecture',
    text: 'Does the agent need to access or manipulate files?',
    type: 'boolean',
    required: true,
    hint: 'File operations include reading, writing, or modifying local files'
  },
  {
    id: 'q9_web_access',
    stage: 'architecture',
    text: 'Does the agent need web browsing or API access capabilities?',
    type: 'boolean',
    required: true,
    hint: 'Enable this for agents that need to fetch data from external sources'
  },
  {
    id: 'q10_code_execution',
    stage: 'architecture',
    text: 'Does the agent need to execute code or run scripts?',
    type: 'boolean',
    required: true,
    hint: 'This includes running commands, scripts, or evaluating code'
  },
  {
    id: 'q11_data_analysis',
    stage: 'architecture',
    text: 'Will the agent perform data analysis or processing tasks?',
    type: 'boolean',
    required: true,
    hint: 'Enable for agents that analyze datasets, generate reports, or process data'
  },
  {
    id: 'q12_tool_integrations',
    stage: 'architecture',
    text: 'What external tools or services should the agent integrate with?',
    type: 'text',
    required: false,
    hint: 'Comma-separated list (e.g., GitHub, Jira, Slack, Database)',
    followUp: 'These will be configured as MCP servers or custom tools'
  },

  // Output Stage
  {
    id: 'q13_runtime_preference',
    stage: 'output',
    text: 'Where do you plan to deploy and run this agent?',
    type: 'choice',
    required: true,
    options: [
      'cloud',
      'local',
      'hybrid'
    ],
    hint: 'Cloud: managed services, Local: on-premises, Hybrid: both environments'
  },
  {
    id: 'q14_constraints',
    stage: 'output',
    text: 'Are there any specific constraints or limitations to consider?',
    type: 'text',
    required: false,
    hint: 'Budget limits, compliance requirements, technology restrictions, etc.'
  },
  {
    id: 'q15_additional_notes',
    stage: 'output',
    text: 'Any additional requirements or preferences?',
    type: 'text',
    required: false,
    hint: 'Share any other context that might help configure the agent'
  }
];

/**
 * Stage order for the interview process
 */
export const STAGE_ORDER: InterviewStage[] = ['discovery', 'requirements', 'architecture', 'output', 'complete'];

// Backward compatibility alias for tests
export const QUESTIONS = INTERVIEW_QUESTIONS;
