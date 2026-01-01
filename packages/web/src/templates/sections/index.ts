import type { DocumentSection } from '../template-types';

export type SectionName =
  | 'overview'
  | 'architecture'
  | 'implementation'
  | 'testing'
  | 'deployment'
  | 'monitoring'
  | 'troubleshooting'
  | 'maintenance';

export const SECTION_TEMPLATES: Record<SectionName, DocumentSection> = {
  overview: {
    title: 'Overview',
    description: 'High-level introduction to the agent and its primary purpose',
    subsections: [
      'Purpose and Goals',
      'Key Capabilities',
      'Target Use Cases',
      'Prerequisites and Requirements'
    ],
    contentGuidance: [
      'Clearly state the agent\'s primary purpose in 1-2 sentences',
      'List 3-5 key capabilities the agent provides',
      'Describe ideal use cases and scenarios',
      'Outline technical prerequisites (Node.js version, API keys, etc.)',
      'Include any domain knowledge or expertise assumptions'
    ],
    examples: [
      'This agent processes CSV data files and generates statistical analysis reports.',
      'Key capabilities: data validation, statistical analysis, visualization generation, report export',
      'Ideal for: data scientists, business analysts, researchers needing automated data processing'
    ]
  },

  architecture: {
    title: 'Architecture',
    description: 'System design, components, and architectural patterns',
    subsections: [
      'System Components',
      'Data Flow',
      'Integration Points',
      'Design Patterns'
    ],
    contentGuidance: [
      'Diagram or describe the major system components',
      'Explain how data flows through the system',
      'Identify external services and APIs the agent integrates with',
      'Document architectural patterns used (MVC, event-driven, etc.)',
      'Describe state management approach',
      'Outline error handling and recovery mechanisms'
    ],
    examples: [
      'Components: input validator → data processor → analysis engine → report generator',
      'Uses event-driven architecture for async processing',
      'Integrates with Claude API for natural language understanding'
    ]
  },

  implementation: {
    title: 'Implementation',
    description: 'Detailed implementation guidance and code organization',
    subsections: [
      'Project Structure',
      'Core Modules',
      'Tool Implementations',
      'Configuration'
    ],
    contentGuidance: [
      'Describe recommended directory structure',
      'Explain purpose of each major module/file',
      'Detail tool implementation requirements',
      'Document configuration options and environment variables',
      'Provide code examples for key functions',
      'Include error handling patterns'
    ],
    examples: [
      'src/tools/ - Tool implementations with Zod schemas',
      'src/processors/ - Core data processing logic',
      'Environment variables: CLAUDE_API_KEY, LOG_LEVEL, DATA_DIR'
    ]
  },

  testing: {
    title: 'Testing',
    description: 'Testing strategy, test cases, and validation procedures',
    subsections: [
      'Testing Strategy',
      'Unit Tests',
      'Integration Tests',
      'End-to-End Tests',
      'Test Data'
    ],
    contentGuidance: [
      'Outline overall testing approach',
      'List critical unit test cases',
      'Describe integration test scenarios',
      'Define end-to-end test workflows',
      'Provide sample test data and fixtures',
      'Document expected test coverage targets'
    ],
    examples: [
      'Unit tests for each tool function with Zod validation',
      'Integration tests for data processing pipeline',
      'E2E tests using sample CSV files in tests/fixtures/'
    ]
  },

  deployment: {
    title: 'Deployment',
    description: 'Deployment procedures and environment setup',
    subsections: [
      'Environment Setup',
      'Build Process',
      'Deployment Steps',
      'Environment Variables'
    ],
    contentGuidance: [
      'List deployment prerequisites',
      'Document build and compilation steps',
      'Provide step-by-step deployment instructions',
      'List all required environment variables',
      'Include configuration examples for different environments (dev, staging, prod)',
      'Document any required secrets or credentials'
    ],
    examples: [
      'npm install && npm run build',
      'Set CLAUDE_API_KEY in production environment',
      'Deploy to serverless function or container'
    ]
  },

  monitoring: {
    title: 'Monitoring',
    description: 'Observability, metrics, and performance monitoring',
    subsections: [
      'Key Metrics',
      'Logging Strategy',
      'Performance Indicators',
      'Alerting'
    ],
    contentGuidance: [
      'Define key performance indicators (KPIs)',
      'Describe logging approach and log levels',
      'List critical metrics to track',
      'Document alerting thresholds and conditions',
      'Include dashboard recommendations',
      'Provide sample monitoring queries or configurations'
    ],
    examples: [
      'Track: request count, error rate, processing time, API usage',
      'Log levels: ERROR for failures, INFO for key operations, DEBUG for troubleshooting',
      'Alert on: error rate >5%, processing time >10s, API quota >80%'
    ]
  },

  troubleshooting: {
    title: 'Troubleshooting',
    description: 'Common issues, debugging procedures, and solutions',
    subsections: [
      'Common Issues',
      'Debugging Procedures',
      'Error Messages',
      'Resolution Steps'
    ],
    contentGuidance: [
      'List common issues users may encounter',
      'Provide diagnostic steps for each issue',
      'Document error messages and their meanings',
      'Include resolution procedures',
      'Add debugging tips and tools',
      'Reference related configuration or implementation sections'
    ],
    examples: [
      'Issue: "Invalid API key" → Check CLAUDE_API_KEY environment variable',
      'Issue: Timeout errors → Increase timeout in config, check API rate limits',
      'Enable DEBUG logging to see detailed request/response data'
    ]
  },

  maintenance: {
    title: 'Maintenance',
    description: 'Ongoing maintenance tasks and update procedures',
    subsections: [
      'Regular Maintenance',
      'Dependency Updates',
      'Performance Optimization',
      'Backup and Recovery'
    ],
    contentGuidance: [
      'List regular maintenance tasks and frequency',
      'Document dependency update procedures',
      'Provide performance tuning recommendations',
      'Describe backup and recovery procedures',
      'Include version upgrade guidelines',
      'Document database or storage maintenance if applicable'
    ],
    examples: [
      'Weekly: Review error logs and performance metrics',
      'Monthly: Update dependencies with npm update',
      'Quarterly: Review and optimize expensive operations',
      'Backup conversation history daily to cloud storage'
    ]
  }
};

export function getSectionTemplate(sectionName: SectionName): DocumentSection {
  const section = SECTION_TEMPLATES[sectionName];
  if (!section) {
    throw new Error(`Unknown section name: ${sectionName}`);
  }
  return section;
}

export function getAllSectionNames(): SectionName[] {
  return Object.keys(SECTION_TEMPLATES) as SectionName[];
}
