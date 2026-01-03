import type {
  AgentRequirements,
  AgentRecommendations,
  AgentTemplate,
  MCPServerConfiguration,
  TemplateScore
} from './types';

/**
 * Result from partial archetype classification
 */
export interface PartialArchetypeResult {
  /** The predicted archetype/template ID */
  archetype: string;
  /** The human-readable archetype name */
  archetypeName: string;
  /** Confidence score from 0-100, accounting for data completeness */
  confidence: number;
  /** Raw template score before completeness adjustment */
  rawScore: number;
  /** Percentage of key fields that have been answered */
  dataCompleteness: number;
}

// Note: Templates will need to be imported from a templates module when available
// For now, we define the template-related functions but require templates to be injected
export class AgentClassifier {
  private templates: readonly AgentTemplate[];

  constructor(templates: readonly AgentTemplate[] = []) {
    this.templates = templates;
  }

  /**
   * Classify agent requirements and generate recommendations
   * @param requirements - Agent requirements from interview
   * @returns Full agent recommendations with template, tools, and implementation plan
   */
  classify(requirements: AgentRequirements): AgentRecommendations {
    const scores = this.scoreAllTemplates(requirements);

    // Get best match
    const bestMatch = scores[0];
    if (!bestMatch) {
      throw new Error('No templates available for classification');
    }

    const template = this.templates.find(t => t.id === bestMatch.templateId);

    if (!template) {
      throw new Error(`Template ${bestMatch.templateId} not found`);
    }

    // Generate MCP server recommendations
    const mcpServers = this.generateMCPServers(requirements, template);

    // Customize system prompt based on requirements
    const systemPrompt = this.customizeSystemPrompt(template, requirements);

    // Assess implementation complexity
    const complexity = this.assessComplexity(requirements, template);

    // Generate implementation steps
    const implementationSteps = this.generateImplementationSteps(requirements, template, complexity);

    return {
      agentType: template.id,
      requiredDependencies: template.requiredDependencies,
      mcpServers,
      systemPrompt,
      toolConfigurations: template.defaultTools,
      estimatedComplexity: complexity,
      implementationSteps,
      notes: this.generateNotes(bestMatch, scores.slice(1, 3), requirements)
    };
  }

  /**
   * Get archetype prediction from partial/incomplete interview responses
   * @param partialResponses - Partial responses from interview (key-value pairs)
   * @returns Predicted archetype with confidence score adjusted for data completeness
   */
  getPartialArchetype(partialResponses: Record<string, unknown>): PartialArchetypeResult | null {
    // Handle empty or no templates
    if (this.templates.length === 0) {
      return null;
    }

    // Handle empty responses
    if (!partialResponses || Object.keys(partialResponses).length === 0) {
      // Return default/first template with zero confidence
      const defaultTemplate = this.templates[0];
      if (!defaultTemplate) return null;
      return {
        archetype: defaultTemplate.id,
        archetypeName: defaultTemplate.name,
        confidence: 0,
        rawScore: 0,
        dataCompleteness: 0
      };
    }

    // Build minimal requirements from partial responses
    const minimalRequirements = this.buildMinimalRequirements(partialResponses);

    // Score all templates
    const scores = this.scoreAllTemplates(minimalRequirements);
    const bestMatch = scores[0];

    if (!bestMatch) {
      return null;
    }

    const template = this.templates.find(t => t.id === bestMatch.templateId);
    if (!template) {
      return null;
    }

    // Calculate data completeness (percentage of key fields answered)
    const dataCompleteness = this.calculateDataCompleteness(partialResponses);

    // Adjust confidence based on data completeness
    // More data = higher confidence in the prediction
    const confidence = Math.round(bestMatch.score * (dataCompleteness / 100));

    return {
      archetype: template.id,
      archetypeName: template.name,
      confidence,
      rawScore: bestMatch.score,
      dataCompleteness
    };
  }

