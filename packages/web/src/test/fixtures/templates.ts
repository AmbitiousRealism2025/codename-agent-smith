import type { AgentTemplate, ToolConfiguration } from '@/types/agent';
import type { DocumentTemplate, DocumentSection } from '@/templates/template-types';

/**
 * Factory function to create a tool configuration fixture
 */
export function createToolConfigFixture(
  overrides: Partial<ToolConfiguration> = {}
): ToolConfiguration {
  return {
    name: 'test-tool',
    description: 'A test tool for unit testing',
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Input parameter' },
      },
      required: ['input'],
    },
    requiredPermissions: ['read'],
    ...overrides,
  };
}

/**
 * Factory function to create an agent template fixture
 */
export function createTemplateFixture(
  overrides: Partial<AgentTemplate> = {}
): AgentTemplate {
  return {
    id: 'test-template',
    name: 'Test Template',
    description: 'A test template for unit testing',
    capabilityTags: ['testing', 'development'],
    idealFor: ['Unit testing', 'Integration testing'],
    systemPrompt: 'You are a test agent for unit testing purposes.',
    defaultTools: [createToolConfigFixture()],
    requiredDependencies: ['@test/dependency'],
    recommendedIntegrations: ['Test API'],
    ...overrides,
  };
}

/**
 * Factory function to create a document section fixture
 */
export function createDocumentSectionFixture(
  overrides: Partial<DocumentSection> = {}
): DocumentSection {
  return {
    title: 'Test Section',
    description: 'A test section for unit testing',
    subsections: ['Subsection 1', 'Subsection 2'],
    contentGuidance: ['Guidance item 1', 'Guidance item 2'],
    examples: ['Example 1', 'Example 2'],
    ...overrides,
  };
}

/**
 * Factory function to create a document template fixture
 */
export function createDocumentTemplateFixture(
  overrides: Partial<DocumentTemplate> = {}
): DocumentTemplate {
  return {
    id: 'test-document-template',
    name: 'Test Document Template',
    description: 'A test document template for unit testing',
    capabilityTags: ['testing', 'development'],
    idealFor: ['Unit testing', 'Integration testing'],
    documentSections: {
      overview: createDocumentSectionFixture({ title: 'Overview' }),
      architecture: createDocumentSectionFixture({ title: 'Architecture' }),
      implementation: createDocumentSectionFixture({ title: 'Implementation' }),
      testing: createDocumentSectionFixture({ title: 'Testing' }),
      deployment: createDocumentSectionFixture({ title: 'Deployment' }),
      monitoring: createDocumentSectionFixture({ title: 'Monitoring' }),
      troubleshooting: createDocumentSectionFixture({ title: 'Troubleshooting' }),
      maintenance: createDocumentSectionFixture({ title: 'Maintenance' }),
    },
    planningChecklist: ['Checklist item 1', 'Checklist item 2'],
    architecturePatterns: ['Pattern 1', 'Pattern 2'],
    riskConsiderations: ['Risk 1', 'Risk 2'],
    successCriteria: ['Criteria 1', 'Criteria 2'],
    implementationGuidance: ['Guidance 1', 'Guidance 2'],
    ...overrides,
  };
}

// Tool Configuration Fixtures

export const READ_FILE_TOOL: ToolConfiguration = createToolConfigFixture({
  name: 'read_file',
  description: 'Read contents of a file',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'File path to read' },
      encoding: { type: 'string', enum: ['utf-8', 'ascii', 'base64'] },
    },
    required: ['path'],
  },
  requiredPermissions: ['file:read'],
});

export const WRITE_FILE_TOOL: ToolConfiguration = createToolConfigFixture({
  name: 'write_file',
  description: 'Write contents to a file',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'File path to write' },
      content: { type: 'string', description: 'Content to write' },
      append: { type: 'boolean', description: 'Append to file' },
    },
    required: ['path', 'content'],
  },
  requiredPermissions: ['file:write'],
});

export const EXECUTE_CODE_TOOL: ToolConfiguration = createToolConfigFixture({
  name: 'execute_code',
  description: 'Execute code in a sandbox',
  parameters: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Code to execute' },
      language: { type: 'string', enum: ['javascript', 'python', 'typescript'] },
      timeout: { type: 'number', description: 'Timeout in milliseconds' },
    },
    required: ['code', 'language'],
  },
  requiredPermissions: ['code:execute'],
});

export const WEB_SEARCH_TOOL: ToolConfiguration = createToolConfigFixture({
  name: 'web_search',
  description: 'Search the web for information',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      maxResults: { type: 'number', description: 'Maximum results to return' },
    },
    required: ['query'],
  },
  requiredPermissions: ['web:read'],
});

export const DATABASE_QUERY_TOOL: ToolConfiguration = createToolConfigFixture({
  name: 'database_query',
  description: 'Execute a database query',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'SQL query to execute' },
      database: { type: 'string', description: 'Database name' },
    },
    required: ['query', 'database'],
  },
  requiredPermissions: ['database:read', 'database:write'],
});

// Agent Template Fixtures

export const MINIMAL_TEMPLATE: AgentTemplate = createTemplateFixture({
  id: 'minimal-template',
  name: 'Minimal Template',
  description: 'A minimal template with no tools',
  capabilityTags: ['minimal'],
  idealFor: ['Simple tasks'],
  defaultTools: [],
  requiredDependencies: [],
  recommendedIntegrations: [],
});

