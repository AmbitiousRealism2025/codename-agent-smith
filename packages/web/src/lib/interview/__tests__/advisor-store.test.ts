import { describe, it, expect, beforeEach } from "vitest";
import { useAdvisorStore } from "@/stores/advisor-store";
import { INTERVIEW_QUESTIONS } from "@/lib/interview/questions";
import {
  DEFAULT_ADVISOR_STATE,
  resetStore,
  STORE_KEYS,
} from "@/test/mocks/zustand";

/**
 * Unit tests for advisor-store
 *
 * Tests the Zustand store responsible for:
 * - Session initialization and management
 * - Response recording and requirements updates
 * - Stage progression through the interview flow
 * - Navigation (previous question, skip)
 * - Progress tracking and computed state
 */

describe("Advisor Store", () => {
  /**
   * Reset store state before each test to ensure isolation
   */
  beforeEach(() => {
    localStorage.removeItem(STORE_KEYS.advisor);
    resetStore(useAdvisorStore, DEFAULT_ADVISOR_STATE);
  });

  describe("Session Initialization", () => {
    it("should initialize with default state", () => {
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBeNull();
      expect(state.currentStage).toBe("discovery");
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.responses).toEqual({});
      expect(state.requirements).toEqual({});
      expect(state.recommendations).toBeNull();
      expect(state.isComplete).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.startedAt).toBeNull();
    });

    it("should create a new session with auto-generated UUID", () => {
      useAdvisorStore.getState().initSession();
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBeDefined();
      expect(state.sessionId).not.toBeNull();
      expect(typeof state.sessionId).toBe("string");
      // UUID v4 format check (8-4-4-4-12 hex digits)
      expect(state.sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("should create a session with provided session ID", () => {
      const customId = "custom-session-123";
      useAdvisorStore.getState().initSession(customId);
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBe(customId);
    });

    it("should reset state when initializing a new session", () => {
      // Set some state first
      useAdvisorStore.setState({
        currentStage: "architecture",
        currentQuestionIndex: 3,
        responses: { q1_agent_name: "Test Agent" },
        isComplete: true,
      });

      // Initialize new session
      useAdvisorStore.getState().initSession();
      const state = useAdvisorStore.getState();

      expect(state.currentStage).toBe("discovery");
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.responses).toEqual({});
      expect(state.isComplete).toBe(false);
    });

    it("should set startedAt timestamp on session init", () => {
      const beforeInit = new Date();
      useAdvisorStore.getState().initSession();
      const afterInit = new Date();
      const state = useAdvisorStore.getState();

      expect(state.startedAt).toBeInstanceOf(Date);
      expect(state.startedAt!.getTime()).toBeGreaterThanOrEqual(beforeInit.getTime());
      expect(state.startedAt!.getTime()).toBeLessThanOrEqual(afterInit.getTime());
    });
  });

  describe("Response Recording", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it("should record a text response", () => {
      useAdvisorStore.getState().recordResponse("q1_agent_name", "Test Agent");
      const state = useAdvisorStore.getState();

      expect(state.responses.q1_agent_name).toBe("Test Agent");
    });

    it("should record a boolean response", () => {
      useAdvisorStore.setState({ currentStage: "architecture", currentQuestionIndex: 1 });
      useAdvisorStore.getState().recordResponse("q8_file_access", true);
      const state = useAdvisorStore.getState();

      expect(state.responses.q8_file_access).toBe(true);
    });

    it("should record an array response (multiselect)", () => {
      useAdvisorStore.getState().recordResponse("q3_target_audience", ["Developers", "End Users"]);
      const state = useAdvisorStore.getState();

      expect(state.responses.q3_target_audience).toEqual(["Developers", "End Users"]);
    });

    it("should preserve previous responses when recording new ones", () => {
      useAdvisorStore.getState().recordResponse("q1_agent_name", "Agent 1");
      useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Goal 1");

      const state = useAdvisorStore.getState();
      expect(state.responses.q1_agent_name).toBe("Agent 1");
      expect(state.responses.q2_primary_outcome).toBe("Goal 1");
    });

    it("should overwrite existing response for same question", () => {
      useAdvisorStore.getState().recordResponse("q1_agent_name", "Original Name");
      useAdvisorStore.getState().recordResponse("q1_agent_name", "Updated Name");

      const state = useAdvisorStore.getState();
      expect(state.responses.q1_agent_name).toBe("Updated Name");
    });

    it("should advance to next question after recording response", () => {
      expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);

      useAdvisorStore.getState().recordResponse("q1_agent_name", "Test Agent");
      expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);
    });
  });

  describe("Requirements Updates", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it("should update name requirement from q1_agent_name", () => {
      useAdvisorStore.getState().recordResponse("q1_agent_name", "My Agent");
      const state = useAdvisorStore.getState();

      expect(state.requirements.name).toBe("My Agent");
      expect(state.requirements.description).toBe("My Agent agent");
    });

    it("should update primaryOutcome from q2_primary_outcome", () => {
      useAdvisorStore.setState({ currentQuestionIndex: 1 });
      useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Automate tasks");
      const state = useAdvisorStore.getState();

      expect(state.requirements.primaryOutcome).toBe("Automate tasks");
    });

    it("should update targetAudience from q3_target_audience", () => {
      useAdvisorStore.setState({ currentQuestionIndex: 2 });
      useAdvisorStore.getState().recordResponse("q3_target_audience", ["Developers", "Data Scientists"]);
      const state = useAdvisorStore.getState();

      expect(state.requirements.targetAudience).toEqual(["Developers", "Data Scientists"]);
    });

    it("should update interactionStyle from q4_interaction_style", () => {
      useAdvisorStore.setState({ currentStage: "requirements", currentQuestionIndex: 0 });
      useAdvisorStore.getState().recordResponse("q4_interaction_style", "conversational");
      const state = useAdvisorStore.getState();

      expect(state.requirements.interactionStyle).toBe("conversational");
    });

    it("should update capabilities from architecture questions", () => {
      useAdvisorStore.setState({ currentStage: "architecture", currentQuestionIndex: 0 });

      // Memory needs
      useAdvisorStore.getState().recordResponse("q7_memory_needs", "long-term");
      expect(useAdvisorStore.getState().requirements.capabilities?.memory).toBe("long-term");

      // File access
      useAdvisorStore.getState().recordResponse("q8_file_access", true);
      expect(useAdvisorStore.getState().requirements.capabilities?.fileAccess).toBe(true);

      // Web access
      useAdvisorStore.getState().recordResponse("q9_web_access", true);
      expect(useAdvisorStore.getState().requirements.capabilities?.webAccess).toBe(true);

      // Code execution
      useAdvisorStore.getState().recordResponse("q10_code_execution", false);
      expect(useAdvisorStore.getState().requirements.capabilities?.codeExecution).toBe(false);

      // Data analysis
      useAdvisorStore.getState().recordResponse("q11_data_analysis", true);
      expect(useAdvisorStore.getState().requirements.capabilities?.dataAnalysis).toBe(true);
    });

    it("should update toolIntegrations from q12_tool_integrations", () => {
      useAdvisorStore.setState({ currentStage: "architecture", currentQuestionIndex: 5 });
      useAdvisorStore.getState().recordResponse("q12_tool_integrations", "GitHub, Jira, Slack");
      const state = useAdvisorStore.getState();

      expect(state.requirements.capabilities?.toolIntegrations).toEqual(["GitHub", "Jira", "Slack"]);
    });

    it("should update environment from q13_runtime_preference", () => {
      useAdvisorStore.setState({ currentStage: "output", currentQuestionIndex: 0 });
      useAdvisorStore.getState().recordResponse("q13_runtime_preference", "hybrid");
      const state = useAdvisorStore.getState();

      expect(state.requirements.environment?.runtime).toBe("hybrid");
    });

    it("should update constraints from q14_constraints", () => {
      useAdvisorStore.setState({ currentStage: "output", currentQuestionIndex: 1 });
      useAdvisorStore.getState().recordResponse("q14_constraints", "Budget limit, GDPR compliance");
      const state = useAdvisorStore.getState();

      expect(state.requirements.constraints).toEqual(["Budget limit", "GDPR compliance"]);
    });

    it("should update additionalNotes from q15_additional_notes", () => {
      useAdvisorStore.setState({ currentStage: "output", currentQuestionIndex: 2 });
      useAdvisorStore.getState().recordResponse("q15_additional_notes", "Should support multiple languages");
      const state = useAdvisorStore.getState();

      expect(state.requirements.additionalNotes).toBe("Should support multiple languages");
    });

    it("should update deliveryChannels from q5_delivery_channels", () => {
      useAdvisorStore.setState({ currentStage: "requirements", currentQuestionIndex: 1 });
      useAdvisorStore.getState().recordResponse("q5_delivery_channels", ["CLI", "Web", "API"]);
      const state = useAdvisorStore.getState();

      expect(state.requirements.deliveryChannels).toEqual(["CLI", "Web", "API"]);
    });

    it("should update successMetrics from q6_success_metrics", () => {
      useAdvisorStore.setState({ currentStage: "requirements", currentQuestionIndex: 2 });
      useAdvisorStore.getState().recordResponse("q6_success_metrics", ["Task completion rate", "User satisfaction"]);
      const state = useAdvisorStore.getState();

      expect(state.requirements.successMetrics).toEqual(["Task completion rate", "User satisfaction"]);
    });

    it("should handle empty string for tool integrations", () => {
      useAdvisorStore.setState({ currentStage: "architecture", currentQuestionIndex: 5 });
      useAdvisorStore.getState().recordResponse("q12_tool_integrations", "");
      const state = useAdvisorStore.getState();

      expect(state.requirements.capabilities?.toolIntegrations).toEqual([]);
    });

    it("should handle whitespace-only string for tool integrations", () => {
      useAdvisorStore.setState({ currentStage: "architecture", currentQuestionIndex: 5 });
      useAdvisorStore.getState().recordResponse("q12_tool_integrations", "   ,  ,   ");
      const state = useAdvisorStore.getState();

      expect(state.requirements.capabilities?.toolIntegrations).toEqual([]);
    });

    it("should not set constraints for empty string", () => {
      useAdvisorStore.setState({ currentStage: "output", currentQuestionIndex: 1 });
      useAdvisorStore.getState().recordResponse("q14_constraints", "");
      const state = useAdvisorStore.getState();

      expect(state.requirements.constraints).toBeUndefined();
    });

    it("should not set constraints for whitespace-only string", () => {
      useAdvisorStore.setState({ currentStage: "output", currentQuestionIndex: 1 });
      useAdvisorStore.getState().recordResponse("q14_constraints", "   ");
      const state = useAdvisorStore.getState();

      expect(state.requirements.constraints).toBeUndefined();
    });

    it("should not set additionalNotes for empty string", () => {
      useAdvisorStore.setState({ currentStage: "output", currentQuestionIndex: 2 });
      useAdvisorStore.getState().recordResponse("q15_additional_notes", "");
      const state = useAdvisorStore.getState();

      expect(state.requirements.additionalNotes).toBeUndefined();
    });

    it("should not overwrite existing description when recording agent name", () => {
      useAdvisorStore.setState({ requirements: { description: "Existing description" } });
      useAdvisorStore.getState().recordResponse("q1_agent_name", "New Agent");
      const state = useAdvisorStore.getState();

      expect(state.requirements.name).toBe("New Agent");
      expect(state.requirements.description).toBe("Existing description");
    });

    it("should not overwrite existing description when recording primary outcome", () => {
      useAdvisorStore.setState({
        currentQuestionIndex: 1,
        requirements: { description: "Existing description" }
      });
      useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Automate tasks");
      const state = useAdvisorStore.getState();

      expect(state.requirements.primaryOutcome).toBe("Automate tasks");
      expect(state.requirements.description).toBe("Existing description");
    });

    it("should create default capabilities object when updating architecture questions", () => {
      useAdvisorStore.setState({
        currentStage: "architecture",
        currentQuestionIndex: 0,
        requirements: {}
      });
      useAdvisorStore.getState().recordResponse("q7_memory_needs", "short-term");
      const state = useAdvisorStore.getState();

      expect(state.requirements.capabilities).toBeDefined();
      expect(state.requirements.capabilities?.memory).toBe("short-term");
      expect(state.requirements.capabilities?.fileAccess).toBe(false);
      expect(state.requirements.capabilities?.webAccess).toBe(false);
      expect(state.requirements.capabilities?.codeExecution).toBe(false);
      expect(state.requirements.capabilities?.dataAnalysis).toBe(false);
      expect(state.requirements.capabilities?.toolIntegrations).toEqual([]);
    });
  });

  describe("Stage Progression", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it("should start in discovery stage", () => {
      expect(useAdvisorStore.getState().currentStage).toBe("discovery");
    });

    it("should advance to requirements stage after completing discovery questions", () => {
      // Discovery has 3 questions (q1, q2, q3)
      useAdvisorStore.getState().recordResponse("q1_agent_name", "Test");
      useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Goal");
      useAdvisorStore.getState().recordResponse("q3_target_audience", ["Developers"]);

      expect(useAdvisorStore.getState().currentStage).toBe("requirements");
      expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
    });

    it("should advance to architecture stage after completing requirements questions", () => {
      // Move through discovery first
      useAdvisorStore.setState({
        currentStage: "requirements",
        currentQuestionIndex: 0,
        responses: { q1_agent_name: "Test", q2_primary_outcome: "Goal", q3_target_audience: ["Dev"] },
      });

      // Requirements has 3 questions (q4, q5, q6)
      useAdvisorStore.getState().recordResponse("q4_interaction_style", "conversational");
      useAdvisorStore.getState().recordResponse("q5_delivery_channels", ["CLI"]);
      useAdvisorStore.getState().recordResponse("q6_success_metrics", ["Task completion rate"]);

      expect(useAdvisorStore.getState().currentStage).toBe("architecture");
      expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
    });

    it("should advance to output stage after completing architecture questions", () => {
      // Move through to architecture
      useAdvisorStore.setState({
        currentStage: "architecture",
        currentQuestionIndex: 0,
        responses: {},
      });

      // Architecture has 6 questions (q7-q12)
      useAdvisorStore.getState().recordResponse("q7_memory_needs", "short-term");
      useAdvisorStore.getState().recordResponse("q8_file_access", true);
      useAdvisorStore.getState().recordResponse("q9_web_access", false);
      useAdvisorStore.getState().recordResponse("q10_code_execution", true);
      useAdvisorStore.getState().recordResponse("q11_data_analysis", false);
      useAdvisorStore.getState().recordResponse("q12_tool_integrations", "");

      expect(useAdvisorStore.getState().currentStage).toBe("output");
      expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
    });

    it("should mark interview as complete after output stage", () => {
      // Move through to output
      useAdvisorStore.setState({
        currentStage: "output",
        currentQuestionIndex: 0,
        responses: {},
      });

      // Output has 3 questions (q13, q14, q15)
      useAdvisorStore.getState().recordResponse("q13_runtime_preference", "cloud");
      useAdvisorStore.getState().recordResponse("q14_constraints", "");
      useAdvisorStore.getState().recordResponse("q15_additional_notes", "");

      expect(useAdvisorStore.getState().currentStage).toBe("complete");
      expect(useAdvisorStore.getState().isComplete).toBe(true);
    });

    it("should follow correct stage order", () => {
      const stageOrder = ["discovery", "requirements", "architecture", "output", "complete"];
      const discoveryQuestions = INTERVIEW_QUESTIONS.filter((q) => q.stage === "discovery");
      const requirementsQuestions = INTERVIEW_QUESTIONS.filter((q) => q.stage === "requirements");
      const architectureQuestions = INTERVIEW_QUESTIONS.filter((q) => q.stage === "architecture");
      const outputQuestions = INTERVIEW_QUESTIONS.filter((q) => q.stage === "output");

      const allQuestions = [
        ...discoveryQuestions,
        ...requirementsQuestions,
        ...architectureQuestions,
        ...outputQuestions,
      ];

      // Answer all questions
      allQuestions.forEach((question) => {
        const currentStage = useAdvisorStore.getState().currentStage;
        const expectedStageIndex = stageOrder.indexOf(currentStage);
        expect(expectedStageIndex).toBeLessThan(stageOrder.length - 1); // Not complete yet

        // Provide appropriate response based on question type
        let response: string | boolean | string[];
        switch (question.type) {
          case "text":
            response = "Test response";
            break;
          case "boolean":
            response = true;
            break;
          case "choice":
            response = question.options![0] ?? "";
            break;
          case "multiselect":
            response = [question.options![0] ?? ""];
            break;
          default:
            response = "default";
        }
        useAdvisorStore.getState().recordResponse(question.id, response);
      });

      expect(useAdvisorStore.getState().currentStage).toBe("complete");
      expect(useAdvisorStore.getState().isComplete).toBe(true);
    });
  });

  describe("Question Navigation", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    describe("Skip Question", () => {
      it("should advance to next question when skipping", () => {
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);

        useAdvisorStore.getState().skipQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);
      });

      it("should not record a response when skipping", () => {
        useAdvisorStore.getState().skipQuestion();
        expect(Object.keys(useAdvisorStore.getState().responses)).toHaveLength(0);
      });

      it("should advance to next stage when skipping last question of stage", () => {
        // Move to last question of discovery (index 2)
        useAdvisorStore.setState({ currentQuestionIndex: 2 });

        useAdvisorStore.getState().skipQuestion();

        expect(useAdvisorStore.getState().currentStage).toBe("requirements");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
      });

      it("should complete interview when skipping last question of output stage", () => {
        // Move to last question of output
        useAdvisorStore.setState({
          currentStage: "output",
          currentQuestionIndex: 2,
        });

        useAdvisorStore.getState().skipQuestion();

        expect(useAdvisorStore.getState().currentStage).toBe("complete");
        expect(useAdvisorStore.getState().isComplete).toBe(true);
      });

      it("should skip multiple questions consecutively within a stage", () => {
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);

        useAdvisorStore.getState().skipQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);

        useAdvisorStore.getState().skipQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);
      });

      it("should skip through an entire stage", () => {
        // Discovery has 3 questions
        expect(useAdvisorStore.getState().currentStage).toBe("discovery");

        useAdvisorStore.getState().skipQuestion();
        useAdvisorStore.getState().skipQuestion();
        useAdvisorStore.getState().skipQuestion();

        expect(useAdvisorStore.getState().currentStage).toBe("requirements");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
      });

      it("should preserve existing responses when skipping", () => {
        // Record a response first
        useAdvisorStore.getState().recordResponse("q1_agent_name", "My Agent");
        expect(useAdvisorStore.getState().responses.q1_agent_name).toBe("My Agent");

        // Skip the next question
        useAdvisorStore.getState().skipQuestion();

        // Previous response should still be there
        expect(useAdvisorStore.getState().responses.q1_agent_name).toBe("My Agent");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);
      });

      it("should not update requirements when skipping", () => {
        useAdvisorStore.getState().recordResponse("q1_agent_name", "My Agent");
        expect(useAdvisorStore.getState().requirements.name).toBe("My Agent");

        useAdvisorStore.getState().skipQuestion();

        // Requirements should not have q2_primary_outcome
        expect(useAdvisorStore.getState().requirements.primaryOutcome).toBeUndefined();
      });
    });

    describe("Go To Previous Question", () => {
      it("should go to previous question within same stage", () => {
        useAdvisorStore.getState().recordResponse("q1_agent_name", "Test");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);

        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
      });

      it("should go to last question of previous stage when at first question", () => {
        // Move to requirements stage
        useAdvisorStore.setState({
          currentStage: "requirements",
          currentQuestionIndex: 0,
        });

        useAdvisorStore.getState().goToPreviousQuestion();

        // Discovery has 3 questions, so last index is 2
        expect(useAdvisorStore.getState().currentStage).toBe("discovery");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);
      });

      it("should not go back from first question of first stage", () => {
        expect(useAdvisorStore.getState().currentStage).toBe("discovery");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);

        useAdvisorStore.getState().goToPreviousQuestion();

        expect(useAdvisorStore.getState().currentStage).toBe("discovery");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
      });

      it("should clear isComplete when going back from complete state", () => {
        // Set to complete
        useAdvisorStore.setState({
          currentStage: "complete",
          currentQuestionIndex: 0,
          isComplete: true,
        });

        useAdvisorStore.getState().goToPreviousQuestion();

        expect(useAdvisorStore.getState().isComplete).toBe(false);
        expect(useAdvisorStore.getState().currentStage).toBe("output");
      });

      it("should go back multiple questions consecutively within a stage", () => {
        // Move forward a few questions
        useAdvisorStore.getState().recordResponse("q1_agent_name", "Test");
        useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Goal");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);

        // Go back twice
        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);

        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
      });

      it("should preserve responses when going back", () => {
        // Record responses
        useAdvisorStore.getState().recordResponse("q1_agent_name", "Test Agent");
        useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Test Goal");

        // Go back
        useAdvisorStore.getState().goToPreviousQuestion();

        // Responses should still be there
        expect(useAdvisorStore.getState().responses.q1_agent_name).toBe("Test Agent");
        expect(useAdvisorStore.getState().responses.q2_primary_outcome).toBe("Test Goal");
      });

      it("should allow re-answering a question after going back", () => {
        // Record initial response
        useAdvisorStore.getState().recordResponse("q1_agent_name", "Original Name");

        // Go back
        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);

        // Re-answer
        useAdvisorStore.getState().recordResponse("q1_agent_name", "New Name");

        expect(useAdvisorStore.getState().responses.q1_agent_name).toBe("New Name");
        expect(useAdvisorStore.getState().requirements.name).toBe("New Name");
      });

      it("should go back across multiple stages", () => {
        // Move to architecture stage
        useAdvisorStore.setState({
          currentStage: "architecture",
          currentQuestionIndex: 0,
        });

        // Go back to requirements (last question)
        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentStage).toBe("requirements");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);

        // Go back within requirements
        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentStage).toBe("requirements");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);

        // Keep going back to discovery
        useAdvisorStore.getState().goToPreviousQuestion();
        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentStage).toBe("discovery");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);
      });

      it("should navigate back to last question of output when going back from complete", () => {
        // Set to complete
        useAdvisorStore.setState({
          currentStage: "complete",
          currentQuestionIndex: 0,
          isComplete: true,
        });

        useAdvisorStore.getState().goToPreviousQuestion();

        // Output has 3 questions, so last index is 2
        expect(useAdvisorStore.getState().currentStage).toBe("output");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);
      });
    });

    describe("Combined Navigation", () => {
      it("should handle skip then go back correctly", () => {
        // Skip first question
        useAdvisorStore.getState().skipQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);

        // Go back
        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);

        // Now answer it
        useAdvisorStore.getState().recordResponse("q1_agent_name", "Answered After Skip");
        expect(useAdvisorStore.getState().responses.q1_agent_name).toBe("Answered After Skip");
      });

      it("should handle mixed navigation through stages", () => {
        // Answer first two, skip third, move to requirements
        useAdvisorStore.getState().recordResponse("q1_agent_name", "Test");
        useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Goal");
        useAdvisorStore.getState().skipQuestion(); // Skip q3

        expect(useAdvisorStore.getState().currentStage).toBe("requirements");

        // Go back to discovery
        useAdvisorStore.getState().goToPreviousQuestion();
        expect(useAdvisorStore.getState().currentStage).toBe("discovery");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(2);

        // Now answer it
        useAdvisorStore.getState().recordResponse("q3_target_audience", ["Developers"]);

        // Should be in requirements now
        expect(useAdvisorStore.getState().currentStage).toBe("requirements");
        expect(useAdvisorStore.getState().currentQuestionIndex).toBe(0);
      });

      it("should maintain correct progress when navigating back and forth", () => {
        // Answer some questions
        useAdvisorStore.getState().recordResponse("q1_agent_name", "Test");
        useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Goal");

        let progress = useAdvisorStore.getState().getProgress();
        expect(progress.totalAnswered).toBe(2);

        // Go back and re-answer (should not increase total)
        useAdvisorStore.getState().goToPreviousQuestion();
        useAdvisorStore.getState().recordResponse("q2_primary_outcome", "New Goal");

        progress = useAdvisorStore.getState().getProgress();
        expect(progress.totalAnswered).toBe(2); // Still 2, not 3
      });
    });
  });

  describe("Progress Tracking", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it("should return correct progress at start", () => {
      const progress = useAdvisorStore.getState().getProgress();

      expect(progress.currentStage).toBe("discovery");
      expect(progress.stageIndex).toBe(0);
      expect(progress.questionInStage).toBe(0);
      expect(progress.totalAnswered).toBe(0);
      expect(progress.totalQuestions).toBe(INTERVIEW_QUESTIONS.length);
      expect(progress.percentage).toBe(0);
    });

    it("should update totalAnswered as responses are recorded", () => {
      useAdvisorStore.getState().recordResponse("q1_agent_name", "Test");
      expect(useAdvisorStore.getState().getProgress().totalAnswered).toBe(1);

      useAdvisorStore.getState().recordResponse("q2_primary_outcome", "Goal");
      expect(useAdvisorStore.getState().getProgress().totalAnswered).toBe(2);
    });

    it("should calculate percentage correctly", () => {
      const totalQuestions = INTERVIEW_QUESTIONS.length;

      useAdvisorStore.getState().recordResponse("q1_agent_name", "Test");
      const progress = useAdvisorStore.getState().getProgress();

      expect(progress.percentage).toBe(Math.round((1 / totalQuestions) * 100));
    });

    it("should report correct stage index", () => {
      expect(useAdvisorStore.getState().getProgress().stageIndex).toBe(0); // discovery

      useAdvisorStore.setState({ currentStage: "requirements" });
      expect(useAdvisorStore.getState().getProgress().stageIndex).toBe(1);

      useAdvisorStore.setState({ currentStage: "architecture" });
      expect(useAdvisorStore.getState().getProgress().stageIndex).toBe(2);

      useAdvisorStore.setState({ currentStage: "output" });
      expect(useAdvisorStore.getState().getProgress().stageIndex).toBe(3);

      useAdvisorStore.setState({ currentStage: "complete" });
      expect(useAdvisorStore.getState().getProgress().stageIndex).toBe(4);
    });

    it("should report correct questions in current stage", () => {
      const discoveryCount = INTERVIEW_QUESTIONS.filter((q) => q.stage === "discovery").length;
      const requirementsCount = INTERVIEW_QUESTIONS.filter((q) => q.stage === "requirements").length;

      expect(useAdvisorStore.getState().getProgress().questionsInCurrentStage).toBe(discoveryCount);

      useAdvisorStore.setState({ currentStage: "requirements" });
      expect(useAdvisorStore.getState().getProgress().questionsInCurrentStage).toBe(requirementsCount);
    });
  });

  describe("Current Question", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it("should return first question at start", () => {
      const question = useAdvisorStore.getState().getCurrentQuestion();
      expect(question).not.toBeNull();
      expect(question?.id).toBe("q1_agent_name");
    });

    it("should return correct question based on stage and index", () => {
      useAdvisorStore.setState({
        currentStage: "requirements",
        currentQuestionIndex: 1,
      });

      const question = useAdvisorStore.getState().getCurrentQuestion();
      expect(question?.id).toBe("q5_delivery_channels");
    });

    it("should return null when interview is complete", () => {
      useAdvisorStore.setState({
        currentStage: "complete",
        isComplete: true,
      });

      const question = useAdvisorStore.getState().getCurrentQuestion();
      expect(question).toBeNull();
    });
  });

  describe("Can Go Back", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it("should return false at first question of first stage", () => {
      expect(useAdvisorStore.getState().canGoBack()).toBe(false);
    });

    it("should return true at second question of first stage", () => {
      useAdvisorStore.setState({ currentQuestionIndex: 1 });
      expect(useAdvisorStore.getState().canGoBack()).toBe(true);
    });

    it("should return true at first question of second stage", () => {
      useAdvisorStore.setState({
        currentStage: "requirements",
        currentQuestionIndex: 0,
      });
      expect(useAdvisorStore.getState().canGoBack()).toBe(true);
    });
  });

  describe("Recommendations", () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it("should set recommendations and mark complete", () => {
      const mockRecommendations = {
        agentType: "code-assistant",
        requiredDependencies: ["@anthropic-ai/sdk"],
        mcpServers: [],
        toolConfigurations: [],
        estimatedComplexity: "medium" as const,
        implementationSteps: ["Step 1", "Step 2"],
      };

      useAdvisorStore.getState().setRecommendations(mockRecommendations);
      const state = useAdvisorStore.getState();

      expect(state.recommendations).toEqual(mockRecommendations);
      expect(state.isComplete).toBe(true);
    });
  });

  describe("Reset Interview", () => {
    it("should reset all state to initial values", () => {
      // Set up some state
      useAdvisorStore.setState({
        sessionId: "test-session",
        currentStage: "architecture",
        currentQuestionIndex: 3,
        responses: { q1_agent_name: "Test" },
        requirements: { name: "Test" },
        recommendations: { agentType: "test" } as never,
        isComplete: true,
        isGenerating: true,
        startedAt: new Date(),
      });

      useAdvisorStore.getState().resetInterview();
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBeNull();
      expect(state.currentStage).toBe("discovery");
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.responses).toEqual({});
      expect(state.requirements).toEqual({});
      expect(state.recommendations).toBeNull();
      expect(state.isComplete).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.startedAt).toBeNull();
    });
  });

  describe("Generating State", () => {
    it("should toggle generating state", () => {
      expect(useAdvisorStore.getState().isGenerating).toBe(false);

      useAdvisorStore.getState().setGenerating(true);
      expect(useAdvisorStore.getState().isGenerating).toBe(true);

      useAdvisorStore.getState().setGenerating(false);
      expect(useAdvisorStore.getState().isGenerating).toBe(false);
    });
  });
});
