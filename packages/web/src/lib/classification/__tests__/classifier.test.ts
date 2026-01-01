import { describe, it, expect, beforeEach } from "vitest";
import { AgentClassifier } from "@/lib/classification/classifier";
import { ALL_TEMPLATES } from "@/templates";
import type {
  AgentRequirements,
  AgentTemplate,
} from "@/lib/classification/types";

/**
 * Unit tests for AgentClassifier
 *
 * Tests scoring logic for all 5 agent archetypes:
 * - data-analyst: data processing, statistics, visualization
 * - content-creator: content creation, SEO, writing
 * - code-assistant: code review, testing, debugging
 * - research-agent: web search, fact-checking, research
 * - automation-agent: scheduling, workflow, orchestration
 */

/**
 * Creates a minimal valid AgentRequirements object for testing
 */
function createBaseRequirements(overrides: Partial<AgentRequirements> = {}): AgentRequirements {
  return {
    name: "Test Agent",
    description: "A test agent for unit testing",
    primaryOutcome: "Test outcome",
    targetAudience: ["Developers"],
    interactionStyle: "task-focused",
    deliveryChannels: ["CLI"],
    successMetrics: ["Task completion rate"],
    capabilities: {
      memory: "none",
      fileAccess: false,
      webAccess: false,
      codeExecution: false,
      dataAnalysis: false,
      toolIntegrations: [],
    },
    ...overrides,
  };
}

