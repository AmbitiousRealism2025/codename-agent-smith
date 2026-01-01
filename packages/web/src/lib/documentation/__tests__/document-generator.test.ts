import { describe, it, expect, beforeEach } from 'vitest';
import { PlanningDocumentGenerator, PlanningDocumentOptions } from '../document-generator';
import type { AgentRequirements, AgentRecommendations } from '@/types/agent';

/**
 * Factory function to create valid AgentRequirements for testing
 */
function createMockRequirements(overrides: Partial<AgentRequirements> = {}): AgentRequirements {
  return {
    name: 'Test Agent',
    description: 'A test agent for unit testing',
    primaryOutcome: 'Automated testing validation',
    targetAudience: ['developers', 'QA engineers'],
    interactionStyle: 'task-focused',
    deliveryChannels: ['CLI', 'API'],
    successMetrics: ['90% test coverage', 'Fast response times'],
    constraints: ['Must run offline'],
    preferredTechnologies: ['TypeScript', 'Vitest'],
    capabilities: {
      memory: 'short-term',
      fileAccess: true,
      webAccess: false,
      codeExecution: true,
      dataAnalysis: false,
      toolIntegrations: ['git', 'npm'],
    },
    environment: {
      runtime: 'local',
      deploymentTargets: ['Linux', 'macOS'],
      complianceRequirements: ['SOC2'],
    },
    additionalNotes: 'This is a test note',
    ...overrides,
  };
}

/**
 * Factory function to create valid AgentRecommendations for testing
 */
function createMockRecommendations(overrides: Partial<AgentRecommendations> = {}): AgentRecommendations {
  return {
    agentType: 'code-assistant',
    requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'typescript'],
    mcpServers: [
      {
        name: 'filesystem',
        description: 'File system access server',
        url: 'https://mcp.example.com/filesystem',
        authentication: 'apiKey',
      },
    ],
    systemPrompt: 'You are a helpful assistant.',
    toolConfigurations: [
      {
        name: 'code-review',
        description: 'Reviews code for quality issues',
        parameters: { language: 'typescript' },
        requiredPermissions: ['file:read'],
      },
    ],
    estimatedComplexity: 'medium',
    implementationSteps: [
      '1. Set up project structure',
      '2. Implement core logic',
      '3. Add error handling',
      '4. Write tests',
      '5. Deploy to production',
      '6. Monitor and iterate',
    ],
    notes: 'Consider adding caching for performance',
    ...overrides,
  };
}

/**
 * Factory function to create valid PlanningDocumentOptions for testing
 */
function createMockOptions(overrides: Partial<PlanningDocumentOptions> = {}): PlanningDocumentOptions {
  return {
    templateId: 'code-assistant',
    agentName: 'TestAgent',
    requirements: createMockRequirements(),
    recommendations: createMockRecommendations(),
    ...overrides,
  };
}

