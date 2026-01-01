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
});
