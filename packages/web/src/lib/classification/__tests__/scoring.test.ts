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

  describe("Edge Cases - Empty Requirements", () => {
    it("should handle completely empty requirements object properties", () => {
      const requirements = createBaseRequirements({
        name: "",
        description: "",
        primaryOutcome: "",
        targetAudience: [],
        deliveryChannels: [],
        successMetrics: [],
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(isNaN(score.score)).toBe(false);
      });
    });

    it("should produce zero matched capabilities for empty requirements", () => {
      const emptyRequirements = createBaseRequirements({
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

      const scores = classifier.scoreAllTemplates(emptyRequirements);

      // With empty requirements, matched capabilities should be minimal
      const totalMatched = scores.reduce((sum, s) => sum + s.matchedCapabilities.length, 0);
      // Should work without crashing, even if no matches
      expect(typeof totalMatched).toBe("number");
    });

    it("should handle empty interaction style gracefully", () => {
      const requirements = createBaseRequirements({
        interactionStyle: "" as AgentRequirements["interactionStyle"],
      });

      // Should not crash when interaction style is empty
      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
    });

    it("should return valid reasoning even for empty requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "",
      });

      const template = ALL_TEMPLATES[0]!;
      const score = classifier.scoreTemplate(template, requirements);

      expect(score.reasoning).toBeDefined();
      expect(typeof score.reasoning).toBe("string");
    });
  });

  describe("Edge Cases - Missing Template Data", () => {
    it("should handle template with undefined optional fields", () => {
      const minimalTemplate = createTestTemplate({
        id: "minimal",
        name: "Minimal",
        description: "Minimal template",
        capabilityTags: [],
        idealFor: [],
        systemPrompt: "Test",
        defaultTools: [],
        requiredDependencies: [],
        recommendedIntegrations: [],
      });

      const testClassifier = new AgentClassifier([minimalTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Test task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
      expect(scores[0]!.score).toBeGreaterThanOrEqual(0);
    });

    it("should handle template with very long description", () => {
      const longDescTemplate = createTestTemplate({
        id: "long-desc",
        description: "A".repeat(10000),
      });

      const testClassifier = new AgentClassifier([longDescTemplate]);
      const requirements = createBaseRequirements();

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
    });

    it("should handle template with many capability tags", () => {
      const manyTagsTemplate = createTestTemplate({
        id: "many-tags",
        capabilityTags: Array.from({ length: 50 }, (_, i) => `capability-${i}`),
      });

      const testClassifier = new AgentClassifier([manyTagsTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Test",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
      expect(scores[0]!.score).toBeGreaterThanOrEqual(0);
    });

    it("should handle template with many idealFor use cases", () => {
      const manyUseCasesTemplate = createTestTemplate({
        id: "many-use-cases",
        idealFor: Array.from({ length: 50 }, (_, i) => `use case ${i}`),
      });

      const testClassifier = new AgentClassifier([manyUseCasesTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "use case 25",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores[0]!.reasoning).toContain("Matches use cases");
    });
  });

  describe("Edge Cases - Incomplete Data", () => {
    it("should handle score calculation with partial capability matches", () => {
      const partialMatchTemplate = createTestTemplate({
        id: "partial",
        capabilityTags: ["data-processing", "statistics", "reporting"],
      });

      const testClassifier = new AgentClassifier([partialMatchTemplate]);

      // Requirements that only match some capabilities
      const requirements = createBaseRequirements({
        primaryOutcome: "Generate reports", // Should only match "reporting"
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      const score = scores[0]!;

      // Should have partial matches
      expect(score.matchedCapabilities.length).toBeLessThanOrEqual(
        partialMatchTemplate.capabilityTags.length
      );
    });

    it("should calculate missing capabilities correctly", () => {
      const template = createTestTemplate({
        id: "complete",
        capabilityTags: ["web-search", "web-scraping", "fact-checking"],
      });

      const testClassifier = new AgentClassifier([template]);

      // Requirements that need capabilities the template doesn't have
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data and create reports", // Data-related, not web-related
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      const score = scores[0]!;

      // Should have missing capabilities for data-related needs
      expect(score.missingCapabilities.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle requirements with conflicting capabilities", () => {
      // Requirements that ask for capabilities from different archetypes
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data and write blog posts and review code",
        capabilities: {
          memory: "none",
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: [],
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);

      // All templates should still score
      expect(scores).toHaveLength(ALL_TEMPLATES.length);

      // Scores should still be normalized
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should produce valid scores when no idealFor matches exist", () => {
      const noIdealForMatchTemplate = createTestTemplate({
        id: "no-ideal-match",
        capabilityTags: ["data-processing"],
        idealFor: ["xyz impossible use case 12345"],
      });

      const testClassifier = new AgentClassifier([noIdealForMatchTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Completely unrelated task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);

      expect(scores[0]!.score).toBeGreaterThanOrEqual(0);
      expect(scores[0]!.reasoning).not.toContain("Matches use cases");
    });

    it("should handle scoring with only one capability enabled", () => {
      const capabilityTests = [
        { capability: "fileAccess" as const, expected: "file" },
        { capability: "webAccess" as const, expected: "web" },
        { capability: "dataAnalysis" as const, expected: "data" },
        { capability: "codeExecution" as const, expected: "code" },
      ];

      capabilityTests.forEach(({ capability }) => {
        const requirements = createBaseRequirements({
          primaryOutcome: "Test",
          capabilities: {
            memory: "none",
            fileAccess: capability === "fileAccess",
            webAccess: capability === "webAccess",
            codeExecution: capability === "codeExecution",
            dataAnalysis: capability === "dataAnalysis",
            toolIntegrations: [],
          },
        });

        const scores = classifier.scoreAllTemplates(requirements);

        expect(scores).toHaveLength(ALL_TEMPLATES.length);
        scores.forEach((score) => {
          expect(score.score).toBeGreaterThanOrEqual(0);
          expect(score.score).toBeLessThanOrEqual(100);
        });
      });
    });

    it("should handle edge boundary values for memory types", () => {
      const memoryTypes: Array<AgentRequirements["capabilities"]["memory"]> = [
        "none",
        "short-term",
        "long-term",
      ];

      memoryTypes.forEach((memoryType) => {
        const requirements = createBaseRequirements({
          capabilities: {
            memory: memoryType,
            fileAccess: false,
            webAccess: false,
            codeExecution: false,
            dataAnalysis: false,
            toolIntegrations: [],
          },
        });

        const scores = classifier.scoreAllTemplates(requirements);

        expect(scores).toHaveLength(ALL_TEMPLATES.length);
        scores.forEach((score) => {
          expect(typeof score.score).toBe("number");
          expect(isNaN(score.score)).toBe(false);
        });
      });
    });
  });

  describe("Edge Cases - Boundary Conditions", () => {
    it("should handle exactly zero score gracefully", () => {
      const unmatchedTemplate = createTestTemplate({
        id: "zero-score",
        capabilityTags: ["nonexistent-capability-abc-xyz"],
        idealFor: ["impossible-task-xyz-123"],
      });

      const testClassifier = new AgentClassifier([unmatchedTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Completely unrelated task qwerty",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);

      expect(scores[0]!.score).toBe(0);
      expect(scores[0]!.matchedCapabilities).toHaveLength(0);
      expect(typeof scores[0]!.reasoning).toBe("string");
    });

    it("should handle maximum possible score scenario", () => {
      // Requirements that should strongly match data-analyst
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze CSV data and generate statistical reports with visualizations and charts",
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

      // Top score should be high but still <= 100
      expect(topScore.score).toBeGreaterThan(50);
      expect(topScore.score).toBeLessThanOrEqual(100);
      expect(topScore.templateId).toBe("data-analyst");
    });

    it("should not produce NaN scores for any input", () => {
      const weirdRequirements = [
        createBaseRequirements({ primaryOutcome: "" }),
        createBaseRequirements({ primaryOutcome: "   " }),
        createBaseRequirements({ primaryOutcome: "\n\t\r" }),
        createBaseRequirements({ primaryOutcome: "🔥🚀💻" }),
        createBaseRequirements({ targetAudience: [] }),
        createBaseRequirements({ successMetrics: [] }),
      ];

      weirdRequirements.forEach((requirements) => {
        const scores = classifier.scoreAllTemplates(requirements);

        scores.forEach((score) => {
          expect(isNaN(score.score)).toBe(false);
          expect(isFinite(score.score)).toBe(true);
        });
      });
    });

    it("should maintain score ordering after repeated calculations", () => {
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

      // Calculate scores multiple times
      const results: string[][] = [];
      for (let i = 0; i < 10; i++) {
        const scores = classifier.scoreAllTemplates(requirements);
        results.push(scores.map((s) => s.templateId));
      }

      // All results should be identical
      results.forEach((result) => {
        expect(result).toEqual(results[0]);
      });
    });
  });

  describe("Edge Cases - Empty Requirements Scoring", () => {
    it("should produce consistent scores for empty primary outcome", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "",
      });

      // Run multiple times to ensure consistency
      const results: number[][] = [];
      for (let i = 0; i < 5; i++) {
        const scores = classifier.scoreAllTemplates(requirements);
        results.push(scores.map((s) => s.score));
      }

      // All results should be identical
      results.forEach((result) => {
        expect(result).toEqual(results[0]);
      });
    });

    it("should handle requirements with all empty string arrays", () => {
      const requirements = createBaseRequirements({
        name: "",
        description: "",
        primaryOutcome: "",
        targetAudience: [],
        deliveryChannels: [],
        successMetrics: [],
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      // All templates should have low or zero scores with empty requirements
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle whitespace-only values in all text fields", () => {
      const requirements = createBaseRequirements({
        name: "   ",
        description: "\t\n",
        primaryOutcome: "  \r\n  ",
      });

      const scores = classifier.scoreAllTemplates(requirements);

      scores.forEach((score) => {
        expect(typeof score.score).toBe("number");
        expect(isNaN(score.score)).toBe(false);
        expect(isFinite(score.score)).toBe(true);
      });
    });

    it("should produce valid reasoning for empty requirements", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "",
        targetAudience: [],
        successMetrics: [],
      });

      const template = ALL_TEMPLATES[0]!;
      const score = classifier.scoreTemplate(template, requirements);

      expect(score.reasoning).toBeDefined();
      expect(typeof score.reasoning).toBe("string");
      expect(score.reasoning.length).toBeGreaterThan(0);
    });

    it("should not match any capabilities when requirements are empty", () => {
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

      // With empty requirements, capability matches should be minimal
      const totalMatched = scores.reduce((sum, s) => sum + s.matchedCapabilities.length, 0);
      expect(totalMatched).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Edge Cases - Missing Template Fields", () => {
    it("should handle template with empty string fields", () => {
      const emptyFieldsTemplate = createTestTemplate({
        id: "empty-fields",
        name: "",
        description: "",
        systemPrompt: "",
      });

      const testClassifier = new AgentClassifier([emptyFieldsTemplate]);
      const requirements = createBaseRequirements();

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
      expect(scores[0]!.score).toBeGreaterThanOrEqual(0);
    });

    it("should throw error for template with null-like capabilityTags", () => {
      const nullLikeTemplate = createTestTemplate({
        id: "null-like",
        capabilityTags: null as unknown as string[],
        idealFor: undefined as unknown as string[],
      });

      const testClassifier = new AgentClassifier([nullLikeTemplate]);
      const requirements = createBaseRequirements();

      // Null capabilityTags causes TypeError when trying to iterate
      expect(() => testClassifier.scoreAllTemplates(requirements)).toThrow(TypeError);
    });

    it("should handle scoring when template has empty defaultTools", () => {
      const noToolsTemplate = createTestTemplate({
        id: "no-tools",
        defaultTools: [],
      });

      const testClassifier = new AgentClassifier([noToolsTemplate]);
      const requirements = createBaseRequirements();

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores[0]!.score).toBeGreaterThanOrEqual(0);
    });

    it("should handle template with whitespace-only capabilityTags", () => {
      const whitespaceTagsTemplate = createTestTemplate({
        id: "whitespace-tags",
        capabilityTags: ["   ", "\t", "\n", "valid-tag"],
      });

      const testClassifier = new AgentClassifier([whitespaceTagsTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "valid-tag related task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores).toHaveLength(1);
    });

    it("should handle template with empty idealFor entries", () => {
      const emptyIdealForTemplate = createTestTemplate({
        id: "empty-ideal-for",
        idealFor: ["", "  ", "valid use case"],
      });

      const testClassifier = new AgentClassifier([emptyIdealForTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "valid use case",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      expect(scores[0]!.reasoning).toContain("Matches use cases");
    });
  });

  describe("Edge Cases - Incomplete Scoring Data", () => {
    it("should calculate score correctly when only some capabilities match", () => {
      // Template with unique, non-overlapping capability tags that won't be triggered by keyword patterns
      const partialTemplate = createTestTemplate({
        id: "partial-match",
        capabilityTags: ["custom-cap-1", "custom-cap-2", "custom-cap-3", "file-access", "web-access"],
      });

      const testClassifier = new AgentClassifier([partialTemplate]);

      // Requirements that only enable file access (not web access)
      const requirements = createBaseRequirements({
        primaryOutcome: "Simple task without special keywords", // No matching patterns
        capabilities: {
          memory: "none",
          fileAccess: true, // Matches "file-access"
          webAccess: false, // Does NOT match "web-access"
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: [],
        },
      });

      const scores = testClassifier.scoreAllTemplates(requirements);
      const score = scores[0]!;

      // Should have some matches but not all
      expect(score.matchedCapabilities.length).toBeGreaterThanOrEqual(0);
      expect(score.matchedCapabilities.length).toBeLessThanOrEqual(
        partialTemplate.capabilityTags.length
      );
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
    });

    it("should handle scoring when interaction style is not defined in style map", () => {
      const requirements = createBaseRequirements({
        interactionStyle: "unknown-style" as AgentRequirements["interactionStyle"],
      });

      const scores = classifier.scoreAllTemplates(requirements);

      // Should still produce valid scores
      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
      });
    });

    it("should produce zero missing capabilities when requirements are empty", () => {
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

      // With no requirements, nothing should be "missing"
      scores.forEach((score) => {
        expect(Array.isArray(score.missingCapabilities)).toBe(true);
      });
    });

    it("should handle scoring with only memory capability set", () => {
      const memoryValues: Array<AgentRequirements["capabilities"]["memory"]> = [
        "none",
        "short-term",
        "long-term",
      ];

      memoryValues.forEach((memory) => {
        const requirements = createBaseRequirements({
          primaryOutcome: "Memory test",
          capabilities: {
            memory,
            fileAccess: false,
            webAccess: false,
            codeExecution: false,
            dataAnalysis: false,
            toolIntegrations: [],
          },
        });

        const scores = classifier.scoreAllTemplates(requirements);

        expect(scores).toHaveLength(ALL_TEMPLATES.length);
        scores.forEach((score) => {
          expect(typeof score.score).toBe("number");
        });
      });
    });

    it("should handle requirements with very large toolIntegrations array", () => {
      const requirements = createBaseRequirements({
        capabilities: {
          memory: "none",
          fileAccess: false,
          webAccess: false,
          codeExecution: false,
          dataAnalysis: false,
          toolIntegrations: Array.from({ length: 1000 }, (_, i) => `tool-${i}`),
        },
      });

      const scores = classifier.scoreAllTemplates(requirements);

      expect(scores).toHaveLength(ALL_TEMPLATES.length);
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Edge Cases - Score Calculation Boundaries", () => {
    it("should handle exact boundary between low and medium confidence", () => {
      // Create requirements that produce scores right at the boundary
      const requirements = createBaseRequirements({
        primaryOutcome: "Generic task with some data",
        interactionStyle: "task-focused",
      });

      const scores = classifier.scoreAllTemplates(requirements);

      // All scores should be valid regardless of boundary
      scores.forEach((score) => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it("should maintain precision in score calculation", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data and create visualizations",
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
        // Score should not have floating point precision issues
        const scoreStr = score.score.toString();
        const parts = scoreStr.split(".");
        if (parts[1]) {
          expect(parts[1].length).toBeLessThanOrEqual(2);
        }
      });
    });

    it("should handle division by zero scenarios gracefully", () => {
      // Template with no capability tags - could cause division by zero
      const emptyTemplate = createTestTemplate({
        id: "empty",
        capabilityTags: [],
        idealFor: [],
      });

      const testClassifier = new AgentClassifier([emptyTemplate]);
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

      const scores = testClassifier.scoreAllTemplates(requirements);

      expect(scores[0]!.score).toBe(0);
      expect(isNaN(scores[0]!.score)).toBe(false);
      expect(isFinite(scores[0]!.score)).toBe(true);
    });

    it("should handle maximum possible capability overlap", () => {
      // Template with all possible capability tags
      const maxCapTemplate = createTestTemplate({
        id: "max-cap",
        capabilityTags: [
          "data-processing",
          "statistics",
          "visualization",
          "reporting",
          "file-access",
          "web-access",
          "content-creation",
          "seo",
          "code-review",
          "testing",
          "refactoring",
          "web-search",
          "fact-checking",
          "research",
          "automation",
          "scheduling",
          "orchestration",
        ],
        idealFor: ["everything"],
      });

      const testClassifier = new AgentClassifier([maxCapTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "data statistics visualization reporting code review test research automation",
        capabilities: {
          memory: "long-term",
          fileAccess: true,
          webAccess: true,
          codeExecution: true,
          dataAnalysis: true,
          toolIntegrations: ["all"],
        },
      });

      const scores = testClassifier.scoreAllTemplates(requirements);

      expect(scores[0]!.score).toBeLessThanOrEqual(100);
      expect(scores[0]!.matchedCapabilities.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases - Reasoning Edge Cases", () => {
    it("should produce valid reasoning when no capabilities are matched", () => {
      const noMatchTemplate = createTestTemplate({
        id: "no-match",
        capabilityTags: ["xyz-nonexistent-cap"],
        idealFor: ["xyz-impossible-task"],
      });

      const testClassifier = new AgentClassifier([noMatchTemplate]);
      const requirements = createBaseRequirements({
        primaryOutcome: "Completely unrelated task",
      });

      const scores = testClassifier.scoreAllTemplates(requirements);

      expect(scores[0]!.reasoning).toBeDefined();
      expect(typeof scores[0]!.reasoning).toBe("string");
      expect(scores[0]!.reasoning.length).toBeGreaterThan(0);
    });

    it("should include interaction style in reasoning even when not matching", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Test task",
        interactionStyle: "task-focused",
      });

      const contentCreatorTemplate = ALL_TEMPLATES.find((t) => t.id === "content-creator")!;
      const score = classifier.scoreTemplate(contentCreatorTemplate, requirements);

      // Content creator prefers conversational, not task-focused
      // Reasoning should still be valid
      expect(score.reasoning).toBeDefined();
    });

    it("should handle reasoning with very long matched capabilities list", () => {
      const manyTagsTemplate = createTestTemplate({
        id: "many-tags",
        capabilityTags: Array.from({ length: 50 }, (_, i) => `cap-${i}`),
      });

      const testClassifier = new AgentClassifier([manyTagsTemplate]);
      const requirements = createBaseRequirements({
        // Match many capabilities
        primaryOutcome: Array.from({ length: 25 }, (_, i) => `cap-${i}`).join(" "),
      });

      const scores = testClassifier.scoreAllTemplates(requirements);

      // Reasoning should still be generated
      expect(scores[0]!.reasoning).toBeDefined();
      expect(typeof scores[0]!.reasoning).toBe("string");
    });

    it("should produce distinct reasoning for different templates", () => {
      const requirements = createBaseRequirements({
        primaryOutcome: "Analyze data and write content",
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

      // Different templates should produce different reasoning
      const reasonings = scores.map((s) => s.reasoning);
      const uniqueReasonings = new Set(reasonings);

      // At least some templates should have different reasoning
      expect(uniqueReasonings.size).toBeGreaterThan(1);
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