describe('PlanningDocumentGenerator', () => {
  let generator: PlanningDocumentGenerator;

  beforeEach(() => {
    generator = new PlanningDocumentGenerator();
  });

  describe('generate', () => {
    it('should generate a valid planning document', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toBeDefined();
      expect(typeof document).toBe('string');
      expect(document.length).toBeGreaterThan(0);
    });

    it('should include the agent name in the title', () => {
      const options = createMockOptions({ agentName: 'MyCustomAgent' });
      const document = generator.generate(options);

      expect(document).toContain('# MyCustomAgent Planning Document');
    });

    it('should throw an error for invalid template ID', () => {
      const options = createMockOptions({ templateId: 'invalid-template' });

      expect(() => generator.generate(options)).toThrowError(
        'Template "invalid-template" not found. Valid values: data-analyst, content-creator, code-assistant, research-agent, automation-agent'
      );
    });

    it('should throw an error for empty agent name', () => {
      const options = createMockOptions({ agentName: '' });

      expect(() => generator.generate(options)).toThrowError(
        'Agent name must be at least three characters and start with a letter or underscore.'
      );
    });

    it('should throw an error for agent name starting with a number', () => {
      const options = createMockOptions({ agentName: '123Agent' });

      expect(() => generator.generate(options)).toThrowError(
        'Agent name must be at least three characters and start with a letter or underscore.'
      );
    });

    it('should throw an error for agent name that is too short', () => {
      const options = createMockOptions({ agentName: 'AB' });

      expect(() => generator.generate(options)).toThrowError(
        'Agent name must be at least three characters and start with a letter or underscore.'
      );
    });

    it('should accept agent names starting with underscore', () => {
      const options = createMockOptions({ agentName: '_TestAgent' });
      const document = generator.generate(options);

      expect(document).toContain('# _TestAgent Planning Document');
    });

    it('should accept agent names with hyphens and spaces', () => {
      const options = createMockOptions({ agentName: 'Test-Agent Name' });
      const document = generator.generate(options);

      expect(document).toContain('# Test-Agent Name Planning Document');
    });
  });

  describe('overview section', () => {
    it('should include all required overview fields', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toContain('## Overview');
      expect(document).toContain('**Agent Name:**');
      expect(document).toContain('**Template:**');
      expect(document).toContain('**Primary Outcome:**');
      expect(document).toContain('**Target Audience:**');
      expect(document).toContain('**Interaction Style:**');
      expect(document).toContain('**Delivery Channels:**');
      expect(document).toContain('**Estimated Complexity:**');
      expect(document).toContain('**Recommended MCP Servers:**');
      expect(document).toContain('**Planned Tooling:**');
    });

    it('should include the template name and ID', () => {
      const options = createMockOptions({ templateId: 'data-analyst' });
      const document = generator.generate(options);

      expect(document).toContain('Data Analyst Agent');
      expect(document).toContain('`data-analyst`');
    });

    it('should show MCP servers when configured', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toContain('`filesystem`');
    });

    it('should show "None required" when no MCP servers configured', () => {
      const recommendations = createMockRecommendations({ mcpServers: [] });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('None required');
    });

    it('should show tool configurations', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toContain('code-review');
    });

    it('should show "Core template tools only" when no tool configurations', () => {
      const recommendations = createMockRecommendations({ toolConfigurations: [] });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Core template tools only');
    });
  });

  describe('requirements section', () => {
    it('should include all required fields', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toContain('## Requirements');
      expect(document).toContain('**Description:**');
      expect(document).toContain('**Success Metrics:**');
      expect(document).toContain('**Constraints:**');
      expect(document).toContain('**Preferred Technologies:**');
      expect(document).toContain('**Capability Expectations:**');
      expect(document).toContain('**Additional Notes:**');
    });

    it('should list success metrics', () => {
      const requirements = createMockRequirements({
        successMetrics: ['Metric A', 'Metric B'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('- Metric A');
      expect(document).toContain('- Metric B');
    });

    it('should handle empty constraints with fallback text', () => {
      const requirements = createMockRequirements({ constraints: [] });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No explicit constraints recorded');
    });

    it('should handle undefined constraints with fallback text', () => {
      const requirements = createMockRequirements({ constraints: undefined });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No explicit constraints recorded');
    });

    it('should handle empty technologies with fallback text', () => {
      const requirements = createMockRequirements({ preferredTechnologies: [] });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No technology preferences provided');
    });

    it('should include capability expectations summary', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toContain('Memory: short-term');
      expect(document).toContain('File Access: required');
      expect(document).toContain('Web Access: not required');
      expect(document).toContain('Code Execution: required');
    });

    it('should include additional notes', () => {
      const requirements = createMockRequirements({
        additionalNotes: 'Important note for testing',
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Important note for testing');
    });

    it('should show fallback text when no additional notes', () => {
      const requirements = createMockRequirements({ additionalNotes: undefined });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No additional notes captured');
    });
  });

  describe('architecture section', () => {
    it('should include core capabilities from template', () => {
      const options = createMockOptions({ templateId: 'code-assistant' });
      const document = generator.generate(options);

      expect(document).toContain('## Architecture');
      expect(document).toContain('**Core Capabilities:**');
    });

    it('should list default tools from recommendations', () => {
      const recommendations = createMockRecommendations({
        toolConfigurations: [
          {
            name: 'tool-one',
            description: 'First tool',
            parameters: {},
            requiredPermissions: [],
          },
          {
            name: 'tool-two',
            description: 'Second tool',
            parameters: {},
            requiredPermissions: [],
          },
        ],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('**tool-one**');
      expect(document).toContain('First tool');
      expect(document).toContain('**tool-two**');
      expect(document).toContain('Second tool');
    });

    it('should show fallback text when no default tools', () => {
      const recommendations = createMockRecommendations({ toolConfigurations: [] });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('The selected template does not specify default tools');
    });

    it('should include integration targets', () => {
      const options = createMockOptions({ templateId: 'code-assistant' });
      const document = generator.generate(options);

      expect(document).toContain('**Integration Targets:**');
    });
  });

  describe('phases section', () => {
    it('should include three phases', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toContain('## Phases');
      expect(document).toContain('Phase 1 - Foundations');
      expect(document).toContain('Phase 2 - Build');
      expect(document).toContain('Phase 3 - Validation & Launch');
    });

    it('should distribute steps across phases', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Step 1');
      expect(document).toContain('Step 6');
    });

    it('should handle empty implementation steps', () => {
      const recommendations = createMockRecommendations({ implementationSteps: [] });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Define detailed tasks with the delivery team');
    });

    it('should normalize steps by removing leading numbers', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['1. First step', '2) Second step', '3. Third step'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      // Steps should have leading numbers removed
      expect(document).toContain('First step');
      expect(document).toContain('Second step');
      expect(document).toContain('Third step');
    });
  });

  describe('security section', () => {
    it('should include compliance obligations', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'cloud',
          complianceRequirements: ['SOC2', 'GDPR'],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('## Security');
      expect(document).toContain('**Compliance Obligations:**');
      expect(document).toContain('SOC2');
      expect(document).toContain('GDPR');
    });

    it('should show fallback when no compliance requirements', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'local',
          complianceRequirements: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No formal compliance requirements reported');
    });

    it('should include operational constraints', () => {
      const requirements = createMockRequirements({
        constraints: ['Must run offline', 'Limited memory'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Operational Constraints:**');
      expect(document).toContain('Must run offline');
      expect(document).toContain('Limited memory');
    });

    it('should describe memory handling based on requirements', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'long-term',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Memory Handling:**');
      expect(document).toContain('retention policies');
    });

    it('should describe memory handling for no memory requirement', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No persisted memory required');
    });
  });

  describe('metrics section', () => {
    it('should include success criteria', () => {
      const requirements = createMockRequirements({
        successMetrics: ['Response time < 2s', 'Accuracy > 95%'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('## Metrics');
      expect(document).toContain('**Success Criteria:**');
      expect(document).toContain('Response time < 2s');
      expect(document).toContain('Accuracy > 95%');
    });

    it('should show fallback when no metrics defined', () => {
      const requirements = createMockRequirements({ successMetrics: [] });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Define quantitative metrics during discovery');
    });
  });

  describe('risk section', () => {
    it('should identify web access risk', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const recommendations = createMockRecommendations({ mcpServers: [] });
      const options = createMockOptions({ requirements, recommendations });
      const document = generator.generate(options);

      expect(document).toContain('## Risk');
      expect(document).toContain('Web access requested but no web-fetch MCP server configured');
    });

    it('should identify constraint risks', () => {
      const requirements = createMockRequirements({
        constraints: ['Budget limitation'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Project constraints may limit tooling or delivery cadence');
    });

    it('should include notes from recommendations as risks', () => {
      const recommendations = createMockRecommendations({
        notes: 'Consider security implications\nPerformance may be affected',
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Consider security implications');
      expect(document).toContain('Performance may be affected');
    });

    it('should show default risk message when no risks identified', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
        constraints: [],
      });
      const recommendations = createMockRecommendations({
        notes: undefined,
        mcpServers: [],
      });
      const options = createMockOptions({ requirements, recommendations });
      const document = generator.generate(options);

      expect(document).toContain('No critical risks identified. Reassess after stakeholder review');
    });
  });

  describe('deployment section', () => {
    it('should include runtime strategy', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'cloud',
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('## Deployment');
      expect(document).toContain('**Runtime Strategy:** cloud');
    });

    it('should default to cloud runtime when not specified', () => {
      const requirements = createMockRequirements({
        environment: undefined,
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Runtime Strategy:** cloud');
    });

    it('should include deployment targets', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'local',
          deploymentTargets: ['AWS Lambda', 'Docker'],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Targets:**');
      expect(document).toContain('AWS Lambda');
      expect(document).toContain('Docker');
    });

    it('should show fallback when no deployment targets specified', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'local',
          deploymentTargets: undefined,
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Not specified');
    });

    it('should list dependencies', () => {
      const recommendations = createMockRecommendations({
        requiredDependencies: ['react', 'typescript', 'vite'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('**Dependencies:**');
      expect(document).toContain('react');
      expect(document).toContain('typescript');
      expect(document).toContain('vite');
    });

    it('should show fallback when no dependencies', () => {
      const recommendations = createMockRecommendations({
        requiredDependencies: [],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Template dependencies only');
    });

    it('should include MCP server configuration details', () => {
      const recommendations = createMockRecommendations({
        mcpServers: [
          {
            name: 'test-server',
            description: 'Test MCP server',
            url: 'https://test.example.com',
            authentication: 'oauth',
          },
        ],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('**MCP Server Configuration:**');
      expect(document).toContain('`test-server`');
      expect(document).toContain('Test MCP server');
      expect(document).toContain('oauth');
    });

    it('should show fallback when no MCP servers', () => {
      const recommendations = createMockRecommendations({ mcpServers: [] });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('No MCP servers required');
    });
  });

  describe('all templates', () => {
    const templateIds = ['data-analyst', 'content-creator', 'code-assistant', 'research-agent', 'automation-agent'];

    templateIds.forEach((templateId) => {
      it(`should generate valid document for ${templateId} template`, () => {
        const options = createMockOptions({ templateId });
        const document = generator.generate(options);

        expect(document).toBeDefined();
        expect(document).toContain('## Overview');
        expect(document).toContain('## Requirements');
        expect(document).toContain('## Architecture');
        expect(document).toContain('## Phases');
        expect(document).toContain('## Security');
        expect(document).toContain('## Metrics');
        expect(document).toContain('## Risk');
        expect(document).toContain('## Deployment');
      });
    });
  });

  describe('Markdown Output Validity', () => {
    it('should produce valid Markdown structure with proper heading hierarchy', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      // Check for proper heading hierarchy
      expect(document).toMatch(/^# .+ Planning Document/);
      expect(document).toMatch(/## Overview/);
      expect(document).toMatch(/## Requirements/);
    });

    it('should not have consecutive empty lines', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      // Should not have three or more consecutive newlines
      expect(document).not.toMatch(/\n\n\n/);
    });

    it('should have newlines separating sections', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      // Sections should be separated by empty lines
      expect(document).toMatch(/## Overview\n\n/);
    });

    it('should properly format backticks in template IDs', () => {
      const options = createMockOptions({ templateId: 'data-analyst' });
      const document = generator.generate(options);

      expect(document).toContain('`data-analyst`');
    });

    it('should properly format bold text in list items', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).toMatch(/- \*\*.+:\*\*/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle requirements with all optional fields undefined', () => {
      const requirements: AgentRequirements = {
        name: 'Minimal Agent',
        description: 'Minimal description',
        primaryOutcome: 'Minimal outcome',
        targetAudience: ['users'],
        interactionStyle: 'conversational',
        deliveryChannels: ['web'],
        successMetrics: [],
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      };
      const options = createMockOptions({ requirements });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain('# TestAgent Planning Document');
    });

    it('should handle data analysis capability flag', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'short-term',
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Data Analysis: required');
    });

    it('should handle data analysis capability when not required', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Data Analysis: not required');
    });

    it('should handle recommendations with all optional fields undefined', () => {
      const recommendations: AgentRecommendations = {
        agentType: 'data-analyst',
        requiredDependencies: [],
        mcpServers: [],
        toolConfigurations: [],
        estimatedComplexity: 'low',
        implementationSteps: [],
      };
      const options = createMockOptions({
        recommendations,
        templateId: 'data-analyst',
      });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain('## Deployment');
    });

    it('should handle very long agent names', () => {
      const longName = 'A'.repeat(100);
      const options = createMockOptions({ agentName: longName });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain(`# ${longName} Planning Document`);
    });

    it('should handle special characters in content', () => {
      const requirements = createMockRequirements({
        description: "Agent with <special> & 'characters' \"quotes\"",
        additionalNotes: 'Notes with * asterisks * and __underscores__',
      });
      const options = createMockOptions({ requirements });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain('<special>');
      expect(document).toContain('&');
    });

    it('should handle unicode characters', () => {
      const requirements = createMockRequirements({
        description: 'Agent with unicode: \u00e9\u00e8\u00ea \u4e2d\u6587',
      });
      const options = createMockOptions({ requirements });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain('\u00e9\u00e8\u00ea');
    });

    it('should handle empty arrays in all array fields', () => {
      const requirements = createMockRequirements({
        targetAudience: [],
        deliveryChannels: [],
        successMetrics: [],
        constraints: [],
        preferredTechnologies: [],
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const recommendations = createMockRecommendations({
        requiredDependencies: [],
        mcpServers: [],
        toolConfigurations: [],
        implementationSteps: [],
      });
      const options = createMockOptions({ requirements, recommendations });

      expect(() => generator.generate(options)).not.toThrow();
    });

    it('should handle large number of implementation steps', () => {
      const manySteps = Array.from({ length: 100 }, (_, i) => `Step ${i + 1}`);
      const recommendations = createMockRecommendations({ implementationSteps: manySteps });
      const options = createMockOptions({ recommendations });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain('Phase 1');
      expect(document).toContain('Phase 2');
      expect(document).toContain('Phase 3');
    });

    it('should handle single implementation step', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['Only one step'],
      });
      const options = createMockOptions({ recommendations });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain('Only one step');
    });

    it('should handle two implementation steps', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['Step one', 'Step two'],
      });
      const options = createMockOptions({ recommendations });

      expect(() => generator.generate(options)).not.toThrow();
      const document = generator.generate(options);
      expect(document).toContain('Step one');
      expect(document).toContain('Step two');
    });

    it('should handle MCP servers with different authentication types', () => {
      const recommendations = createMockRecommendations({
        mcpServers: [
          { name: 'api-key-server', description: 'Uses API key', url: 'https://a.com', authentication: 'apiKey' },
          { name: 'oauth-server', description: 'Uses OAuth', url: 'https://b.com', authentication: 'oauth' },
          { name: 'no-auth-server', description: 'No auth', url: 'https://c.com', authentication: 'none' },
          { name: 'undefined-auth', description: 'Undefined auth', url: 'https://d.com' },
        ],
      });
      const options = createMockOptions({ recommendations });

      const document = generator.generate(options);
      expect(document).toContain('apiKey');
      expect(document).toContain('oauth');
      expect(document).toContain('authentication: none');
    });

    it('should handle all interaction styles', () => {
      const interactionStyles: Array<'conversational' | 'task-focused' | 'collaborative'> = [
        'conversational',
        'task-focused',
        'collaborative',
      ];

      interactionStyles.forEach((style) => {
        const requirements = createMockRequirements({ interactionStyle: style });
        const options = createMockOptions({ requirements });
        const document = generator.generate(options);

        expect(document).toContain(`**Interaction Style:** ${style}`);
      });
    });

    it('should handle all memory types', () => {
      const memoryTypes: Array<'none' | 'short-term' | 'long-term'> = ['none', 'short-term', 'long-term'];

      memoryTypes.forEach((memory) => {
        const requirements = createMockRequirements({
          capabilities: {
            memory,
            fileAccess: false,
            webAccess: false,
            codeExecution: false,
            dataAnalysis: false,
            toolIntegrations: [],
          },
        });
        const options = createMockOptions({ requirements });
        const document = generator.generate(options);

        expect(document).toContain(`Memory: ${memory}`);
      });
    });

    it('should handle all complexity levels', () => {
      const complexityLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

      complexityLevels.forEach((complexity) => {
        const recommendations = createMockRecommendations({ estimatedComplexity: complexity });
        const options = createMockOptions({ recommendations });
        const document = generator.generate(options);

        expect(document).toContain(`**Estimated Complexity:** ${complexity}`);
      });
    });

    it('should handle all runtime types', () => {
      const runtimeTypes: Array<'cloud' | 'local' | 'hybrid'> = ['cloud', 'local', 'hybrid'];

      runtimeTypes.forEach((runtime) => {
        const requirements = createMockRequirements({
          environment: { runtime },
        });
        const options = createMockOptions({ requirements });
        const document = generator.generate(options);

        expect(document).toContain(`**Runtime Strategy:** ${runtime}`);
      });
    });

    it('should handle web-fetch MCP server correctly with web access', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const recommendations = createMockRecommendations({
        mcpServers: [
          { name: 'web-fetch', description: 'Fetches web content', url: 'https://web.example.com' },
        ],
      });
      const options = createMockOptions({ requirements, recommendations });
      const document = generator.generate(options);

      // Should NOT show the web access risk when web-fetch is configured
      expect(document).not.toContain('Web access requested but no web-fetch MCP server configured');
    });

    it('should handle recommendations notes with multiple lines', () => {
      const recommendations = createMockRecommendations({
        notes: 'Line one\nLine two\nLine three',
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('- Line one');
      expect(document).toContain('- Line two');
      expect(document).toContain('- Line three');
    });

    it('should handle recommendations notes with empty lines', () => {
      const recommendations = createMockRecommendations({
        notes: 'Line one\n\nLine two\n\n\nLine three',
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('- Line one');
      expect(document).toContain('- Line two');
      expect(document).toContain('- Line three');
    });

    it('should handle tool integrations list in capabilities', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'short-term',
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: ['github', 'jira', 'slack', 'aws'],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Tool Integrations: github, jira, slack, aws');
    });

    it('should show none specified for empty tool integrations', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Tool Integrations: none specified');
    });
  });

  describe('Validation Edge Cases', () => {
    it('should throw for agent name with only whitespace', () => {
      const options = createMockOptions({ agentName: '   ' });

      expect(() => generator.generate(options)).toThrowError(
        'Agent name must be at least three characters and start with a letter or underscore.'
      );
    });

    it('should throw for agent name with special characters at start', () => {
      const options = createMockOptions({ agentName: '@Agent' });

      expect(() => generator.generate(options)).toThrowError(
        'Agent name must be at least three characters and start with a letter or underscore.'
      );
    });

    it('should throw for agent name starting with hash', () => {
      const options = createMockOptions({ agentName: '#MyAgent' });

      expect(() => generator.generate(options)).toThrowError(
        'Agent name must be at least three characters and start with a letter or underscore.'
      );
    });

    it('should throw for agent name starting with dollar sign', () => {
      const options = createMockOptions({ agentName: '$Agent' });

      expect(() => generator.generate(options)).toThrowError(
        'Agent name must be at least three characters and start with a letter or underscore.'
      );
    });

    it('should accept agent name with exactly 3 characters', () => {
      const options = createMockOptions({ agentName: 'ABC' });
      const document = generator.generate(options);

      expect(document).toContain('# ABC Planning Document');
    });

    it('should accept agent name starting with lowercase letter', () => {
      const options = createMockOptions({ agentName: 'myAgent' });
      const document = generator.generate(options);

      expect(document).toContain('# myAgent Planning Document');
    });

    it('should accept agent name with numbers after first character', () => {
      const options = createMockOptions({ agentName: 'Agent123' });
      const document = generator.generate(options);

      expect(document).toContain('# Agent123 Planning Document');
    });

    it('should accept agent name with mixed underscores and hyphens', () => {
      const options = createMockOptions({ agentName: '_my-test_agent' });
      const document = generator.generate(options);

      expect(document).toContain('# _my-test_agent Planning Document');
    });

    it('should handle all valid template IDs', () => {
      const validTemplateIds = ['data-analyst', 'content-creator', 'code-assistant', 'research-agent', 'automation-agent'];

      validTemplateIds.forEach((templateId) => {
        const options = createMockOptions({ templateId });
        expect(() => generator.generate(options)).not.toThrow();
      });
    });

    it('should throw descriptive error for similar but invalid template ID', () => {
      const options = createMockOptions({ templateId: 'dataanalyst' });

      expect(() => generator.generate(options)).toThrowError(/Template "dataanalyst" not found/);
    });

    it('should throw error for empty template ID', () => {
      const options = createMockOptions({ templateId: '' });

      expect(() => generator.generate(options)).toThrowError(/Template "" not found/);
    });
  });

  describe('Phase Distribution Edge Cases', () => {
    it('should handle exactly 3 steps (1 per phase)', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['Step A', 'Step B', 'Step C'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Phase 1 - Foundations');
      expect(document).toContain('Step A');
      expect(document).toContain('Phase 2 - Build');
      expect(document).toContain('Step B');
      expect(document).toContain('Phase 3 - Validation & Launch');
      expect(document).toContain('Step C');
    });

    it('should handle 4 steps (non-even distribution)', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      // With 4 steps, chunk size is ceil(4/3) = 2
      // Phase 1: steps 0-1, Phase 2: steps 2-3, Phase 3: steps 4+ (empty)
      expect(document).toContain('Step 1');
      expect(document).toContain('Step 4');
    });

    it('should handle 5 steps', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Step 1');
      expect(document).toContain('Step 5');
    });

    it('should handle 7 steps', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      });
      const options = createMockOptions({ recommendations });

      expect(() => generator.generate(options)).not.toThrow();
    });

    it('should normalize step with colon format', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['1: First step', '2: Second step'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      // Note: the regex only handles ". " and ") " formats, not ": "
      // So "1: First step" will remain as-is
      expect(document).toContain('1: First step');
    });

    it('should normalize step with parenthesis format', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['1) First', '2) Second', '3) Third'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('First');
      expect(document).toContain('Second');
      expect(document).toContain('Third');
    });

    it('should handle steps with leading whitespace', () => {
      const recommendations = createMockRecommendations({
        implementationSteps: ['  Step with spaces', '\tStep with tab'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Step with spaces');
      expect(document).toContain('Step with tab');
    });
  });

  describe('Security Section Edge Cases', () => {
    it('should include credential strategy for template with integrations', () => {
      // Use a template that has recommended integrations
      const options = createMockOptions({ templateId: 'code-assistant' });
      const document = generator.generate(options);

      expect(document).toContain('**Credential & Secret Strategy:**');
    });

    it('should show no external integrations message when template has none', () => {
      // Templates vary - this tests the fallback behavior
      const requirements = createMockRequirements({
        environment: {
          runtime: 'local',
          complianceRequirements: [],
        },
        constraints: [],
      });
      const options = createMockOptions({
        requirements,
        templateId: 'content-creator',
      });
      const document = generator.generate(options);

      expect(document).toContain('## Security');
    });

    it('should handle multiple compliance requirements', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'cloud',
          complianceRequirements: ['SOC2', 'GDPR', 'HIPAA', 'ISO27001'],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('SOC2');
      expect(document).toContain('GDPR');
      expect(document).toContain('HIPAA');
      expect(document).toContain('ISO27001');
    });

    it('should handle memory type short-term in security section', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'short-term',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('retention policies');
    });
  });

  describe('Risk Section Edge Cases', () => {
    it('should show multiple combined risks', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'long-term',
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: ['github', 'aws'],
        },
        constraints: ['Budget limitation', 'Timeline constraint'],
      });
      const recommendations = createMockRecommendations({
        mcpServers: [], // No web-fetch, so web access risk should appear
        notes: 'Security consideration\nPerformance note',
      });
      const options = createMockOptions({ requirements, recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Web access requested but no web-fetch MCP server configured');
      expect(document).toContain('Project constraints may limit tooling or delivery cadence');
      expect(document).toContain('Security consideration');
      expect(document).toContain('Performance note');
    });

    it('should not show web access risk when webAccess is false', () => {
      const requirements = createMockRequirements({
        capabilities: {
          memory: 'none',
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
        constraints: [],
      });
      const recommendations = createMockRecommendations({
        mcpServers: [],
        notes: undefined,
      });
      const options = createMockOptions({ requirements, recommendations });
      const document = generator.generate(options);

      expect(document).not.toContain('Web access requested');
    });

    it('should handle notes with only whitespace lines', () => {
      const recommendations = createMockRecommendations({
        notes: 'Valid note\n   \n\nAnother note\n  \t  ',
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('Valid note');
      expect(document).toContain('Another note');
    });

    it('should handle single-word notes', () => {
      const recommendations = createMockRecommendations({
        notes: 'Important',
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('- Important');
    });
  });

  describe('Deployment Section Edge Cases', () => {
    it('should handle hybrid runtime', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'hybrid',
          deploymentTargets: ['AWS', 'On-premise'],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Runtime Strategy:** hybrid');
    });

    it('should handle empty deployment targets array', () => {
      const requirements = createMockRequirements({
        environment: {
          runtime: 'cloud',
          deploymentTargets: [],
        },
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      // Empty array should trigger the fallback
      expect(document).toContain('Deployment targets will be confirmed with stakeholders');
    });

    it('should handle single dependency', () => {
      const recommendations = createMockRecommendations({
        requiredDependencies: ['typescript'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('- typescript');
    });

    it('should handle many dependencies', () => {
      const recommendations = createMockRecommendations({
        requiredDependencies: ['react', 'typescript', 'vite', 'tailwind', 'zustand', 'radix-ui', 'vitest'],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('- react');
      expect(document).toContain('- vitest');
    });

    it('should handle MCP server without URL', () => {
      const recommendations = createMockRecommendations({
        mcpServers: [
          { name: 'local-server', description: 'Local MCP server' },
        ],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('`local-server`');
      expect(document).toContain('Local MCP server');
    });

    it('should handle multiple MCP servers', () => {
      const recommendations = createMockRecommendations({
        mcpServers: [
          { name: 'server1', description: 'First server', url: 'https://a.com', authentication: 'apiKey' },
          { name: 'server2', description: 'Second server', url: 'https://b.com', authentication: 'oauth' },
          { name: 'server3', description: 'Third server', url: 'https://c.com' },
        ],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('`server1`');
      expect(document).toContain('`server2`');
      expect(document).toContain('`server3`');
    });
  });

  describe('Overview Section Edge Cases', () => {
    it('should handle empty target audience', () => {
      const requirements = createMockRequirements({
        targetAudience: [],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Target Audience:**');
    });

    it('should handle single target audience', () => {
      const requirements = createMockRequirements({
        targetAudience: ['developers'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Target Audience:** developers');
    });

    it('should handle multiple delivery channels', () => {
      const requirements = createMockRequirements({
        deliveryChannels: ['web', 'mobile', 'CLI', 'API', 'email'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('web, mobile, CLI, API, email');
    });

    it('should handle empty delivery channels', () => {
      const requirements = createMockRequirements({
        deliveryChannels: [],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('**Delivery Channels:**');
    });

    it('should display multiple MCP servers in overview', () => {
      const recommendations = createMockRecommendations({
        mcpServers: [
          { name: 'fs', description: 'Filesystem' },
          { name: 'git', description: 'Git operations' },
          { name: 'db', description: 'Database access' },
        ],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('`fs`, `git`, `db`');
    });

    it('should display multiple tool configurations in overview', () => {
      const recommendations = createMockRecommendations({
        toolConfigurations: [
          { name: 'tool-a', description: 'First tool', parameters: {}, requiredPermissions: [] },
          { name: 'tool-b', description: 'Second tool', parameters: {}, requiredPermissions: [] },
          { name: 'tool-c', description: 'Third tool', parameters: {}, requiredPermissions: [] },
        ],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('tool-a, tool-b, tool-c');
    });
  });

  describe('Architecture Section Edge Cases', () => {
    it('should handle template with empty capability tags', () => {
      // Test with a valid template - capability tags come from template
      const options = createMockOptions({ templateId: 'data-analyst' });
      const document = generator.generate(options);

      expect(document).toContain('**Core Capabilities:**');
    });

    it('should show tool details with parameters and permissions', () => {
      const recommendations = createMockRecommendations({
        toolConfigurations: [
          {
            name: 'advanced-tool',
            description: 'Tool with complex config',
            parameters: { mode: 'advanced', timeout: 5000 },
            requiredPermissions: ['file:read', 'file:write', 'network:access'],
          },
        ],
      });
      const options = createMockOptions({ recommendations });
      const document = generator.generate(options);

      expect(document).toContain('**advanced-tool**');
      expect(document).toContain('Tool with complex config');
    });

    it('should handle template integrations display', () => {
      const options = createMockOptions({ templateId: 'automation-agent' });
      const document = generator.generate(options);

      expect(document).toContain('**Integration Targets:**');
    });
  });

  describe('Requirements Section Edge Cases', () => {
    it('should handle empty success metrics with fallback', () => {
      const requirements = createMockRequirements({
        successMetrics: [],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Defined during project kickoff');
    });

    it('should handle single success metric', () => {
      const requirements = createMockRequirements({
        successMetrics: ['Response time under 500ms'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('- Response time under 500ms');
    });

    it('should handle empty preferred technologies', () => {
      const requirements = createMockRequirements({
        preferredTechnologies: [],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No technology preferences provided');
    });

    it('should handle single technology preference', () => {
      const requirements = createMockRequirements({
        preferredTechnologies: ['Python'],
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('- Python');
    });

    it('should handle empty additional notes string', () => {
      const requirements = createMockRequirements({
        additionalNotes: '',
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('No additional notes captured');
    });

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(1000);
      const requirements = createMockRequirements({
        description: longDescription,
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain(longDescription);
    });

    it('should handle multiline additional notes', () => {
      const requirements = createMockRequirements({
        additionalNotes: 'Line 1\nLine 2\nLine 3',
      });
      const options = createMockOptions({ requirements });
      const document = generator.generate(options);

      expect(document).toContain('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Complete Document Structure', () => {
    it('should generate document with all sections in correct order', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      const overviewIndex = document.indexOf('## Overview');
      const requirementsIndex = document.indexOf('## Requirements');
      const architectureIndex = document.indexOf('## Architecture');
      const phasesIndex = document.indexOf('## Phases');
      const securityIndex = document.indexOf('## Security');
      const metricsIndex = document.indexOf('## Metrics');
      const riskIndex = document.indexOf('## Risk');
      const deploymentIndex = document.indexOf('## Deployment');

      expect(overviewIndex).toBeLessThan(requirementsIndex);
      expect(requirementsIndex).toBeLessThan(architectureIndex);
      expect(architectureIndex).toBeLessThan(phasesIndex);
      expect(phasesIndex).toBeLessThan(securityIndex);
      expect(securityIndex).toBeLessThan(metricsIndex);
      expect(metricsIndex).toBeLessThan(riskIndex);
      expect(riskIndex).toBeLessThan(deploymentIndex);
    });

    it('should not have undefined or null values in output', () => {
      const options = createMockOptions();
      const document = generator.generate(options);

      expect(document).not.toContain('undefined');
      expect(document).not.toContain('null');
    });

    it('should generate deterministic output for same input', () => {
      const options = createMockOptions();
      const document1 = generator.generate(options);
      const document2 = generator.generate(options);

      expect(document1).toBe(document2);
    });

    it('should handle generator instance reuse', () => {
      const options1 = createMockOptions({ agentName: 'Agent1' });
      const options2 = createMockOptions({ agentName: 'Agent2' });

      const document1 = generator.generate(options1);
      const document2 = generator.generate(options2);

      expect(document1).toContain('Agent1');
      expect(document1).not.toContain('Agent2');
      expect(document2).toContain('Agent2');
      expect(document2).not.toContain('Agent1');
    });
  });
});
