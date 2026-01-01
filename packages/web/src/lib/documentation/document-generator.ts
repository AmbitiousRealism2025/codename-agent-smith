import type { AgentRecommendations, AgentRequirements, AgentTemplate } from '@/types/agent';
import { getTemplateById } from '@/templates/index';

export interface PlanningDocumentOptions {
  templateId: string;
  agentName: string;
  requirements: AgentRequirements;
  recommendations: AgentRecommendations;
}

interface PhaseDefinition {
  name: string;
  steps: string[];
}

export class PlanningDocumentGenerator {
  generate(options: PlanningDocumentOptions): string {
    const { templateId, agentName, requirements, recommendations } = options;

    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found. Valid values: data-analyst, content-creator, code-assistant, research-agent, automation-agent`);
    }

    this.validateAgentName(agentName);

    const overviewSection = this.buildOverviewSection(agentName, template.name, template.id, requirements, recommendations);
    const requirementsSection = this.buildRequirementsSection(requirements);
    const architectureSection = this.buildArchitectureSection(template, recommendations);
    const phasesSection = this.buildPhasesSection(recommendations.implementationSteps);
    const securitySection = this.buildSecuritySection(requirements, template);
    const metricsSection = this.buildMetricsSection(requirements.successMetrics);
    const riskSection = this.buildRiskSection(requirements, recommendations);
    const deploymentSection = this.buildDeploymentSection(requirements, recommendations);

    return [
      `# ${agentName} Planning Document`,
      '',
      overviewSection,
      '',
      requirementsSection,
      '',
      architectureSection,
      '',
      phasesSection,
      '',
      securitySection,
      '',
      metricsSection,
      '',
      riskSection,
      '',
      deploymentSection
    ].join('\n');
  }

  private validateAgentName(agentName: string) {
    const validIdentifier = /^[A-Za-z_][A-Za-z0-9_\-\s]{2,}$/;
    if (!agentName || !validIdentifier.test(agentName)) {
      throw new Error('Agent name must be at least three characters and start with a letter or underscore.');
    }
  }

  private buildOverviewSection(
    agentName: string,
    templateName: string,
    templateId: string,
    requirements: AgentRequirements,
    recommendations: AgentRecommendations
  ): string {
    const mcpServers = recommendations.mcpServers.length > 0
      ? recommendations.mcpServers.map(server => `\`${server.name}\``).join(', ')
      : 'None required';

    const integrations = recommendations.toolConfigurations.length > 0
      ? recommendations.toolConfigurations.map(tool => tool.name).join(', ')
      : 'Core template tools only';

    return [
      '## Overview',
      '',
      `- **Agent Name:** ${agentName}`,
      `- **Template:** ${templateName} (\`${templateId}\`)`,
      `- **Primary Outcome:** ${requirements.primaryOutcome}`,
      `- **Target Audience:** ${requirements.targetAudience.join(', ')}`,
      `- **Interaction Style:** ${requirements.interactionStyle}`,
      `- **Delivery Channels:** ${requirements.deliveryChannels.join(', ')}`,
      `- **Estimated Complexity:** ${recommendations.estimatedComplexity}`,
      `- **Recommended MCP Servers:** ${mcpServers}`,
      `- **Planned Tooling:** ${integrations}`
    ].join('\n');
  }

  private buildRequirementsSection(requirements: AgentRequirements): string {
    const constraints = this.formatList(requirements.constraints ?? [], 'No explicit constraints recorded.');
    const technologies = this.formatList(requirements.preferredTechnologies ?? [], 'No technology preferences provided.');
    const notes = requirements.additionalNotes ? requirements.additionalNotes : 'No additional notes captured.';

    return [
      '## Requirements',
      '',
      `- **Description:** ${requirements.description}`,
      '- **Success Metrics:**',
      this.formatList(requirements.successMetrics, 'Defined during project kickoff.'),
      '- **Constraints:**',
      constraints,
      '- **Preferred Technologies:**',
      technologies,
      `- **Capability Expectations:** ${this.describeCapabilities(requirements)}`,
      `- **Additional Notes:** ${notes}`
    ].join('\n');
  }

  private describeCapabilities(requirements: AgentRequirements): string {
    const caps = requirements.capabilities;
    const integrationSummary = caps.toolIntegrations.length > 0 ? caps.toolIntegrations.join(', ') : 'none specified';

    return [
      `Memory: ${caps.memory}`,
      `File Access: ${caps.fileAccess ? 'required' : 'not required'}`,
      `Web Access: ${caps.webAccess ? 'required' : 'not required'}`,
      `Code Execution: ${caps.codeExecution ? 'required' : 'not required'}`,
      `Data Analysis: ${caps.dataAnalysis ? 'required' : 'not required'}`,
      `Tool Integrations: ${integrationSummary}`
    ].join(' | ');
  }

  private buildArchitectureSection(template: AgentTemplate, recommendations: AgentRecommendations): string {
    const toolLines = recommendations.toolConfigurations.map((tool, index) => `${index + 1}. **${tool.name}** - ${tool.description}`);
    const integrations = template.recommendedIntegrations.length > 0
      ? template.recommendedIntegrations.join(', ')
      : 'No external integrations recommended beyond MCP servers.';

    return [
      '## Architecture',
      '',
      '- **Core Capabilities:**',
      this.formatList(template.capabilityTags, 'Template capability tags unavailable.'),
      '',
      '- **Default Tools:**',
      toolLines.length > 0 ? toolLines.join('\n') : 'The selected template does not specify default tools.',
      '',
      '- **Integration Targets:**',
      `  - ${integrations}`
    ].join('\n');
  }

  private buildPhasesSection(implementationSteps: string[]): string {
    const phases = this.createPhases(implementationSteps);

    const section: string[] = ['## Phases', ''];
    phases.forEach((phase, index) => {
      section.push(`${index + 1}. **${phase.name}**`);
      if (phase.steps.length > 0) {
        phase.steps.forEach(step => {
          section.push(`   - ${step}`);
        });
      } else {
        section.push('   - Define detailed tasks with the delivery team.');
      }
      section.push('');
    });

    if (section[section.length - 1] === '') {
      section.pop();
    }

    return section.join('\n');
  }

  private createPhases(steps: string[]): PhaseDefinition[] {
    if (!steps || steps.length === 0) {
      return [
        { name: 'Phase 1 - Foundations', steps: [] },
        { name: 'Phase 2 - Build', steps: [] },
        { name: 'Phase 3 - Validation & Launch', steps: [] }
      ];
    }

    const chunkSize = Math.ceil(steps.length / 3);
    const phases = [
      { name: 'Phase 1 - Foundations', steps: steps.slice(0, chunkSize) },
      { name: 'Phase 2 - Build', steps: steps.slice(chunkSize, chunkSize * 2) },
      { name: 'Phase 3 - Validation & Launch', steps: steps.slice(chunkSize * 2) }
    ];

    return phases.map(phase => ({
      ...phase,
      steps: phase.steps.map(step => this.normalizeStep(step))
    }));
  }

  private normalizeStep(step: string): string {
    return step.replace(/^[0-9]+[.)]\s*/, '').trim();
  }

  private buildSecuritySection(requirements: AgentRequirements, template: { recommendedIntegrations: string[] }): string {
    const compliance = requirements.environment?.complianceRequirements ?? [];
    const constraints = requirements.constraints ?? [];
    const memoryRequirement = requirements.capabilities.memory !== 'none'
      ? 'Implement retention policies aligned with data governance requirements.'
      : 'No persisted memory required; standard logging retention applies.';

    const integrationNotes = template.recommendedIntegrations.length > 0
      ? `Coordinate credential management for: ${template.recommendedIntegrations.join(', ')}.`
      : 'No external integrations requiring credential management identified.';

    const complianceLines = compliance.length > 0
      ? this.formatList(compliance, '')
      : '- No formal compliance requirements reported.';

    const constraintLines = constraints.length > 0
      ? this.formatList(constraints, '')
      : '- No blocking constraints reported.';

    return [
      '## Security',
      '',
      '- **Compliance Obligations:**',
      complianceLines,
      '- **Operational Constraints:**',
      constraintLines,
      `- **Memory Handling:** ${memoryRequirement}`,
      `- **Credential & Secret Strategy:** ${integrationNotes}`
    ].join('\n');
  }

  private buildMetricsSection(metrics: string[]): string {
    return [
      '## Metrics',
      '',
      '- **Success Criteria:**',
      this.formatList(metrics, 'Define quantitative metrics during discovery.')
    ].join('\n');
  }

  private buildRiskSection(requirements: AgentRequirements, recommendations: AgentRecommendations): string {
    const risks: string[] = [];

    if (requirements.capabilities.webAccess && recommendations.mcpServers.every(server => server.name !== 'web-fetch')) {
      risks.push('Web access requested but no web-fetch MCP server configured.');
    }

    if ((requirements.constraints ?? []).length > 0) {
      risks.push('Project constraints may limit tooling or delivery cadence.');
    }

    if (recommendations.notes) {
      recommendations.notes
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .forEach(line => risks.push(line));
    }

    if (risks.length === 0) {
      risks.push('No critical risks identified. Reassess after stakeholder review.');
    }

    return [
      '## Risk',
      '',
      this.formatList(risks, 'No critical risks identified.')
    ].join('\n');
  }

  private buildDeploymentSection(requirements: AgentRequirements, recommendations: AgentRecommendations): string {
    const runtime = requirements.environment?.runtime ?? 'cloud';
    const targets = requirements.environment?.deploymentTargets ?? ['Not specified'];
    const dependencies = recommendations.requiredDependencies.length > 0
      ? recommendations.requiredDependencies
      : ['Template dependencies only'];

    const mcpServerDetails = recommendations.mcpServers.length > 0
      ? recommendations.mcpServers.map(server => `- \`${server.name}\`: ${server.description} (${server.authentication ?? 'authentication: none'})`).join('\n')
      : '- No MCP servers required.';

    return [
      '## Deployment',
      '',
      `- **Runtime Strategy:** ${runtime}`,
      '- **Targets:**',
      this.formatList(targets, 'Deployment targets will be confirmed with stakeholders.'),
      '- **Dependencies:**',
      this.formatList(dependencies, 'Dependencies will be defined during implementation planning.'),
      '- **MCP Server Configuration:**',
      mcpServerDetails
    ].join('\n');
  }

  private formatList(items: string[], fallback: string): string {
    if (!items || items.length === 0) {
      return fallback.startsWith('-') ? fallback : `- ${fallback}`;
    }

    return items.map(item => `- ${item}`).join('\n');
  }
}
