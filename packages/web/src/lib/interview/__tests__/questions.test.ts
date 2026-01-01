import { describe, it, expect } from "vitest";
import { INTERVIEW_QUESTIONS, QUESTIONS } from "@/lib/interview/questions";
import type { InterviewQuestion } from "@/lib/interview/types";

/**
 * Unit tests for interview questions data integrity
 *
 * Tests all 15 questions for:
 * - Correct count and structure
 * - Required fields presence
 * - Valid values for enums (stage, type)
 * - Options presence for choice/multiselect types
 * - Unique IDs
 * - Stage distribution
 */

describe("Interview Questions", () => {
  describe("Array structure", () => {
    it("should export INTERVIEW_QUESTIONS as an array", () => {
      expect(Array.isArray(INTERVIEW_QUESTIONS)).toBe(true);
    });

    it("should have exactly 15 questions", () => {
      expect(INTERVIEW_QUESTIONS).toHaveLength(15);
    });

    it("should export QUESTIONS as an alias for backward compatibility", () => {
      expect(QUESTIONS).toBe(INTERVIEW_QUESTIONS);
    });
  });

  describe("Question IDs", () => {
    it("should have all unique question IDs", () => {
      const ids = INTERVIEW_QUESTIONS.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(INTERVIEW_QUESTIONS.length);
    });

    it("should have IDs following the naming convention q{number}_{name}", () => {
      INTERVIEW_QUESTIONS.forEach((question, index) => {
        const expectedPrefix = `q${index + 1}_`;
        expect(question.id).toMatch(new RegExp(`^${expectedPrefix}`));
      });
    });

    it("should have all expected question IDs", () => {
      const expectedIds = [
        "q1_agent_name",
        "q2_primary_outcome",
        "q3_target_audience",
        "q4_interaction_style",
        "q5_delivery_channels",
        "q6_success_metrics",
        "q7_memory_needs",
        "q8_file_access",
        "q9_web_access",
        "q10_code_execution",
        "q11_data_analysis",
        "q12_tool_integrations",
        "q13_runtime_preference",
        "q14_constraints",
        "q15_additional_notes",
      ];

      const actualIds = INTERVIEW_QUESTIONS.map((q) => q.id);
      expect(actualIds).toEqual(expectedIds);
    });
  });

  describe("Required fields", () => {
    it("should have 'id' field for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.id).toBeDefined();
        expect(typeof question.id).toBe("string");
        expect(question.id.length).toBeGreaterThan(0);
      });
    });

    it("should have 'stage' field for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.stage).toBeDefined();
        expect(typeof question.stage).toBe("string");
      });
    });

    it("should have 'text' field for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.text).toBeDefined();
        expect(typeof question.text).toBe("string");
        expect(question.text.length).toBeGreaterThan(0);
      });
    });

    it("should have 'type' field for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.type).toBeDefined();
        expect(typeof question.type).toBe("string");
      });
    });

    it("should have 'required' field as boolean for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.required).toBeDefined();
        expect(typeof question.required).toBe("boolean");
      });
    });

    it("should have 'hint' field for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.hint).toBeDefined();
        expect(typeof question.hint).toBe("string");
        expect(question.hint!.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Stage values", () => {
    const validStages = ["discovery", "requirements", "architecture", "output"];

    it("should have valid stage values for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(validStages).toContain(question.stage);
      });
    });

    it("should have 3 questions in discovery stage", () => {
      const discoveryQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.stage === "discovery"
      );
      expect(discoveryQuestions).toHaveLength(3);
    });

    it("should have 3 questions in requirements stage", () => {
      const requirementsQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.stage === "requirements"
      );
      expect(requirementsQuestions).toHaveLength(3);
    });

    it("should have 6 questions in architecture stage", () => {
      const architectureQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.stage === "architecture"
      );
      expect(architectureQuestions).toHaveLength(6);
    });

    it("should have 3 questions in output stage", () => {
      const outputQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.stage === "output"
      );
      expect(outputQuestions).toHaveLength(3);
    });

    it("should have questions ordered by stage (discovery, requirements, architecture, output)", () => {
      const stages = INTERVIEW_QUESTIONS.map((q) => q.stage);
      const stageOrder = ["discovery", "requirements", "architecture", "output"];
      let currentStageIndex = 0;

      stages.forEach((stage) => {
        const stageIdx = stageOrder.indexOf(stage);
        expect(stageIdx).toBeGreaterThanOrEqual(currentStageIndex);
        currentStageIndex = stageIdx;
      });
    });
  });

  describe("Type values", () => {
    const validTypes = ["text", "choice", "multiselect", "boolean"];

    it("should have valid type values for all questions", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(validTypes).toContain(question.type);
      });
    });

    it("should have correct type distribution", () => {
      const typeCount = INTERVIEW_QUESTIONS.reduce(
        (acc, q) => {
          acc[q.type] = (acc[q.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(typeCount.text).toBe(5);
      expect(typeCount.choice).toBe(3);
      expect(typeCount.multiselect).toBe(3);
      expect(typeCount.boolean).toBe(4);
    });
  });

  describe("Options validation", () => {
    it("should have options for choice type questions", () => {
      const choiceQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.type === "choice"
      );

      choiceQuestions.forEach((question) => {
        expect(question.options).toBeDefined();
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options!.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should have options for multiselect type questions", () => {
      const multiselectQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.type === "multiselect"
      );

      multiselectQuestions.forEach((question) => {
        expect(question.options).toBeDefined();
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options!.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should have non-empty string options", () => {
      const questionsWithOptions = INTERVIEW_QUESTIONS.filter(
        (q) => q.options !== undefined
      );

      questionsWithOptions.forEach((question) => {
        question.options!.forEach((option) => {
          expect(typeof option).toBe("string");
          expect(option.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have unique options within each question", () => {
      const questionsWithOptions = INTERVIEW_QUESTIONS.filter(
        (q) => q.options !== undefined
      );

      questionsWithOptions.forEach((question) => {
        const uniqueOptions = new Set(question.options);
        expect(uniqueOptions.size).toBe(question.options!.length);
      });
    });

    it("should not have options for text and boolean type questions", () => {
      const textQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.type === "text"
      );
      const booleanQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.type === "boolean"
      );

      textQuestions.forEach((question) => {
        expect(question.options).toBeUndefined();
      });

      booleanQuestions.forEach((question) => {
        expect(question.options).toBeUndefined();
      });
    });
  });

  describe("Required field values", () => {
    it("should have correct required status for each question", () => {
      const requiredQuestionIds = [
        "q1_agent_name",
        "q2_primary_outcome",
        "q3_target_audience",
        "q4_interaction_style",
        "q5_delivery_channels",
        "q6_success_metrics",
        "q7_memory_needs",
        "q8_file_access",
        "q9_web_access",
        "q10_code_execution",
        "q11_data_analysis",
        "q13_runtime_preference",
      ];

      const optionalQuestionIds = [
        "q12_tool_integrations",
        "q14_constraints",
        "q15_additional_notes",
      ];

      INTERVIEW_QUESTIONS.forEach((question) => {
        if (requiredQuestionIds.includes(question.id)) {
          expect(question.required).toBe(true);
        }
        if (optionalQuestionIds.includes(question.id)) {
          expect(question.required).toBe(false);
        }
      });
    });

    it("should have 12 required questions", () => {
      const requiredQuestions = INTERVIEW_QUESTIONS.filter((q) => q.required);
      expect(requiredQuestions).toHaveLength(12);
    });

    it("should have 3 optional questions", () => {
      const optionalQuestions = INTERVIEW_QUESTIONS.filter((q) => !q.required);
      expect(optionalQuestions).toHaveLength(3);
    });
  });

  describe("Individual question validation", () => {
    const questionsMap = new Map<string, InterviewQuestion>(
      INTERVIEW_QUESTIONS.map((q) => [q.id, q])
    );

    describe("Q1: Agent Name", () => {
      const question = questionsMap.get("q1_agent_name")!;

      it("should be in discovery stage", () => {
        expect(question.stage).toBe("discovery");
      });

      it("should be a text type", () => {
        expect(question.type).toBe("text");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });
    });

    describe("Q2: Primary Outcome", () => {
      const question = questionsMap.get("q2_primary_outcome")!;

      it("should be in discovery stage", () => {
        expect(question.stage).toBe("discovery");
      });

      it("should be a text type", () => {
        expect(question.type).toBe("text");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });
    });

    describe("Q3: Target Audience", () => {
      const question = questionsMap.get("q3_target_audience")!;

      it("should be in discovery stage", () => {
        expect(question.stage).toBe("discovery");
      });

      it("should be a multiselect type", () => {
        expect(question.type).toBe("multiselect");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });

      it("should have 7 audience options", () => {
        expect(question.options).toHaveLength(7);
        expect(question.options).toContain("Developers");
        expect(question.options).toContain("End Users");
        expect(question.options).toContain("Other");
      });
    });

    describe("Q4: Interaction Style", () => {
      const question = questionsMap.get("q4_interaction_style")!;

      it("should be in requirements stage", () => {
        expect(question.stage).toBe("requirements");
      });

      it("should be a choice type", () => {
        expect(question.type).toBe("choice");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });

      it("should have exactly 3 interaction style options", () => {
        expect(question.options).toHaveLength(3);
        expect(question.options).toContain("conversational");
        expect(question.options).toContain("task-focused");
        expect(question.options).toContain("collaborative");
      });
    });

    describe("Q5: Delivery Channels", () => {
      const question = questionsMap.get("q5_delivery_channels")!;

      it("should be in requirements stage", () => {
        expect(question.stage).toBe("requirements");
      });

      it("should be a multiselect type", () => {
        expect(question.type).toBe("multiselect");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });

      it("should have 7 channel options", () => {
        expect(question.options).toHaveLength(7);
        expect(question.options).toContain("CLI");
        expect(question.options).toContain("Web Application");
        expect(question.options).toContain("API");
      });
    });

    describe("Q6: Success Metrics", () => {
      const question = questionsMap.get("q6_success_metrics")!;

      it("should be in requirements stage", () => {
        expect(question.stage).toBe("requirements");
      });

      it("should be a multiselect type", () => {
        expect(question.type).toBe("multiselect");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });

      it("should have 7 metric options", () => {
        expect(question.options).toHaveLength(7);
        expect(question.options).toContain("User satisfaction scores");
        expect(question.options).toContain("Task completion rate");
      });
    });

    describe("Q7: Memory Needs", () => {
      const question = questionsMap.get("q7_memory_needs")!;

      it("should be in architecture stage", () => {
        expect(question.stage).toBe("architecture");
      });

      it("should be a choice type", () => {
        expect(question.type).toBe("choice");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });

      it("should have 3 memory options", () => {
        expect(question.options).toHaveLength(3);
        expect(question.options).toContain("none");
        expect(question.options).toContain("short-term");
        expect(question.options).toContain("long-term");
      });
    });

    describe("Q8: File Access", () => {
      const question = questionsMap.get("q8_file_access")!;

      it("should be in architecture stage", () => {
        expect(question.stage).toBe("architecture");
      });

      it("should be a boolean type", () => {
        expect(question.type).toBe("boolean");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });
    });

    describe("Q9: Web Access", () => {
      const question = questionsMap.get("q9_web_access")!;

      it("should be in architecture stage", () => {
        expect(question.stage).toBe("architecture");
      });

      it("should be a boolean type", () => {
        expect(question.type).toBe("boolean");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });
    });

    describe("Q10: Code Execution", () => {
      const question = questionsMap.get("q10_code_execution")!;

      it("should be in architecture stage", () => {
        expect(question.stage).toBe("architecture");
      });

      it("should be a boolean type", () => {
        expect(question.type).toBe("boolean");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });
    });

    describe("Q11: Data Analysis", () => {
      const question = questionsMap.get("q11_data_analysis")!;

      it("should be in architecture stage", () => {
        expect(question.stage).toBe("architecture");
      });

      it("should be a boolean type", () => {
        expect(question.type).toBe("boolean");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });
    });

    describe("Q12: Tool Integrations", () => {
      const question = questionsMap.get("q12_tool_integrations")!;

      it("should be in architecture stage", () => {
        expect(question.stage).toBe("architecture");
      });

      it("should be a text type", () => {
        expect(question.type).toBe("text");
      });

      it("should be optional", () => {
        expect(question.required).toBe(false);
      });

      it("should have a followUp field", () => {
        expect(question.followUp).toBeDefined();
        expect(typeof question.followUp).toBe("string");
      });
    });

    describe("Q13: Runtime Preference", () => {
      const question = questionsMap.get("q13_runtime_preference")!;

      it("should be in output stage", () => {
        expect(question.stage).toBe("output");
      });

      it("should be a choice type", () => {
        expect(question.type).toBe("choice");
      });

      it("should be required", () => {
        expect(question.required).toBe(true);
      });

      it("should have 3 runtime options", () => {
        expect(question.options).toHaveLength(3);
        expect(question.options).toContain("cloud");
        expect(question.options).toContain("local");
        expect(question.options).toContain("hybrid");
      });
    });

    describe("Q14: Constraints", () => {
      const question = questionsMap.get("q14_constraints")!;

      it("should be in output stage", () => {
        expect(question.stage).toBe("output");
      });

      it("should be a text type", () => {
        expect(question.type).toBe("text");
      });

      it("should be optional", () => {
        expect(question.required).toBe(false);
      });
    });

    describe("Q15: Additional Notes", () => {
      const question = questionsMap.get("q15_additional_notes")!;

      it("should be in output stage", () => {
        expect(question.stage).toBe("output");
      });

      it("should be a text type", () => {
        expect(question.type).toBe("text");
      });

      it("should be optional", () => {
        expect(question.required).toBe(false);
      });

      it("should be the last question", () => {
        const lastQuestion = INTERVIEW_QUESTIONS[INTERVIEW_QUESTIONS.length - 1]!;
        expect(lastQuestion.id).toBe("q15_additional_notes");
      });
    });
  });

  describe("Text content quality", () => {
    it("should have question text ending with a question mark", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.text.endsWith("?")).toBe(true);
      });
    });

    it("should have non-trivial question text (at least 10 characters)", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.text.length).toBeGreaterThanOrEqual(10);
      });
    });

    it("should have non-trivial hint text (at least 10 characters)", () => {
      INTERVIEW_QUESTIONS.forEach((question) => {
        expect(question.hint!.length).toBeGreaterThanOrEqual(10);
      });
    });
  });
});