export const CODE_ASSISTANT_TEMPLATE: AgentTemplate = createTemplateFixture({
  id: 'code-assistant-test',
  name: 'Code Assistant Test',
  description: 'Template for code review and development assistance',
  capabilityTags: ['code-review', 'refactoring', 'testing', 'development'],
  idealFor: [
    'Automated code review',
    'Refactoring suggestions',
    'Test generation',
    'Debugging assistance',
  ],
  systemPrompt: 'You are a code assistant specializing in code review, refactoring, and test generation.',
  defaultTools: [READ_FILE_TOOL, WRITE_FILE_TOOL, EXECUTE_CODE_TOOL],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'typescript'],
  recommendedIntegrations: ['GitHub API', 'GitLab API'],
});

export const DATA_ANALYST_TEMPLATE: AgentTemplate = createTemplateFixture({
  id: 'data-analyst-test',
  name: 'Data Analyst Test',
  description: 'Template for data analysis and visualization',
  capabilityTags: ['data-analysis', 'visualization', 'reporting'],
  idealFor: [
    'Dataset analysis',
    'Report generation',
    'Data visualization',
    'Statistical analysis',
  ],
  systemPrompt: 'You are a data analyst specializing in data analysis, visualization, and insight generation.',
  defaultTools: [READ_FILE_TOOL, EXECUTE_CODE_TOOL, DATABASE_QUERY_TOOL],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'pandas', 'matplotlib'],
  recommendedIntegrations: ['PostgreSQL', 'MongoDB', 'S3'],
});

export const RESEARCH_AGENT_TEMPLATE: AgentTemplate = createTemplateFixture({
  id: 'research-agent-test',
  name: 'Research Agent Test',
  description: 'Template for web research and information gathering',
  capabilityTags: ['research', 'web-search', 'summarization'],
  idealFor: [
    'Web research',
    'Information gathering',
    'Content summarization',
    'Competitive analysis',
  ],
  systemPrompt: 'You are a research agent specializing in web research and information synthesis.',
  defaultTools: [WEB_SEARCH_TOOL, READ_FILE_TOOL, WRITE_FILE_TOOL],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk'],
  recommendedIntegrations: ['Google Search API', 'Bing Search API'],
});

export const AUTOMATION_AGENT_TEMPLATE: AgentTemplate = createTemplateFixture({
  id: 'automation-agent-test',
  name: 'Automation Agent Test',
  description: 'Template for task automation and workflow orchestration',
  capabilityTags: ['automation', 'workflow', 'orchestration', 'devops'],
  idealFor: [
    'Task automation',
    'Workflow orchestration',
    'CI/CD pipeline management',
    'Infrastructure automation',
  ],
  systemPrompt: 'You are an automation agent specializing in task automation and workflow orchestration.',
  defaultTools: [EXECUTE_CODE_TOOL, READ_FILE_TOOL, WRITE_FILE_TOOL],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'docker-client'],
  recommendedIntegrations: ['GitHub Actions', 'Jenkins', 'Kubernetes'],
});

export const CONTENT_CREATOR_TEMPLATE: AgentTemplate = createTemplateFixture({
  id: 'content-creator-test',
  name: 'Content Creator Test',
  description: 'Template for content generation and editing',
  capabilityTags: ['content-creation', 'writing', 'editing', 'creative'],
  idealFor: [
    'Blog post writing',
    'Documentation generation',
    'Content editing',
    'Marketing copy',
  ],
  systemPrompt: 'You are a content creator specializing in writing, editing, and content generation.',
  defaultTools: [READ_FILE_TOOL, WRITE_FILE_TOOL, WEB_SEARCH_TOOL],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk'],
  recommendedIntegrations: ['WordPress API', 'Medium API'],
});

/**
 * Collection of all agent template fixtures
 */
export const ALL_TEMPLATE_FIXTURES = [
  MINIMAL_TEMPLATE,
  CODE_ASSISTANT_TEMPLATE,
  DATA_ANALYST_TEMPLATE,
  RESEARCH_AGENT_TEMPLATE,
  AUTOMATION_AGENT_TEMPLATE,
  CONTENT_CREATOR_TEMPLATE,
] as const;

/**
 * Collection of all tool configuration fixtures
 */
export const ALL_TOOL_FIXTURES = [
  READ_FILE_TOOL,
  WRITE_FILE_TOOL,
  EXECUTE_CODE_TOOL,
  WEB_SEARCH_TOOL,
  DATABASE_QUERY_TOOL,
] as const;

/**
 * Get a template fixture by ID
 */
export function getTemplateFixtureById(id: string): AgentTemplate | undefined {
  return ALL_TEMPLATE_FIXTURES.find(template => template.id === id);
}

/**
 * Get template fixtures by capability tag
 */
export function getTemplateFixturesByCapability(tag: string): AgentTemplate[] {
  return ALL_TEMPLATE_FIXTURES.filter(template =>
    template.capabilityTags.includes(tag)
  );
}

/**
 * Get tool fixtures by permission
 */
export function getToolFixturesByPermission(permission: string): ToolConfiguration[] {
  const permissionPrefix = permission.split(':')[0] ?? permission;
  return ALL_TOOL_FIXTURES.filter(tool =>
    tool.requiredPermissions.some(p => p.startsWith(permissionPrefix))
  );
}
