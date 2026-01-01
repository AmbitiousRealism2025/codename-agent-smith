import { describe, it, expect, beforeEach } from "vitest";
import { AgentClassifier } from "@/lib/classification/classifier";
import { ALL_TEMPLATES } from "@/templates";
import type {
  AgentRequirements,
  AgentTemplate,
} from "@/lib/classification/types";

/**
 * Unit tests for AgentClassifier scoring logic
 *
 * Focuses on:
 * - Template matching algorithms
 * - Confidence/score calculations
 * - Tie-breaking behavior
 * - Score normalization
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

/**
 * Creates a minimal test template for isolated scoring tests
 */
function createTestTemplate(overrides: Partial<AgentTemplate> = {}): AgentTemplate {
  return {
    id: "test-template",
    name: "Test Template",
    description: "A test template for unit testing",
    capabilityTags: [],
    idealFor: [],
    systemPrompt: "You are a test agent.",
    defaultTools: [],
    requiredDependencies: [],
    recommendedIntegrations: [],
    ...overrides,
  };
}

describe("Scoring Algorithm", () => {
  let classifier: AgentClassifier;

  beforeEach(() => {
    classifier = new AgentClassifier(ALL_TEMPLATES);
  });

  describe("Score Normalization", () => {
    it("should return normalized scores between 0 and 100", () => {
      const requirements = createBaseRequirements();
      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should return scores with at most 2 decimal places", () => {
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

      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        const decimalPlaces = (score.score.toString().split(".")[1] || "").length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });

    it("should return 0 for templates with no matching capabilities", () => {
      // Create a classifier with a template that has no matching capabilities
      const unmatchedTemplate = createTestTemplate({
        id: "unmatched",
        capabilityTags: ["nonexistent-capability-xyz"],
        idealFor: [],
      });

      const customClassifier = new AgentClassifier([unmatchedTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Completely unrelated task",
      });

      const scores = customClassifier.scoreAllTemplates(requirements);

      expect(scores[0]!.score).toBe(0);
    });
  });

  describe("Template Matching", () => {
    it("should match templates based on capability tags", () => {
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

      const scores = classifier.scoreAllTemplates(requirements);
      const dataAnalystScore = scores.find((s) => s.templateId === "data-analyst");

      expect(dataAnalystScore).toBeDefined();
      expect(dataAnalystScore!.matchedCapabilities.length).toBeGreaterThan(0);
    });

    it("should track matched capabilities accurately", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze metrics and create visualizations",
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

      // Should have matched several data-related capabilities
      expect(score.matchedCapabilities).toContain("data-processing");
      expect(score.matchedCapabilities).toContain("visualization");
    });

    it("should track missing capabilities accurately", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Search and research topics",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      // Data analyst doesn't support web-search, so it should be missing
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);

      expect(score.missingCapabilities.length).toBeGreaterThan(0);
    });

    it("should match primary outcome keywords to template capabilities", () => {
      // Test data analysis keywords
      const dataAnalysisReqs = createBaseRequirements({
        primaryOutcome: "Generate statistical reports from CSV files",
      });
      const dataScores = classifier.scoreAllTemplates(dataAnalysisReqs);
      expect(dataScores[0]!.templateId).toBe("data-analyst");

      // Test content creation keywords
      const contentReqs = createBaseRequirements({
        primaryOutcome: "Write SEO-optimized blog articles",
      });
      const contentScores = classifier.scoreAllTemplates(contentReqs);
      expect(contentScores.find((s) => s.templateId === "content-creator")!.matchedCapabilities)
        .toContain("seo");

      // Test code assistance keywords
      const codeReqs = createBaseRequirements({
        primaryOutcome: "Review code and run tests",
      });
      const codeScores = classifier.scoreAllTemplates(codeReqs);
      expect(codeScores.find((s) => s.templateId === "code-assistant")!.matchedCapabilities)
        .toContain("testing");

      // Test research keywords
      const researchReqs = createBaseRequirements({
        primaryOutcome: "Search the web and verify facts",
      });
      const researchScores = classifier.scoreAllTemplates(researchReqs);
      expect(researchScores.find((s) => s.templateId === "research-agent")!.matchedCapabilities)
        .toContain("fact-checking");

      // Test automation keywords
      const automationReqs = createBaseRequirements({
        primaryOutcome: "Schedule jobs and orchestrate workflows",
      });
      const automationScores = classifier.scoreAllTemplates(automationReqs);
      expect(automationScores.find((s) => s.templateId === "automation-agent")!.matchedCapabilities)
        .toContain("scheduling");
    });

    it("should match templates based on idealFor use cases", () => {
      // Data analyst should match "data analysis" use cases
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;

      const requirements = createBaseRequirements({
        primaryOutcome: dataAnalystTemplate.idealFor[0] || "data analysis",
      });

      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);
      expect(score.reasoning).toContain("Matches use cases");
    });
  });

  describe("Interaction Style Scoring", () => {
    it("should give bonus for matching interaction style", () => {
      const contentCreatorTemplate = ALL_TEMPLATES.find((t) => t.id === "content-creator")!;

      const conversationalReqs = createBaseRequirements({
        primaryOutcome: "Write content",
        interactionStyle: "conversational",
      });

      const taskFocusedReqs = createBaseRequirements({
        primaryOutcome: "Write content",
        interactionStyle: "task-focused",
      });

      const conversationalScore = classifier.scoreTemplate(contentCreatorTemplate, conversationalReqs);
      const taskFocusedScore = classifier.scoreTemplate(contentCreatorTemplate, taskFocusedReqs);

      expect(conversationalScore.score).toBeGreaterThan(taskFocusedScore.score);
      expect(conversationalScore.reasoning).toContain("conversational");
    });

    it("should award task-focused bonus to appropriate templates", () => {
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;

      const taskFocusedReqs = createBaseRequirements({
        primaryOutcome: "Process data",
        interactionStyle: "task-focused",
      });

      const score = classifier.scoreTemplate(dataAnalystTemplate, taskFocusedReqs);
      expect(score.reasoning).toContain("task-focused");
    });

    it("should award collaborative bonus to code-assistant", () => {
      const codeAssistantTemplate = ALL_TEMPLATES.find((t) => t.id === "code-assistant")!;

      const collaborativeReqs = createBaseRequirements({
        primaryOutcome: "Review code",
        interactionStyle: "collaborative",
      });

      const conversationalReqs = createBaseRequirements({
        primaryOutcome: "Review code",
        interactionStyle: "conversational",
      });

      const collaborativeScore = classifier.scoreTemplate(codeAssistantTemplate, collaborativeReqs);
      const conversationalScore = classifier.scoreTemplate(codeAssistantTemplate, conversationalReqs);

      expect(collaborativeScore.score).toBeGreaterThan(conversationalScore.score);
    });
  });

  describe("Capability Requirements Scoring", () => {
    it("should award points for file access capability match", () => {
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;

      const withFileAccess = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const withoutFileAccess = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scoreWith = classifier.scoreTemplate(dataAnalystTemplate, withFileAccess);
      const scoreWithout = classifier.scoreTemplate(dataAnalystTemplate, withoutFileAccess);

      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
      expect(scoreWith.reasoning).toContain("file access");
    });

    it("should award points for web access capability match", () => {
      // Create a custom template with web-access capability to test the scoring logic
      const webAccessTemplate = createTestTemplate({
        id: "web-access-template",
        capabilityTags: ["web-access"],
        idealFor: [],
      });

      const customClassifier = new AgentClassifier([webAccessTemplate]);

      const withWebAccess = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const withoutWebAccess = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scoreWith = customClassifier.scoreTemplate(webAccessTemplate, withWebAccess);
      const scoreWithout = customClassifier.scoreTemplate(webAccessTemplate, withoutWebAccess);

      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
      expect(scoreWith.reasoning).toContain("web access");
    });

    it("should award points for data analysis capability match", () => {
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;

      const withDataAnalysis = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const withoutDataAnalysis = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scoreWith = classifier.scoreTemplate(dataAnalystTemplate, withDataAnalysis);
      const scoreWithout = classifier.scoreTemplate(dataAnalystTemplate, withoutDataAnalysis);

      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
      expect(scoreWith.reasoning).toContain("data analysis");
    });
  });

  describe("Confidence Levels", () => {
    it("should return high confidence (>70) for strong matches", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze CSV data and generate statistical reports with visualizations",
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
      expect(topScore.score).toBeGreaterThan(70);
    });

    it("should return moderate confidence (30-70) for partial matches", () => {
      // Requirements that partially match multiple templates
      const requirements = createBaseRequirements({
        primaryOutcome: "Help with various tasks",
        interactionStyle: "collaborative",
        capabilities: {
          memory: "short-term",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);

      // Multiple templates should have moderate scores
      const moderateScores = scores.filter((s) => s.score >= 30 && s.score <= 70);
      expect(moderateScores.length).toBeGreaterThanOrEqual(1);
    });

    it("should return low confidence (<30) for weak matches", () => {
      // Very generic requirements with minimal capability overlap
      const requirements = createBaseRequirements({
        primaryOutcome: "Generic task",
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

      // At least some templates should have low scores
      const lowScores = scores.filter((s) => s.score < 30);
      expect(lowScores.length).toBeGreaterThan(0);
    });
  });

  describe("Tie-Breaking", () => {
    it("should return consistent ordering for identical requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "General purpose task",
        interactionStyle: "task-focused",
      });

      const scores1 = classifier.scoreAllTemplates(requirements);
      const scores2 = classifier.scoreAllTemplates(requirements);
      const scores3 = classifier.scoreAllTemplates(requirements);

      // Ordering should be deterministic
      expect(scores1.map((s) => s.templateId)).toEqual(scores2.map((s) => s.templateId));
      expect(scores2.map((s) => s.templateId)).toEqual(scores3.map((s) => s.templateId));
    });

    it("should maintain stable sort order for tied scores", () => {
      // Create requirements that might produce similar scores
      const requirements = createBaseRequirements({
        primaryOutcome: "General assistance",
      });

      const scores = classifier.scoreAllTemplates(requirements);

      // Find any tied scores
      const tiedGroups: Record<number, string[]> = {};
      scores.forEach((score) => {
        const roundedScore = Math.round(score.score);
        if (!tiedGroups[roundedScore]) {
          tiedGroups[roundedScore] = [];
        }
        tiedGroups[roundedScore]!.push(score.templateId);
      });

      // Run multiple times and verify tied groups maintain same order
      for (let i = 0; i < 5; i++) {
        const newScores = classifier.scoreAllTemplates(requirements);
        const newOrder = newScores.map((s) => s.templateId);

        expect(newOrder).toEqual(scores.map((s) => s.templateId));
      }
    });

    it("should differentiate between templates with different capability matches", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data and create reports",
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

      // Data analyst should score higher than content creator for data-focused requirements
      const dataAnalystScore = scores.find((s) => s.templateId === "data-analyst");
      const contentCreatorScore = scores.find((s) => s.templateId === "content-creator");

      expect(dataAnalystScore!.score).toBeGreaterThan(contentCreatorScore!.score);
    });

    it("should break ties using capability coverage", () => {
      // Requirements that could match multiple templates
      const requirements = createBaseRequirements({
        primaryOutcome: "Write and review code",
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

      // Code assistant should have more matched capabilities
      expect(codeAssistantScore.matchedCapabilities.length).toBeGreaterThan(0);
    });
  });

  describe("Reasoning Generation", () => {
    it("should include matched capabilities in reasoning", () => {
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

      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);

      expect(score.reasoning).toContain("Matched capabilities");
    });

    it("should include missing capabilities in reasoning when applicable", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Search web and analyze data",
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: true,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      // Data analyst doesn't support web-search
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;
      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);

      if (score.missingCapabilities.length > 0) {
        expect(score.reasoning).toContain("Missing capabilities");
      }
    });

    it("should include use case matches in reasoning", () => {
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;

      const requirements = createBaseRequirements({
        primaryOutcome: dataAnalystTemplate.idealFor[0] || "data analysis",
      });

      const score = classifier.scoreTemplate(dataAnalystTemplate, requirements);
      expect(score.reasoning).toContain("Matches use cases");
    });

    it("should include interaction style compatibility in reasoning", () => {
      const contentCreatorTemplate = ALL_TEMPLATES.find((t) => t.id === "content-creator")!;

      const requirements = createBaseRequirements({
        primaryOutcome: "Write content",
        interactionStyle: "conversational",
      });

      const score = classifier.scoreTemplate(contentCreatorTemplate, requirements);
      expect(score.reasoning).toContain("conversational");
    });

    it("should provide basic template match reasoning even with no specific matches", () => {
      const customTemplate = createTestTemplate({
        id: "custom",
        capabilityTags: ["custom-cap"],
        idealFor: ["custom use"],
      });

      const customClassifier = new AgentClassifier([customTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Unrelated task",
      });

      const scores = customClassifier.scoreAllTemplates(requirements);
      expect(scores[0]!.reasoning).toBeTruthy();
      expect(typeof scores[0]!.reasoning).toBe("string");
    });
  });

  describe("Score Component Weights", () => {
    it("should weight capability matches appropriately", () => {
      const baseRequirements = createBaseRequirements();

      // Requirements with data analysis capability
      const withDataAnalysis = createBaseRequirements({
        primaryOutcome: "Process data",
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

      const baseScore = classifier.scoreTemplate(dataAnalystTemplate, baseRequirements);
      const enhancedScore = classifier.scoreTemplate(dataAnalystTemplate, withDataAnalysis);

      // Data analysis capability should add significant points
      expect(enhancedScore.score).toBeGreaterThan(baseScore.score);
    });

    it("should weight interaction style bonus consistently", () => {
      // Test that interaction style provides consistent bonus across templates
      const templates = [
        { id: "content-creator", style: "conversational" as const },
        { id: "code-assistant", style: "collaborative" as const },
        { id: "data-analyst", style: "task-focused" as const },
      ];

      templates.forEach(({ id, style }) => {
        const template = ALL_TEMPLATES.find((t) => t.id === id)!;

        const matchingReqs = createBaseRequirements({ interactionStyle: style });
        const differentReqs = createBaseRequirements({
          interactionStyle: style === "conversational" ? "task-focused" : "conversational",
        });

        const matchingScore = classifier.scoreTemplate(template, matchingReqs);
        const differentScore = classifier.scoreTemplate(template, differentReqs);

        expect(matchingScore.score).toBeGreaterThanOrEqual(differentScore.score);
      });
    });

    it("should weight use case matches appropriately", () => {
      const dataAnalystTemplate = ALL_TEMPLATES.find((t) => t.id === "data-analyst")!;

      // Requirements that match idealFor
      const matchingReqs = createBaseRequirements({
        primaryOutcome: dataAnalystTemplate.idealFor[0] || "data analysis",
      });

      // Requirements that don't match idealFor
      const nonMatchingReqs = createBaseRequirements({
        primaryOutcome: "unrelated random task xyz",
      });

      const matchingScore = classifier.scoreTemplate(dataAnalystTemplate, matchingReqs);
      const nonMatchingScore = classifier.scoreTemplate(dataAnalystTemplate, nonMatchingReqs);

      expect(matchingScore.score).toBeGreaterThan(nonMatchingScore.score);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty templates array gracefully for scoring", () => {
      const emptyClassifier = new AgentClassifier([]);
      const requirements = createBaseRequirements();

      const scores = emptyClassifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(0);
    });

    it("should handle very long primary outcome text", () => {
      const longOutcome = "data analysis ".repeat(100);
      const requirements = createBaseRequirements({
        primaryOutcome: longOutcome,
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle special characters in primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data with $pecial ch@racters & symbols! #test",
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(typeof score.score).toBe("number");
        expect(isNaN(score.score)).toBe(false);
      });
    });

    it("should handle unicode in primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze データ and create レポート 📊",
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
    });

    it("should handle all capabilities enabled", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Full capability agent",
        capabilities: {
          memory: "long-term",
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: ["github", "slack", "jira"],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);

      // All scores should still be valid
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle mixed case in primary outcome", () => {
      const requirements1 = createBaseRequirements({
        primaryOutcome: "ANALYZE DATA",
      });

      const requirements2 = createBaseRequirements({
        primaryOutcome: "analyze data",
      });

      const requirements3 = createBaseRequirements({
        primaryOutcome: "AnAlYzE DaTa",
      });

      const scores1 = classifier.scoreAllTemplates(requirements1);
      const scores2 = classifier.scoreAllTemplates(requirements2);
      const scores3 = classifier.scoreAllTemplates(requirements3);

      // Case should not affect which template is selected
      expect(scores1[0]!.templateId).toBe(scores2[0]!.templateId);
      expect(scores2[0]!.templateId).toBe(scores3[0]!.templateId);
    });
  });

  describe("Cross-Template Comparisons", () => {
    it("should score different archetypes appropriately for their domain", () => {
      const testCases = [
        {
          requirements: createBaseRequirements({
            primaryOutcome: "Analyze CSV and generate statistical reports",
            capabilities: {
              memory: "none",
              fileAccess: true,
              webAccess: false,
              codeExecution: false,
              dataAnalysis: true,
              toolIntegrations: [],
            },
          }),
          expectedWinner: "data-analyst",
        },
        {
          requirements: createBaseRequirements({
            primaryOutcome: "Write blog posts and SEO content",
            interactionStyle: "conversational" as const,
            capabilities: {
              memory: "none",
              fileAccess: false,
              webAccess: false,
              codeExecution: false,
              dataAnalysis: false,
              toolIntegrations: [],
            },
          }),
          expectedWinner: "content-creator",
        },
        {
          requirements: createBaseRequirements({
            primaryOutcome: "Review code and write tests",
            interactionStyle: "collaborative" as const,
            capabilities: {
              memory: "none",
              fileAccess: true,
              webAccess: false,
              codeExecution: true,
              dataAnalysis: false,
              toolIntegrations: [],
            },
          }),
          expectedWinner: "code-assistant",
        },
        {
          requirements: createBaseRequirements({
            primaryOutcome: "Search web and verify facts",
            interactionStyle: "conversational" as const,
            capabilities: {
              memory: "none",
              fileAccess: false,
              webAccess: true,
              codeExecution: false,
              dataAnalysis: false,
              toolIntegrations: [],
            },
          }),
          expectedWinner: "research-agent",
        },
        {
          requirements: createBaseRequirements({
            primaryOutcome: "Schedule and orchestrate automated workflows",
            interactionStyle: "task-focused" as const,
            capabilities: {
              memory: "short-term",
              fileAccess: true,
              webAccess: false,
              codeExecution: false,
              dataAnalysis: false,
              toolIntegrations: ["cron"],
            },
          }),
          expectedWinner: "automation-agent",
        },
      ];

      testCases.forEach(({ requirements, expectedWinner }) => {
        const scores = classifier.scoreAllTemplates(requirements);
        expect(scores[0]!.templateId).toBe(expectedWinner);
      });
    });

    it("should distinguish between similar use cases", () => {
      // Data analysis vs research (both might involve data)
      const dataReqs = createBaseRequirements({
        primaryOutcome: "Process CSV files and calculate statistics",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      // Use research-specific keywords that don't trigger data-analyst patterns
      const researchReqs = createBaseRequirements({
        primaryOutcome: "Search the web to research topics and verify facts",
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

      const dataScores = classifier.scoreAllTemplates(dataReqs);
      const researchScores = classifier.scoreAllTemplates(researchReqs);

      expect(dataScores[0]!.templateId).toBe("data-analyst");
      expect(researchScores[0]!.templateId).toBe("research-agent");
    });
  });
});