  /**
   * Build minimal AgentRequirements from partial interview responses
   * Uses defaults for missing fields
   */
  private buildMinimalRequirements(responses: Record<string, unknown>): AgentRequirements {
    // Default capabilities - use mutable type for memory
    let memoryType: 'none' | 'short-term' | 'long-term' = 'none';

    // Parse memory type from response
    if (responses.q12_memory && typeof responses.q12_memory === 'string') {
      const memoryValue = responses.q12_memory.toLowerCase();
      if (memoryValue.includes('long')) {
        memoryType = 'long-term';
      } else if (memoryValue.includes('short') || memoryValue.includes('session')) {
        memoryType = 'short-term';
      }
    }

    const capabilities = {
      memory: memoryType,
      fileAccess: false,
      webAccess: false,
      codeExecution: false,
      dataAnalysis: false,
      toolIntegrations: [] as string[]
    };

    // Map responses to capabilities
    if (responses.q8_file_access === true || responses.q8_file_access === 'Yes') {
      capabilities.fileAccess = true;
    }
    if (responses.q9_web_access === true || responses.q9_web_access === 'Yes') {
      capabilities.webAccess = true;
    }
    if (responses.q10_code_execution === true || responses.q10_code_execution === 'Yes') {
      capabilities.codeExecution = true;
    }
    if (responses.q11_data_analysis === true || responses.q11_data_analysis === 'Yes') {
      capabilities.dataAnalysis = true;
    }
    if (responses.q13_integrations && Array.isArray(responses.q13_integrations)) {
      capabilities.toolIntegrations = responses.q13_integrations as string[];
    }

    // Build the requirements object with defaults
    return {
      name: (responses.q1_agent_name as string) || 'Unnamed Agent',
      description: (responses.q2_description as string) || '',
      primaryOutcome: (responses.q3_primary_outcome as string) || '',
      targetAudience: Array.isArray(responses.q4_target_audience)
        ? (responses.q4_target_audience as string[])
        : [],
      interactionStyle: this.parseInteractionStyle(responses.q5_interaction_style),
      deliveryChannels: Array.isArray(responses.q6_delivery_channels)
        ? (responses.q6_delivery_channels as string[])
        : [],
      successMetrics: Array.isArray(responses.q7_success_metrics)
        ? (responses.q7_success_metrics as string[])
        : [],
      constraints: Array.isArray(responses.q14_constraints)
        ? (responses.q14_constraints as string[])
        : [],
      capabilities,
      additionalNotes: (responses.q15_additional_notes as string) || undefined
    };
  }

  /**
   * Parse interaction style from response
   */
  private parseInteractionStyle(value: unknown): 'conversational' | 'task-focused' | 'collaborative' {
    if (typeof value !== 'string') return 'task-focused';

    const lower = value.toLowerCase();
    if (lower.includes('conversation')) return 'conversational';
    if (lower.includes('collaborat')) return 'collaborative';
    return 'task-focused';
  }

  /**
   * Calculate data completeness as percentage of key fields answered
   */
  private calculateDataCompleteness(responses: Record<string, unknown>): number {
    // Key fields that significantly impact classification
    const keyFields = [
      'q1_agent_name',
      'q2_description',
      'q3_primary_outcome',
      'q5_interaction_style',
      'q8_file_access',
      'q9_web_access',
      'q10_code_execution',
      'q11_data_analysis',
      'q12_memory'
    ];

    let answeredCount = 0;
    for (const field of keyFields) {
      const value = responses[field];
      if (value !== undefined && value !== null && value !== '') {
        answeredCount++;
      }
    }

    return Math.round((answeredCount / keyFields.length) * 100);
  }