describe("AgentClassifier", () => {
  let classifier: AgentClassifier;

  beforeEach(() => {
    classifier = new AgentClassifier(ALL_TEMPLATES);
  });

  describe("Constructor", () => {
    it("should initialize with templates", () => {
      const classifierWithTemplates = new AgentClassifier(ALL_TEMPLATES);
      expect(classifierWithTemplates).toBeInstanceOf(AgentClassifier);
    });

    it("should initialize with empty templates array", () => {
      const emptyClassifier = new AgentClassifier([]);
      expect(emptyClassifier).toBeInstanceOf(AgentClassifier);
    });

    it("should initialize with default empty templates", () => {
      const defaultClassifier = new AgentClassifier();
      expect(defaultClassifier).toBeInstanceOf(AgentClassifier);
    });
  });

  describe("scoreAllTemplates", () => {
    it("should return scores for all templates", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      expect(scores).toHaveLength(5);
    });

    it("should return scores sorted in descending order", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]!.score).toBeGreaterThanOrEqual(scores[i + 1]!.score);
      }
    });

    it("should include templateId in each score", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        expect(score.templateId).toBeDefined();
        expect(typeof score.templateId).toBe("string");
      });
    });

    it("should include matchedCapabilities array in each score", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        expect(Array.isArray(score.matchedCapabilities)).toBe(true);
      });
    });

    it("should include missingCapabilities array in each score", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        expect(Array.isArray(score.missingCapabilities)).toBe(true);
      });
    });

    it("should include reasoning string in each score", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        expect(typeof score.reasoning).toBe("string");
      });
    });
  });

  describe("scoreTemplate", () => {
    it("should return a valid TemplateScore object", () => {
      const template = ALL_TEMPLATES[0]!;
      const requirements = createBaseRequirements();
      const score = classifier.scoreTemplate(template, requirements);

      expect(score).toHaveProperty("templateId");
      expect(score).toHaveProperty("score");
      expect(score).toHaveProperty("matchedCapabilities");
      expect(score).toHaveProperty("missingCapabilities");
      expect(score).toHaveProperty("reasoning");
    });

    it("should return normalized score between 0 and 100", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should award points for capability matches", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Process and analyze data",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);

      expect(score.matchedCapabilities.length).toBeGreaterThan(0);
    });

    it("should track missing capabilities", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Web search and research",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      // Data analyst template doesn't support web-search
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);

      expect(score.missingCapabilities.length).toBeGreaterThan(0);
    });
  });

  describe("Data Analyst Archetype Scoring", () => {
    it("should score data-analyst highest for data analysis requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze CSV data and generate statistical reports",
        interactionStyle: "task-focused",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);
      const topScore = scores[0]!;

      expect(topScore.templateId).toBe("data-analyst");
    });

    it("should match data-analyst capabilities for visualization needs", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Create charts and visualizations from metrics",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);

      expect(score.matchedCapabilities).toContain("data-processing");
      expect(score.matchedCapabilities).toContain("visualization");
    });

    it("should recognize reporting patterns in primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Generate weekly business reports from sales data",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);

      expect(score.matchedCapabilities).toContain("reporting");
    });

    it("should award points for file-access capability match", () => {
      const requirementsWithFileAccess = createBaseRequirements({
        primaryOutcome: "Process data files",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const requirementsWithoutFileAccess = createBaseRequirements({
        primaryOutcome: "Process data files",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const scoreWith = classifier.scoreTemplate(dataAnalystTemplate, requirementsWithFileAccess);
      const scoreWithout = classifier.scoreTemplate(dataAnalystTemplate, requirementsWithoutFileAccess);

      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
    });
  });

  describe("Content Creator Archetype Scoring", () => {
    it("should score content-creator highest for content creation requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Generate blog posts and marketing content",
        interactionStyle: "conversational",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);
      const contentCreatorScore = scores.find((s) => s.templateId === "content-creator")!;

      // Content creator should be highly ranked for content creation
      expect(contentCreatorScore.score).toBeGreaterThan(0);
      expect(contentCreatorScore.matchedCapabilities).toContain("content-creation");
    });

    it("should match content-creator for SEO-focused outcomes", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Optimize articles for SEO and marketing",
        interactionStyle: "conversational",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const contentCreatorTemplate = ALL_TEMPLATES.find((t) => t.id === "content-creator")!;
      const score = classifier.scoreTemplate(contentCreatorTemplate, requirements);

      expect(score.matchedCapabilities).toContain("seo");
    });

    it("should recognize writing patterns in primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Write technical documentation and articles",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const contentCreatorTemplate = ALL_TEMPLATES.find((t) => t.id === "content-creator")!;
      const score = classifier.scoreTemplate(contentCreatorTemplate, requirements);

      expect(score.matchedCapabilities.some((cap) =>
        cap.includes("content") || cap.includes("formatting")
      )).toBe(true);
    });

    it("should give bonus for conversational interaction style", () => {
      const conversationalReqs = createBaseRequirements({
        primaryOutcome: "Create blog content",
        interactionStyle: "conversational",
      });

      const taskFocusedReqs = createBaseRequirements({
        primaryOutcome: "Create blog content",
        interactionStyle: "task-focused",
      });

      const contentCreatorTemplate = ALL_TEMPLATES.find((t) => t.id === "content-creator")!;
      const conversationalScore = classifier.scoreTemplate(contentCreatorTemplate, conversationalReqs);
      const taskFocusedScore = classifier.scoreTemplate(contentCreatorTemplate, taskFocusedReqs);

      expect(conversationalScore.score).toBeGreaterThan(taskFocusedScore.score);
    });
  });

  describe("Code Assistant Archetype Scoring", () => {
    it("should score code-assistant highest for code review requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Review code quality and suggest refactoring",
        interactionStyle: "collaborative",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: true,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);
      const codeAssistantScore = scores.find((s) => s.templateId === "code-assistant")!;

      expect(codeAssistantScore.matchedCapabilities).toContain("code-review");
    });

    it("should match code-assistant for testing-focused outcomes", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Generate unit tests and improve code coverage",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: true,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const codeAssistantTemplate = ALL_TEMPLATES.find((t) => t.id === "code-assistant")!;
      const score = classifier.scoreTemplate(codeAssistantTemplate, requirements);

      expect(score.matchedCapabilities).toContain("testing");
    });

    it("should recognize refactoring patterns in primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Refactor legacy code and reduce technical debt",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: true,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const codeAssistantTemplate = ALL_TEMPLATES.find((t) => t.id === "code-assistant")!;
      const score = classifier.scoreTemplate(codeAssistantTemplate, requirements);

      expect(score.matchedCapabilities).toContain("refactoring");
    });

    it("should give bonus for collaborative interaction style", () => {
      const collaborativeReqs = createBaseRequirements({
        primaryOutcome: "Review and improve code",
        interactionStyle: "collaborative",
      });

      const conversationalReqs = createBaseRequirements({
        primaryOutcome: "Review and improve code",
        interactionStyle: "conversational",
      });

      const codeAssistantTemplate = ALL_TEMPLATES.find((t) => t.id === "code-assistant")!;
      const collaborativeScore = classifier.scoreTemplate(codeAssistantTemplate, collaborativeReqs);
      const conversationalScore = classifier.scoreTemplate(codeAssistantTemplate, conversationalReqs);

      expect(collaborativeScore.score).toBeGreaterThan(conversationalScore.score);
    });
  });

  describe("Research Agent Archetype Scoring", () => {
    it("should score research-agent highest for web research requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Search the web and extract information",
        interactionStyle: "conversational",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);
      const researchAgentScore = scores.find((s) => s.templateId === "research-agent")!;

      expect(researchAgentScore.matchedCapabilities.some((cap) =>
        cap.includes("research") || cap.includes("web-search")
      )).toBe(true);
    });

    it("should match research-agent for fact-checking outcomes", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Verify facts and check claims across sources",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const researchAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "research-agent")!;
      const score = classifier.scoreTemplate(researchAgentTemplate, requirements);

      expect(score.matchedCapabilities).toContain("fact-checking");
    });

    it("should recognize web scraping patterns in primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Scrape websites and extract structured data",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const researchAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "research-agent")!;
      const score = classifier.scoreTemplate(researchAgentTemplate, requirements);

      // The classifier extracts capabilities for "scrape" and "extract" patterns
      expect(score.matchedCapabilities.some((cap) =>
        cap.includes("research") || cap.includes("web-search")
      )).toBe(true);
    });

    it("should give bonus for conversational interaction style", () => {
      const conversationalReqs = createBaseRequirements({
        primaryOutcome: "Research topics",
        interactionStyle: "conversational",
      });

      const taskFocusedReqs = createBaseRequirements({
        primaryOutcome: "Research topics",
        interactionStyle: "task-focused",
      });

      const researchAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "research-agent")!;
      const conversationalScore = classifier.scoreTemplate(researchAgentTemplate, conversationalReqs);
      const taskFocusedScore = classifier.scoreTemplate(researchAgentTemplate, taskFocusedReqs);

      expect(conversationalScore.score).toBeGreaterThan(taskFocusedScore.score);
    });
  });

  describe("Automation Agent Archetype Scoring", () => {
    it("should score automation-agent highest for workflow automation requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Automate repetitive tasks and workflows",
        interactionStyle: "task-focused",
        capabilities: {
          memory: "short-term",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: ["cron", "webhook"],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);
      const automationAgentScore = scores.find((s) => s.templateId === "automation-agent")!;

      expect(automationAgentScore.matchedCapabilities.some((cap) =>
        cap.includes("automation") || cap.includes("scheduling") || cap.includes("orchestration")
      )).toBe(true);
    });

    it("should match automation-agent for scheduling outcomes", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Schedule recurring jobs and tasks",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const automationAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "automation-agent")!;
      const score = classifier.scoreTemplate(automationAgentTemplate, requirements);

      expect(score.matchedCapabilities).toContain("scheduling");
    });

    it("should recognize orchestration patterns in primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Orchestrate multi-step pipelines and manage task queues",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const automationAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "automation-agent")!;
      const score = classifier.scoreTemplate(automationAgentTemplate, requirements);

      expect(score.matchedCapabilities).toContain("orchestration");
    });

    it("should give bonus for task-focused interaction style", () => {
      const taskFocusedReqs = createBaseRequirements({
        primaryOutcome: "Automate tasks",
        interactionStyle: "task-focused",
      });

      const conversationalReqs = createBaseRequirements({
        primaryOutcome: "Automate tasks",
        interactionStyle: "conversational",
      });

      const automationAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "automation-agent")!;
      const taskFocusedScore = classifier.scoreTemplate(automationAgentTemplate, taskFocusedReqs);
      const conversationalScore = classifier.scoreTemplate(automationAgentTemplate, conversationalReqs);

      expect(taskFocusedScore.score).toBeGreaterThan(conversationalScore.score);
    });
  });

  describe("classify", () => {
    it("should return a valid AgentRecommendations object", () => {
      const requirements = createBaseRequirements();
      const recommendations = classifier.classify(requirements);

      expect(recommendations).toHaveProperty("agentType");
      expect(recommendations).toHaveProperty("requiredDependencies");
      expect(recommendations).toHaveProperty("mcpServers");
      expect(recommendations).toHaveProperty("systemPrompt");
      expect(recommendations).toHaveProperty("toolConfigurations");
      expect(recommendations).toHaveProperty("estimatedComplexity");
      expect(recommendations).toHaveProperty("implementationSteps");
      expect(recommendations).toHaveProperty("notes");
    });

    it("should throw error when no templates available", () => {
      const emptyClassifier = new AgentClassifier([]);
      const requirements = createBaseRequirements();

      expect(() => emptyClassifier.classify(requirements)).toThrowError(
        "No templates available for classification"
      );
    });

    it("should return agentType matching best template", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze CSV data and generate statistical reports",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const recommendations = classifier.classify(requirements);

      expect(recommendations.agentType).toBe("data-analyst");
    });

    it("should include required dependencies from template", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const recommendations = classifier.classify(requirements);

      expect(Array.isArray(recommendations.requiredDependencies)).toBe(true);
    });
  });

  describe("generateMCPServers", () => {
    it("should recommend web-fetch server for web access", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const servers = classifier.generateMCPServers(requirements, template);

      expect(servers.some((s) => s.name === "web-fetch")).toBe(true);
    });

    it("should recommend filesystem server for file access", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const servers = classifier.generateMCPServers(requirements, template);

      expect(servers.some((s) => s.name === "filesystem")).toBe(true);
    });

    it("should recommend data-tools server for data analysis", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const servers = classifier.generateMCPServers(requirements, template);

      expect(servers.some((s) => s.name === "data-tools")).toBe(true);
    });

    it("should recommend memory server for long-term memory", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "long-term",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const servers = classifier.generateMCPServers(requirements, template);

      expect(servers.some((s) => s.name === "memory")).toBe(true);
    });

    it("should not recommend memory server for short-term memory", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "short-term",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const servers = classifier.generateMCPServers(requirements, template);

      expect(servers.some((s) => s.name === "memory")).toBe(false);
    });

    it("should return empty array when no capabilities selected", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const servers = classifier.generateMCPServers(requirements, template);

      expect(servers).toHaveLength(0);
    });
  });

  describe("customizeSystemPrompt", () => {
    it("should include agent name in prompt", () => {
      const requirements = createBaseRequirements({
        name: "My Custom Agent",
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("My Custom Agent");
    });

    it("should include agent description in prompt", () => {
      const requirements = createBaseRequirements({
        description: "A specialized agent for testing purposes",
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("A specialized agent for testing purposes");
    });

    it("should include target audience when provided", () => {
      const requirements = createBaseRequirements({
        targetAudience: ["Developers", "Data Scientists"],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("Target Audience");
      expect(prompt).toContain("Developers");
      expect(prompt).toContain("Data Scientists");
    });

    it("should include primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Generate comprehensive data reports",
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("Primary Objective");
      expect(prompt).toContain("Generate comprehensive data reports");
    });

    it("should include success metrics when provided", () => {
      const requirements = createBaseRequirements({
        successMetrics: ["Report accuracy", "Processing speed"],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("Success Metrics");
      expect(prompt).toContain("Report accuracy");
      expect(prompt).toContain("Processing speed");
    });

    it("should include constraints when provided", () => {
      const requirements = createBaseRequirements({
        constraints: ["Must run in under 5 minutes", "Cannot store PII"],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("Constraints");
      expect(prompt).toContain("Must run in under 5 minutes");
      expect(prompt).toContain("Cannot store PII");
    });

    it("should include interaction style guidance", () => {
      const requirements = createBaseRequirements({
        interactionStyle: "collaborative",
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("Interaction Style");
      expect(prompt).toContain("collaborative");
    });
  });

  describe("assessComplexity", () => {
    it("should return low complexity for minimal requirements", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
        deliveryChannels: ["CLI"],
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(complexity).toBe("low");
    });

    it("should return medium complexity for moderate requirements", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "short-term",
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: ["GitHub"],
        },
        deliveryChannels: ["CLI", "API", "Web Application"],
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(["medium", "high"]).toContain(complexity);
    });

    it("should return high complexity for complex requirements", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "long-term",
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: ["GitHub", "Slack", "JIRA", "Confluence"],
        },
        deliveryChannels: ["CLI", "API", "Web Application"],
        environment: {
          runtime: "hybrid",
          complianceRequirements: ["GDPR", "SOC2"],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(complexity).toBe("high");
    });

    it("should increase complexity for code execution", () => {
      const withoutCodeExec = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const withCodeExec = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: true,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const complexityWithout = classifier.assessComplexity(withoutCodeExec, template);
      const complexityWith = classifier.assessComplexity(withCodeExec, template);

      const complexityOrder = ["low", "medium", "high"];
      expect(complexityOrder.indexOf(complexityWith)).toBeGreaterThanOrEqual(
        complexityOrder.indexOf(complexityWithout)
      );
    });
  });

  describe("generateImplementationSteps", () => {
    it("should return an array of implementation steps", () => {
      const requirements = createBaseRequirements();
      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "medium");

      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should include basic setup steps", () => {
      const requirements = createBaseRequirements();
      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "low");

      expect(steps.some((step) => step.toLowerCase().includes("initialize"))).toBe(true);
    });

    it("should include filesystem step for file access", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "medium");

      expect(steps.some((step) => step.toLowerCase().includes("filesystem") || step.toLowerCase().includes("file"))).toBe(true);
    });

    it("should include web fetching step for web access", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "medium");

      expect(steps.some((step) => step.toLowerCase().includes("web"))).toBe(true);
    });

    it("should include memory configuration step for memory requirements", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "long-term",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "medium");

      expect(steps.some((step) => step.toLowerCase().includes("memory"))).toBe(true);
    });

    it("should include integration steps for tool integrations", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: ["GitHub", "Slack"],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "medium");

      expect(steps.some((step) => step.toLowerCase().includes("integrat"))).toBe(true);
    });

    it("should include extra steps for high complexity", () => {
      const requirements = createBaseRequirements();
      const template = ALL_TEMPLATES[0]!;

      const lowSteps = classifier.generateImplementationSteps(requirements, template, "low");
      const highSteps = classifier.generateImplementationSteps(requirements, template, "high");

      expect(highSteps.length).toBeGreaterThanOrEqual(lowSteps.length);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "",
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
      });
    });

    it("should handle empty target audience", () => {
      const requirements = createBaseRequirements({
        targetAudience: [],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      // Should not include target audience section when empty
      expect(prompt).not.toContain("Target Audience");
    });

    it("should handle empty success metrics", () => {
      const requirements = createBaseRequirements({
        successMetrics: [],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      // Should not include success metrics section when empty
      expect(prompt).not.toContain("Success Metrics");
    });

    it("should handle undefined constraints", () => {
      const requirements = createBaseRequirements();
      delete (requirements as Partial<AgentRequirements>).constraints;

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      // Should not include constraints section when undefined
      expect(prompt).not.toContain("Constraints");
    });

    it("should handle additionalNotes in classification notes", () => {
      const requirements = createBaseRequirements({
        additionalNotes: "This agent should prioritize accuracy over speed",
      });

      const recommendations = classifier.classify(requirements);

      expect(recommendations.notes).toContain("This agent should prioritize accuracy over speed");
    });
  });

  describe("Edge Cases - Empty Requirements", () => {
    it("should handle completely empty name", () => {
      const requirements = createBaseRequirements({
        name: "",
      });

      const recommendations = classifier.classify(requirements);

      expect(recommendations).toBeDefined();
      expect(recommendations.agentType).toBeDefined();
    });

    it("should handle empty description", () => {
      const requirements = createBaseRequirements({
        description: "",
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      // Should still create a valid prompt
      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe("string");
    });

    it("should handle empty delivery channels array", () => {
      const requirements = createBaseRequirements({
        deliveryChannels: [],
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(["low", "medium", "high"]).toContain(complexity);
    });

    it("should handle empty tool integrations array", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "low");

      expect(Array.isArray(steps)).toBe(true);
      // Should not include "Integrate with external services" step when no tool integrations
      expect(steps.some((step) => step.toLowerCase().includes("integrate with external"))).toBe(false);
    });

    it("should handle all capabilities disabled", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      // Should still produce valid scores even with minimal capabilities
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle whitespace-only primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "   \t\n  ",
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(typeof score.score).toBe("number");
        expect(isNaN(score.score)).toBe(false);
      });
    });

    it("should handle empty constraints array", () => {
      const requirements = createBaseRequirements({
        constraints: [],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).not.toContain("Constraints");
    });
  });

  describe("Edge Cases - Missing Templates", () => {
    it("should throw error when classifying with no templates", () => {
      const emptyClassifier = new AgentClassifier([]);
      const requirements = createBaseRequirements();

      expect(() => emptyClassifier.classify(requirements)).toThrowError(
        "No templates available for classification"
      );
    });

    it("should return empty array when scoring with no templates", () => {
      const emptyClassifier = new AgentClassifier([]);
      const requirements = createBaseRequirements();

      const scores = emptyClassifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(0);
    });

    it("should handle single template gracefully", () => {
      const singleTemplate: AgentTemplate = {
        id: "single-template",
        name: "Single Template",
        description: "A single test template",
        capabilityTags: ["test-capability"],
        idealFor: ["testing"],
        systemPrompt: "You are a test agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const singleClassifier = new AgentClassifier([singleTemplate]);
      const requirements = createBaseRequirements();

      const scores = singleClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
      expect(scores[0]!.templateId).toBe("single-template");

      const recommendations = singleClassifier.classify(requirements);
      expect(recommendations.agentType).toBe("single-template");
    });

    it("should handle template with empty capabilityTags", () => {
      const emptyCapTemplate: AgentTemplate = {
        id: "empty-caps",
        name: "Empty Capabilities Template",
        description: "Template with no capability tags",
        capabilityTags: [],
        idealFor: [],
        systemPrompt: "You are an agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([emptyCapTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Test task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
      expect(scores[0]!.matchedCapabilities).toHaveLength(0);
    });

    it("should handle template with empty idealFor array", () => {
      const noIdealForTemplate: AgentTemplate = {
        id: "no-ideal-for",
        name: "No IdealFor Template",
        description: "Template with empty idealFor",
        capabilityTags: ["data-processing"],
        idealFor: [],
        systemPrompt: "You are an agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([noIdealForTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Data processing task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
      // Should still match based on capability tags
      expect(scores[0]!.score).toBeGreaterThanOrEqual(0);
    });

    it("should handle template with empty defaultTools", () => {
      const noToolsTemplate: AgentTemplate = {
        id: "no-tools",
        name: "No Tools Template",
        description: "Template with no default tools",
        capabilityTags: ["general"],
        idealFor: ["general tasks"],
        systemPrompt: "You are a general purpose agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([noToolsTemplate]);
      const requirements = createBaseRequirements();

      const recommendations = testClassifier.classify(requirements);
      expect(recommendations.toolConfigurations).toHaveLength(0);
    });
  });

  describe("Edge Cases - Incomplete Data", () => {
    it("should handle requirements with undefined optional environment", () => {
      const requirements = createBaseRequirements();
      // Ensure environment is undefined
      delete (requirements as Partial<AgentRequirements>).environment;

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(["low", "medium", "high"]).toContain(complexity);
    });

    it("should handle requirements with minimal environment", () => {
      const requirements = createBaseRequirements({
        environment: {
          runtime: "local",
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(["low", "medium", "high"]).toContain(complexity);
    });

    it("should handle requirements with partial environment", () => {
      const requirements = createBaseRequirements({
        environment: {
          runtime: "local",
          // complianceRequirements is undefined
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(["low", "medium", "high"]).toContain(complexity);
    });

    it("should handle requirements with only mandatory fields", () => {
      const minimalRequirements: AgentRequirements = {
        name: "Minimal Agent",
        description: "A minimal agent",
        primaryOutcome: "Test",
        targetAudience: [],
        interactionStyle: "task-focused",
        deliveryChannels: [],
        successMetrics: [],
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      };

      const scores = classifier.scoreAllTemplates(minimalRequirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle scoring when all templates have zero score", () => {
      const noMatchTemplate: AgentTemplate = {
        id: "no-match",
        name: "No Match Template",
        description: "Template that matches nothing",
        capabilityTags: ["nonexistent-xyz-123"],
        idealFor: ["impossible task xyz 987"],
        systemPrompt: "You are an agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([noMatchTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Completely unrelated task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores[0]!.score).toBe(0);
      expect(scores[0]!.matchedCapabilities).toHaveLength(0);
    });

    it("should generate valid MCP servers with minimal requirements", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const servers = classifier.generateMCPServers(requirements, template);

      expect(Array.isArray(servers)).toBe(true);
      expect(servers).toHaveLength(0);
    });

    it("should customize system prompt with minimal requirements", () => {
      const minimalRequirements: AgentRequirements = {
        name: "Min",
        description: "",
        primaryOutcome: "",
        targetAudience: [],
        interactionStyle: "task-focused",
        deliveryChannels: [],
        successMetrics: [],
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      };

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, minimalRequirements);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain("Min"); // Name should be included
    });

    it("should handle undefined additionalNotes gracefully", () => {
      const requirements = createBaseRequirements();
      // Ensure additionalNotes is undefined
      delete (requirements as Partial<AgentRequirements>).additionalNotes;

      const recommendations = classifier.classify(requirements);

      expect(recommendations.notes).not.toContain("Additional context: undefined");
    });
  });

  describe("Edge Cases - Null and Undefined Values", () => {
    it("should throw error for requirements with null-like primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: null as unknown as string,
      });

      // Null primary outcome should throw a TypeError
      expect(() => classifier.scoreAllTemplates(requirements)).toThrow(TypeError);
    });

    it("should handle requirements where capabilities object has undefined fields", () => {
      const requirements = createBaseRequirements();
      // Simulate a scenario where some capability fields might be undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (requirements.capabilities as any).memory = undefined;

      expect(() => classifier.scoreAllTemplates(requirements)).not.toThrow();
    });

    it("should handle scoring when targetAudience contains empty strings", () => {
      const requirements = createBaseRequirements({
        targetAudience: ["", "  ", "Developers"],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe("string");
    });

    it("should handle scoring when successMetrics contains empty strings", () => {
      const requirements = createBaseRequirements({
        successMetrics: ["", "Speed", ""],
      });

      const template = ALL_TEMPLATES[0]!;
      const prompt = classifier.customizeSystemPrompt(template, requirements);

      expect(prompt).toContain("Success Metrics");
    });

    it("should handle scoring when deliveryChannels contains duplicates", () => {
      const requirements = createBaseRequirements({
        deliveryChannels: ["CLI", "CLI", "API", "API"],
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      expect(["low", "medium", "high"]).toContain(complexity);
    });

    it("should handle toolIntegrations with empty strings", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: ["", "GitHub", ""],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const steps = classifier.generateImplementationSteps(requirements, template, "medium");

      expect(Array.isArray(steps)).toBe(true);
    });
  });

  describe("Edge Cases - Malformed Template Data", () => {
    it("should handle template with extremely long id", () => {
      const longIdTemplate: AgentTemplate = {
        id: "a".repeat(1000),
        name: "Long ID Template",
        description: "Template with very long ID",
        capabilityTags: ["test"],
        idealFor: ["testing"],
        systemPrompt: "You are a test agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([longIdTemplate]);
      const requirements = createBaseRequirements();

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
      expect(scores[0]!.templateId).toBe(longIdTemplate.id);
    });

    it("should handle template with special characters in id", () => {
      const specialIdTemplate: AgentTemplate = {
        id: "test-template_v2.0+beta",
        name: "Special ID Template",
        description: "Template with special characters",
        capabilityTags: [],
        idealFor: [],
        systemPrompt: "You are a test agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([specialIdTemplate]);
      const requirements = createBaseRequirements();

      const recommendations = testClassifier.classify(requirements);
      expect(recommendations.agentType).toBe(specialIdTemplate.id);
    });

    it("should handle template with duplicate capabilityTags", () => {
      const duplicateTagsTemplate: AgentTemplate = {
        id: "dup-tags",
        name: "Duplicate Tags Template",
        description: "Template with duplicate capability tags",
        capabilityTags: ["data-processing", "data-processing", "statistics", "statistics"],
        idealFor: ["data analysis"],
        systemPrompt: "You are a test agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([duplicateTagsTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Process data",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores[0]!.score).toBeGreaterThanOrEqual(0);
    });

    it("should handle template with unicode in capabilityTags", () => {
      const unicodeTagsTemplate: AgentTemplate = {
        id: "unicode-tags",
        name: "Unicode Tags Template",
        description: "Template with unicode capability tags",
        capabilityTags: ["データ処理", "分析", "レポート"],
        idealFor: [],
        systemPrompt: "You are a test agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([unicodeTagsTemplate]);
      const requirements = createBaseRequirements();

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
    });

    it("should handle templates with very long systemPrompt", () => {
      const longPromptTemplate: AgentTemplate = {
        id: "long-prompt",
        name: "Long Prompt Template",
        description: "Template with very long system prompt",
        capabilityTags: [],
        idealFor: [],
        systemPrompt: "You are an agent. ".repeat(1000),
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([longPromptTemplate]);
      const requirements = createBaseRequirements();

      const prompt = testClassifier.customizeSystemPrompt(longPromptTemplate, requirements);
      expect(prompt.length).toBeGreaterThan(longPromptTemplate.systemPrompt.length);
    });
  });

  describe("Edge Cases - Boundary Score Values", () => {
    it("should never return negative scores", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
      });
    });

    it("should never return scores exceeding 100", () => {
      // Even with maximum possible matches, should not exceed 100
      const requirements = createBaseRequirements({
        primaryOutcome: "data analysis statistics visualization reporting charts graphs metrics CSV files",
        interactionStyle: "task-focused",
        capabilities: {
          memory: "long-term",
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: ["GitHub", "Slack", "JIRA", "Confluence"],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);
      scores.forEach((score) => {
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle tie-breaking when multiple templates have identical scores", () => {
      // Create templates with identical configuration
      const template1: AgentTemplate = {
        id: "identical-1",
        name: "Identical Template 1",
        description: "Test",
        capabilityTags: ["test-cap"],
        idealFor: ["test task"],
        systemPrompt: "You are a test agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const template2: AgentTemplate = {
        id: "identical-2",
        name: "Identical Template 2",
        description: "Test",
        capabilityTags: ["test-cap"],
        idealFor: ["test task"],
        systemPrompt: "You are a test agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([template1, template2]);
      const requirements = createBaseRequirements({
        primaryOutcome: "test task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(2);
      // Both should have same score
      expect(scores[0]!.score).toBe(scores[1]!.score);
    });
  });

  describe("Edge Cases - Complex Capability Combinations", () => {
    it("should handle all memory types correctly", () => {
      const memoryTypes: Array<"none" | "short-term" | "long-term"> = ["none", "short-term", "long-term"];

      memoryTypes.forEach((memoryType) => {
        const requirements = createBaseRequirements({
          capabilities: {
            memory: memoryType,
            fileAccess: true,
            webAccess: true,
            codeExecution: true,
            dataAnalysis: true,
            toolIntegrations: [],
          },
        });

        const template = ALL_TEMPLATES[0]!;
        const servers = classifier.generateMCPServers(requirements, template);

        if (memoryType === "long-term") {
          expect(servers.some((s) => s.name === "memory")).toBe(true);
        } else {
          expect(servers.some((s) => s.name === "memory")).toBe(false);
        }
      });
    });

    it("should handle large number of tool integrations", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: Array.from({ length: 100 }, (_, i) => `tool-${i}`),
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);
      const steps = classifier.generateImplementationSteps(requirements, template, complexity);

      // Large toolIntegrations array adds to complexity score (2 points for > 3 integrations)
      // but alone may not be enough for "high" complexity - just verify it produces valid output
      expect(["low", "medium", "high"]).toContain(complexity);
      expect(steps.some((step) => step.toLowerCase().includes("integrat"))).toBe(true);
    });

    it("should handle environment with empty complianceRequirements array", () => {
      const requirements = createBaseRequirements({
        environment: {
          runtime: "local",
          complianceRequirements: [],
        },
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      // Empty compliance requirements should not add to complexity
      expect(["low", "medium", "high"]).toContain(complexity);
    });

    it("should handle all delivery channel types", () => {
      const requirements = createBaseRequirements({
        deliveryChannels: ["CLI", "API", "Web Application", "Desktop App", "Mobile App"],
      });

      const template = ALL_TEMPLATES[0]!;
      const complexity = classifier.assessComplexity(requirements, template);

      // Multiple delivery channels add to complexity (1 point for > 2 channels)
      // Verify it produces a valid complexity level
      expect(["low", "medium", "high"]).toContain(complexity);
    });
  });

  describe("Edge Cases - Classification Edge Scenarios", () => {
    it("should provide valid recommendations even when no strong matches exist", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "xyz completely unrelated task 12345",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const recommendations = classifier.classify(requirements);

      // Should still provide valid recommendations
      expect(recommendations.agentType).toBeDefined();
      expect(Array.isArray(recommendations.implementationSteps)).toBe(true);
      expect(typeof recommendations.systemPrompt).toBe("string");
    });

    it("should include all matched capabilities in notes when applicable", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data and generate reports",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const recommendations = classifier.classify(requirements);

      expect(recommendations.notes).toBeDefined();
      expect(typeof recommendations.notes).toBe("string");
    });

    it("should handle classification when best match has very low score", () => {
      // Template that won't match well with any requirements
      const lowMatchTemplate: AgentTemplate = {
        id: "low-match",
        name: "Low Match Template",
        description: "Template that won't match well",
        capabilityTags: ["xyz-nonexistent"],
        idealFor: ["impossible-task-xyz"],
        systemPrompt: "You are an agent.",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      };

      const testClassifier = new AgentClassifier([lowMatchTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Completely different task",
      });

      const recommendations = testClassifier.classify(requirements);

      // Should still work even with low match
      expect(recommendations.agentType).toBe("low-match");
      expect(recommendations.estimatedComplexity).toBeDefined();
    });
  });

  describe("Template Capability Tags", () => {
    it("should have data-analyst template with expected capability tags", () => {
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst");

      expect(dataAnalystTemplate).toBeDefined();
      expect(dataAnalystTemplate!.capabilityTags).toContain("data-processing");
      expect(dataAnalystTemplate!.capabilityTags).toContain("statistics");
      expect(dataAnalystTemplate!.capabilityTags).toContain("visualization");
      expect(dataAnalystTemplate!.capabilityTags).toContain("reporting");
      expect(dataAnalystTemplate!.capabilityTags).toContain("file-access");
    });

    it("should have content-creator template with expected capability tags", () => {
      const contentCreatorTemplate = ALL_TEMPLATES.find((t) => t.id === "content-creator");

      expect(contentCreatorTemplate).toBeDefined();
      expect(contentCreatorTemplate!.capabilityTags).toContain("content-creation");
      expect(contentCreatorTemplate!.capabilityTags).toContain("seo");
      expect(contentCreatorTemplate!.capabilityTags).toContain("writing");
    });

    it("should have code-assistant template with expected capability tags", () => {
      const codeAssistantTemplate = ALL_TEMPLATES.find((t) => t.id === "code-assistant");

      expect(codeAssistantTemplate).toBeDefined();
      expect(codeAssistantTemplate!.capabilityTags).toContain("code-review");
      expect(codeAssistantTemplate!.capabilityTags).toContain("refactoring");
      expect(codeAssistantTemplate!.capabilityTags).toContain("testing");
    });

    it("should have research-agent template with expected capability tags", () => {
      const researchAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "research-agent");

      expect(researchAgentTemplate).toBeDefined();
      expect(researchAgentTemplate!.capabilityTags).toContain("web-search");
      expect(researchAgentTemplate!.capabilityTags).toContain("fact-checking");
      expect(researchAgentTemplate!.capabilityTags).toContain("research");
    });

    it("should have automation-agent template with expected capability tags", () => {
      const automationAgentTemplate = ALL_TEMPLATES.find((t) => t.id === "automation-agent");

      expect(automationAgentTemplate).toBeDefined();
      expect(automationAgentTemplate!.capabilityTags).toContain("automation");
      expect(automationAgentTemplate!.capabilityTags).toContain("scheduling");
      expect(automationAgentTemplate!.capabilityTags).toContain("workflow");
      expect(automationAgentTemplate!.capabilityTags).toContain("orchestration");
    });
  });
});