  /**
   * Score all templates against requirements
   * @param requirements - Agent requirements to match
   * @returns Sorted array of template scores (best match first)
   */
  scoreAllTemplates(requirements: AgentRequirements): TemplateScore[] {
    const scores = this.templates.map(template => this.scoreTemplate(template, requirements));
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Score a single template against requirements
   * @param template - Template to score
   * @param requirements - Requirements to match against
   * @returns Template score with reasoning
   */
  scoreTemplate(template: AgentTemplate, requirements: AgentRequirements): TemplateScore {
    let rawScore = 0;
    const matchedCapabilities: string[] = [];
    const missingCapabilities: string[] = [];
    const reasons: string[] = [];

    const capabilityMatchWeight = 10;
    const useCaseMax = 30;
    const interactionMax = 15;

    // Score capability matches (10 points per match)
    const requiredCapabilities = this.extractRequiredCapabilities(requirements);
    const capabilityMatchMax = requiredCapabilities.length * capabilityMatchWeight;
    requiredCapabilities.forEach(cap => {
      if (template.capabilityTags.includes(cap)) {
        matchedCapabilities.push(cap);
        rawScore += capabilityMatchWeight;
      } else {
        missingCapabilities.push(cap);
      }
    });

    // Score use case alignment (30 points max)
    const primaryOutcomeLower = requirements.primaryOutcome.toLowerCase();
    const matchingUseCases = template.idealFor.filter(useCase =>
      primaryOutcomeLower.includes(useCase.toLowerCase()) ||
      useCase.toLowerCase().includes(primaryOutcomeLower)
    );
    if (matchingUseCases.length > 0) {
      const useCaseScore = 15 * Math.min(matchingUseCases.length, 2);
      rawScore += useCaseScore;
      reasons.push(`Matches use cases: ${matchingUseCases.join(', ')}`);
    }

    // Score interaction style alignment (15 points max)
    if (this.matchesInteractionStyle(template, requirements.interactionStyle)) {
      rawScore += interactionMax;
      reasons.push(`Compatible with ${requirements.interactionStyle} interaction style`);
    }

    // Score capability requirements (7 points per requirement)
    const capabilityScore = this.scoreCapabilityRequirements(template, requirements.capabilities);
    rawScore += capabilityScore.score;
    if (capabilityScore.reasons.length > 0) {
      reasons.push(...capabilityScore.reasons);
    }

    const totalPossibleScore = capabilityMatchMax + useCaseMax + interactionMax + capabilityScore.maxScore;
    const normalizedScore = totalPossibleScore > 0
      ? Number(((rawScore / totalPossibleScore) * 100).toFixed(2))
      : 0;

    // Generate reasoning summary
    const reasoning = this.buildReasoningSummary(template, matchedCapabilities, missingCapabilities, reasons);

    return {
      templateId: template.id,
      score: normalizedScore,
      matchedCapabilities,
      missingCapabilities,
      reasoning
    };
  }

  /**
   * Generate MCP server recommendations based on requirements
   */
  generateMCPServers(requirements: AgentRequirements, _template: AgentTemplate): MCPServerConfiguration[] {
    const servers: MCPServerConfiguration[] = [];

    // Web access requirement
    if (requirements.capabilities.webAccess) {
      servers.push({
        name: 'web-fetch',
        description: 'Web content fetching and scraping capabilities',
        url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
        authentication: 'none'
      });
    }

    // File access requirement
    if (requirements.capabilities.fileAccess) {
      servers.push({
        name: 'filesystem',
        description: 'Local filesystem read/write operations',
        url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        authentication: 'none'
      });
    }

    // Data analysis specific (reference example - update with specific server when available)
    if (requirements.capabilities.dataAnalysis) {
      servers.push({
        name: 'data-tools',
        description: 'Statistical analysis and data processing utilities (reference example)',
        url: 'https://github.com/modelcontextprotocol/servers',
        authentication: 'none'
      });
    }

    // Memory requirements
    if (requirements.capabilities.memory === 'long-term') {
      servers.push({
        name: 'memory',
        description: 'Persistent memory and context management',
        url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
        authentication: 'none'
      });
    }

    return servers;
  }

  /**
   * Customize system prompt based on specific requirements
   */
  customizeSystemPrompt(template: AgentTemplate, requirements: AgentRequirements): string {
    let prompt = template.systemPrompt;

    // Add agent name and description
    prompt = `# ${requirements.name}\n\n${requirements.description}\n\n${prompt}`;

    // Add target audience context
    if (requirements.targetAudience.length > 0) {
      prompt += `\n\n## Target Audience\nYou are designed to serve: ${requirements.targetAudience.join(', ')}`;
    }

    // Add primary outcome focus
    prompt += `\n\n## Primary Objective\n${requirements.primaryOutcome}`;

    // Add success metrics
    if (requirements.successMetrics.length > 0) {
      prompt += `\n\n## Success Metrics\nMeasure success by:\n${requirements.successMetrics.map(m => `- ${m}`).join('\n')}`;
    }

    // Add constraints
    if (requirements.constraints && requirements.constraints.length > 0) {
      prompt += `\n\n## Constraints\n${requirements.constraints.map(c => `- ${c}`).join('\n')}`;
    }

    // Add interaction style guidance
    prompt += `\n\n## Interaction Style\nMaintain a ${requirements.interactionStyle} approach in all interactions.`;

    return prompt;
  }

  /**
   * Assess implementation complexity
   */
  assessComplexity(requirements: AgentRequirements, template: AgentTemplate): 'low' | 'medium' | 'high' {
    let complexityScore = 0;

    // Tool count
    if (template.defaultTools.length > 6) complexityScore += 2;
    else if (template.defaultTools.length > 3) complexityScore += 1;

    // Capability requirements
    const capabilities = requirements.capabilities;
    if (capabilities.webAccess) complexityScore += 1;
    if (capabilities.fileAccess) complexityScore += 1;
    if (capabilities.codeExecution) complexityScore += 2;
    if (capabilities.dataAnalysis) complexityScore += 1;
    if (capabilities.memory === 'long-term') complexityScore += 2;
    if (capabilities.memory === 'short-term') complexityScore += 1;

    // Integration count
    if (capabilities.toolIntegrations.length > 3) complexityScore += 2;
    else if (capabilities.toolIntegrations.length > 0) complexityScore += 1;

    // Delivery channels
    if (requirements.deliveryChannels.length > 2) complexityScore += 1;

    // Environment complexity
    if (requirements.environment?.runtime === 'hybrid') complexityScore += 2;
    if (requirements.environment?.complianceRequirements && requirements.environment.complianceRequirements.length > 0) {
      complexityScore += 2;
    }

    // Classify based on score
    if (complexityScore <= 3) return 'low';
    if (complexityScore <= 7) return 'medium';
    return 'high';
  }

  /**
   * Generate implementation steps
   */
  generateImplementationSteps(
    requirements: AgentRequirements,
    template: AgentTemplate,
    complexity: 'low' | 'medium' | 'high'
  ): string[] {
    const steps: string[] = [
      'Initialize project structure with TypeScript and dependencies',
      `Configure ${template.name} template with ${template.defaultTools.length} core tools`,
      'Set up MiniMax API integration with Claude Agent SDK'
    ];

    // Add tool-specific steps
    if (template.defaultTools.length > 0) {
      steps.push(`Implement ${template.defaultTools.length} tool handlers: ${template.defaultTools.map(t => t.name).slice(0, 3).join(', ')}${template.defaultTools.length > 3 ? ', ...' : ''}`);
    }

    // Add capability implementation steps
    const caps = requirements.capabilities;
    if (caps.fileAccess) {
      steps.push('Configure filesystem access and file operation handlers');
    }
    if (caps.webAccess) {
      steps.push('Set up web fetching and content extraction capabilities');
    }
    if (caps.dataAnalysis) {
      steps.push('Implement data processing and analysis utilities');
    }
    if (caps.memory !== 'none') {
      steps.push(`Configure ${caps.memory} memory management system`);
    }

    // Add integration steps
    if (caps.toolIntegrations.length > 0) {
      steps.push(`Integrate with external services: ${caps.toolIntegrations.slice(0, 3).join(', ')}${caps.toolIntegrations.length > 3 ? ', ...' : ''}`);
    }

    // Add testing and validation
    steps.push('Create test suite for tool validation and error handling');
    steps.push('Configure environment variables and deployment settings');

    // Add complexity-specific steps
    if (complexity === 'high') {
      steps.push('Implement comprehensive error recovery and fallback strategies');
      steps.push('Set up monitoring and performance optimization');
    }

    steps.push('Document API usage and deployment instructions');

    return steps;
  }


  /**
   * Generate notes about classification results
   */
  private generateNotes(bestMatch: TemplateScore, alternatives: TemplateScore[], requirements: AgentRequirements): string {
    const notes: string[] = [];

    // Clamp confidence display to 0-100 range
    const confidence = bestMatch.score;
    notes.push(`Selected ${bestMatch.templateId} template with ${confidence.toFixed(0)}% confidence.`);

    if (bestMatch.missingCapabilities.length > 0) {
      notes.push(`Note: Template does not natively support: ${bestMatch.missingCapabilities.join(', ')}. These may require custom implementation.`);
    }

    if (alternatives.length > 0 && alternatives[0] && alternatives[0].score > 50) {
      notes.push(`Alternative options: ${alternatives.map(a => `${a.templateId} (${a.score.toFixed(0)}%)`).join(', ')}`);
    }

    if (requirements.additionalNotes) {
      notes.push(`Additional context: ${requirements.additionalNotes}`);
    }

    return notes.join('\n');
  }

  /**
   * Extract required capabilities from requirements
   */
  private extractRequiredCapabilities(requirements: AgentRequirements): string[] {
    const capabilities: string[] = [];

    // Map capabilities to template tags
    if (requirements.capabilities.fileAccess) capabilities.push('file-access');
    if (requirements.capabilities.webAccess) capabilities.push('web-access');
    if (requirements.capabilities.dataAnalysis) capabilities.push('data-processing', 'statistics', 'visualization', 'reporting');
    if (requirements.capabilities.codeExecution) capabilities.push('code-review', 'testing');

    // Extract from primary outcome with expanded patterns
    const outcome = requirements.primaryOutcome.toLowerCase();

    // Data analysis patterns
    if (/report|statistic|visualiz|chart|graph|metric|data|analys/.test(outcome)) {
      capabilities.push('data-processing', 'statistics', 'visualization', 'reporting');
    }

    // Content creation patterns
    if (/blog|article|seo|market|document|content|writ/.test(outcome)) {
      capabilities.push('content-creation', 'seo', 'formatting');
    }

    // Code assistance patterns
    if (/review|test|refactor|debug|quality|code|develop/.test(outcome)) {
      capabilities.push('code-review', 'testing', 'refactoring');
    }

    // Research patterns
    if (/web|scrape|extract|verify|fact|research|search/.test(outcome)) {
      capabilities.push('research', 'web-search', 'web-scraping', 'fact-checking');
    }

    // Automation patterns
    if (/schedule|orchestrat|queue|task|job|automat|workflow/.test(outcome)) {
      capabilities.push('automation', 'scheduling', 'orchestration');
    }

    return [...new Set(capabilities)]; // Remove duplicates
  }

  /**
   * Check if template matches interaction style
   */
  private matchesInteractionStyle(template: AgentTemplate, style: string): boolean {
    // All templates are flexible, but some are better suited
    const styleMap: Record<string, string[]> = {
      'conversational': ['content-creator', 'research-agent'],
      'task-focused': ['data-analyst', 'code-assistant', 'automation-agent'],
      'collaborative': ['code-assistant', 'content-creator']
    };

    return styleMap[style]?.includes(template.id) ?? true;
  }

  /**
   * Score capability requirements alignment
   */
  private scoreCapabilityRequirements(
    template: AgentTemplate,
    capabilities: AgentRequirements['capabilities']
  ): { score: number; maxScore: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const weightPerCapability = 7;

    const capabilityRequirementKeys: Array<keyof AgentRequirements['capabilities']> = ['fileAccess', 'webAccess', 'dataAnalysis'];
    const maxScore = capabilityRequirementKeys.reduce((total, key) => {
      const value = capabilities[key];
      return typeof value === 'boolean' && value ? total + weightPerCapability : total;
    }, 0);

    // Check if template supports required capabilities (7 points per match)
    const supportsFileAccess = template.capabilityTags.includes('file-access');
    const supportsWebAccess = template.capabilityTags.includes('web-access');
    const supportsDataAnalysis = template.capabilityTags.includes('data-processing');

    if (capabilities.fileAccess && supportsFileAccess) {
      score += weightPerCapability;
      reasons.push('Supports file access');
    }
    if (capabilities.webAccess && supportsWebAccess) {
      score += weightPerCapability;
      reasons.push('Supports web access');
    }
    if (capabilities.dataAnalysis && supportsDataAnalysis) {
      score += weightPerCapability;
      reasons.push('Supports data analysis');
    }

    return { score, maxScore, reasons };
  }

  /**
   * Build reasoning summary
   */
  private buildReasoningSummary(
    _template: AgentTemplate,
    matched: string[],
    missing: string[],
    reasons: string[]
  ): string {
    const parts: string[] = [];

    if (matched.length > 0) {
      parts.push(`Matched capabilities: ${matched.join(', ')}`);
    }
    if (missing.length > 0) {
      parts.push(`Missing capabilities: ${missing.join(', ')}`);
    }
    if (reasons.length > 0) {
      parts.push(...reasons);
    }

    return parts.join('. ') || 'Basic template match';
  }
}
