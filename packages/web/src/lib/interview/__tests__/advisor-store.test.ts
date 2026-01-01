import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAdvisorStore } from '@/stores/advisor-store';
import { INTERVIEW_QUESTIONS } from '../questions';
import type { AgentRecommendations } from '@/types/interview';
import { localStorageMock } from '@/test/setup';

/**
 * Helper to get questions for a specific stage
 */
function getQuestionsForStage(stage: string) {
  return INTERVIEW_QUESTIONS.filter((q) => q.stage === stage);
}

/**
 * Factory function to create mock recommendations for testing
 */
function createMockRecommendations(
  overrides: Partial<AgentRecommendations> = {}
): AgentRecommendations {
  return {
    agentType: 'code-assistant',
    requiredDependencies: ['typescript'],
    mcpServers: [],
    toolConfigurations: [],
    estimatedComplexity: 'medium',
    implementationSteps: ['Step 1', 'Step 2'],
    ...overrides,
  };
}

describe('useAdvisorStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Reset store state before each test
    useAdvisorStore.getState().resetInterview();

    // Mock crypto.randomUUID for predictable session IDs
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-session-uuid-1234'),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state values', () => {
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBeNull();
      expect(state.currentStage).toBe('discovery');
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.responses).toEqual({});
      expect(state.requirements).toEqual({});
      expect(state.recommendations).toBeNull();
      expect(state.isComplete).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.startedAt).toBeNull();
    });
  });

  describe('initSession', () => {
    it('should initialize session with generated UUID when no sessionId provided', () => {
      useAdvisorStore.getState().initSession();
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBe('test-session-uuid-1234');
      expect(state.currentStage).toBe('discovery');
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.responses).toEqual({});
      expect(state.requirements).toEqual({});
      expect(state.recommendations).toBeNull();
      expect(state.isComplete).toBe(false);
      expect(state.startedAt).toBeInstanceOf(Date);
    });

    it('should initialize session with provided sessionId', () => {
      useAdvisorStore.getState().initSession('custom-session-id');
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBe('custom-session-id');
    });

    it('should reset all state when reinitializing', () => {
      // Set up some state first
      const store = useAdvisorStore.getState();
      store.initSession();
      store.recordResponse('q1_agent_name', 'TestAgent');

      // Reinitialize
      store.initSession('new-session');
      const state = useAdvisorStore.getState();

      expect(state.sessionId).toBe('new-session');
      expect(state.responses).toEqual({});
      expect(state.requirements).toEqual({});
    });
  });

  describe('recordResponse', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should record response and advance to next question in same stage', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'TestAgent');

      const state = useAdvisorStore.getState();
      expect(state.responses['q1_agent_name']).toBe('TestAgent');
      expect(state.currentQuestionIndex).toBe(1);
      expect(state.currentStage).toBe('discovery');
    });

    it('should update requirements when recording agent name', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'MyTestAgent');

      const state = useAdvisorStore.getState();
      expect(state.requirements.name).toBe('MyTestAgent');
      expect(state.requirements.description).toBe('MyTestAgent agent');
    });

    it('should update requirements when recording primary outcome', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q2_primary_outcome', 'Automate testing tasks');

      const state = useAdvisorStore.getState();
      expect(state.requirements.primaryOutcome).toBe('Automate testing tasks');
      expect(state.requirements.description).toBe('Agent for: Automate testing tasks');
    });

    it('should not overwrite description if already set by name', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'TestAgent');
      store.recordResponse('q2_primary_outcome', 'Testing');

      const state = useAdvisorStore.getState();
      expect(state.requirements.description).toBe('TestAgent agent');
    });

    it('should advance to next stage when completing all stage questions', () => {
      const store = useAdvisorStore.getState();
      const discoveryQuestions = getQuestionsForStage('discovery');

      // Answer all discovery questions
      discoveryQuestions.forEach((q, index) => {
        const value =
          q.type === 'multiselect' ? ['Developers'] : q.type === 'boolean' ? true : 'Test answer';
        store.recordResponse(q.id, value);
      });

      const state = useAdvisorStore.getState();
      expect(state.currentStage).toBe('requirements');
      expect(state.currentQuestionIndex).toBe(0);
    });

    it('should set isComplete when finishing all stages', () => {
      const store = useAdvisorStore.getState();

      // Answer all questions
      INTERVIEW_QUESTIONS.forEach((q) => {
        const value =
          q.type === 'multiselect'
            ? ['Developers']
            : q.type === 'boolean'
              ? true
              : q.type === 'choice'
                ? q.options?.[0]
                : 'Test answer';
        store.recordResponse(q.id, value);
      });

      const state = useAdvisorStore.getState();
      expect(state.isComplete).toBe(true);
      expect(state.currentStage).toBe('complete');
    });

    it('should update target audience from multiselect', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q3_target_audience', ['Developers', 'Data Scientists']);

      const state = useAdvisorStore.getState();
      expect(state.requirements.targetAudience).toEqual(['Developers', 'Data Scientists']);
    });

    it('should update interaction style from choice', () => {
      // Navigate to requirements stage first
      const store = useAdvisorStore.getState();
      const discoveryQuestions = getQuestionsForStage('discovery');
      discoveryQuestions.forEach((q) => {
        store.recordResponse(q.id, q.type === 'multiselect' ? ['Developers'] : 'Test');
      });

      store.recordResponse('q4_interaction_style', 'conversational');

      const state = useAdvisorStore.getState();
      expect(state.requirements.interactionStyle).toBe('conversational');
    });

    it('should update delivery channels', () => {
      const store = useAdvisorStore.getState();
      // Navigate to requirements stage
      getQuestionsForStage('discovery').forEach((q) => {
        store.recordResponse(q.id, q.type === 'multiselect' ? ['Developers'] : 'Test');
      });

      store.recordResponse('q4_interaction_style', 'task-focused');
      store.recordResponse('q5_delivery_channels', ['CLI', 'API']);

      const state = useAdvisorStore.getState();
      expect(state.requirements.deliveryChannels).toEqual(['CLI', 'API']);
    });

    it('should update success metrics', () => {
      const store = useAdvisorStore.getState();
      // Navigate to requirements stage
      getQuestionsForStage('discovery').forEach((q) => {
        store.recordResponse(q.id, q.type === 'multiselect' ? ['Developers'] : 'Test');
      });

      store.recordResponse('q4_interaction_style', 'task-focused');
      store.recordResponse('q5_delivery_channels', ['CLI']);
      store.recordResponse('q6_success_metrics', ['User satisfaction scores', 'Task completion rate']);

      const state = useAdvisorStore.getState();
      expect(state.requirements.successMetrics).toEqual([
        'User satisfaction scores',
        'Task completion rate',
      ]);
    });

    it('should update memory capability', () => {
      const store = useAdvisorStore.getState();
      // Navigate through stages
      answerAllQuestionsUpToStage(store, 'architecture');

      store.recordResponse('q7_memory_needs', 'long-term');

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities?.memory).toBe('long-term');
    });

    it('should update file access capability', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'architecture');
      store.recordResponse('q7_memory_needs', 'short-term');
      store.recordResponse('q8_file_access', true);

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities?.fileAccess).toBe(true);
    });

    it('should update web access capability', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'architecture');
      store.recordResponse('q7_memory_needs', 'short-term');
      store.recordResponse('q8_file_access', false);
      store.recordResponse('q9_web_access', true);

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities?.webAccess).toBe(true);
    });

    it('should update code execution capability', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'architecture');
      store.recordResponse('q7_memory_needs', 'none');
      store.recordResponse('q8_file_access', false);
      store.recordResponse('q9_web_access', false);
      store.recordResponse('q10_code_execution', true);

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities?.codeExecution).toBe(true);
    });

    it('should update data analysis capability', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'architecture');
      store.recordResponse('q7_memory_needs', 'none');
      store.recordResponse('q8_file_access', false);
      store.recordResponse('q9_web_access', false);
      store.recordResponse('q10_code_execution', false);
      store.recordResponse('q11_data_analysis', true);

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities?.dataAnalysis).toBe(true);
    });

    it('should parse tool integrations from comma-separated string', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'architecture');
      store.recordResponse('q7_memory_needs', 'none');
      store.recordResponse('q8_file_access', false);
      store.recordResponse('q9_web_access', false);
      store.recordResponse('q10_code_execution', false);
      store.recordResponse('q11_data_analysis', false);
      store.recordResponse('q12_tool_integrations', 'GitHub, Jira, Slack');

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities?.toolIntegrations).toEqual([
        'GitHub',
        'Jira',
        'Slack',
      ]);
    });

    it('should handle empty tool integrations string', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'architecture');
      store.recordResponse('q7_memory_needs', 'none');
      store.recordResponse('q8_file_access', false);
      store.recordResponse('q9_web_access', false);
      store.recordResponse('q10_code_execution', false);
      store.recordResponse('q11_data_analysis', false);
      store.recordResponse('q12_tool_integrations', '');

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities?.toolIntegrations).toEqual([]);
    });

    it('should update runtime preference', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'output');

      store.recordResponse('q13_runtime_preference', 'hybrid');

      const state = useAdvisorStore.getState();
      expect(state.requirements.environment?.runtime).toBe('hybrid');
    });

    it('should update constraints from comma-separated string', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'output');
      store.recordResponse('q13_runtime_preference', 'cloud');
      store.recordResponse('q14_constraints', 'Budget limit, SOC2 compliance');

      const state = useAdvisorStore.getState();
      expect(state.requirements.constraints).toEqual(['Budget limit', 'SOC2 compliance']);
    });

    it('should handle empty constraints string', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'output');
      store.recordResponse('q13_runtime_preference', 'local');
      store.recordResponse('q14_constraints', '');

      const state = useAdvisorStore.getState();
      expect(state.requirements.constraints).toBeUndefined();
    });

    it('should update additional notes', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'output');
      store.recordResponse('q13_runtime_preference', 'local');
      store.recordResponse('q14_constraints', '');
      store.recordResponse('q15_additional_notes', 'Important note for configuration');

      const state = useAdvisorStore.getState();
      expect(state.requirements.additionalNotes).toBe('Important note for configuration');
    });

    it('should handle empty additional notes', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'output');
      store.recordResponse('q13_runtime_preference', 'local');
      store.recordResponse('q14_constraints', '');
      store.recordResponse('q15_additional_notes', '');

      const state = useAdvisorStore.getState();
      expect(state.requirements.additionalNotes).toBeUndefined();
    });

    it('should handle whitespace-only additional notes', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'output');
      store.recordResponse('q13_runtime_preference', 'local');
      store.recordResponse('q14_constraints', '  ');
      store.recordResponse('q15_additional_notes', '   ');

      const state = useAdvisorStore.getState();
      expect(state.requirements.additionalNotes).toBeUndefined();
    });
  });

  describe('skipQuestion', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should advance to next question in same stage', () => {
      const store = useAdvisorStore.getState();
      store.skipQuestion();

      const state = useAdvisorStore.getState();
      expect(state.currentQuestionIndex).toBe(1);
      expect(state.currentStage).toBe('discovery');
    });

    it('should advance to next stage when skipping last question of stage', () => {
      const store = useAdvisorStore.getState();
      const discoveryQuestions = getQuestionsForStage('discovery');

      // Skip all discovery questions
      for (let i = 0; i < discoveryQuestions.length; i++) {
        store.skipQuestion();
      }

      const state = useAdvisorStore.getState();
      expect(state.currentStage).toBe('requirements');
      expect(state.currentQuestionIndex).toBe(0);
    });

    it('should complete interview when skipping all questions', () => {
      const store = useAdvisorStore.getState();

      // Skip all questions
      for (let i = 0; i < INTERVIEW_QUESTIONS.length; i++) {
        store.skipQuestion();
      }

      const state = useAdvisorStore.getState();
      expect(state.isComplete).toBe(true);
      expect(state.currentStage).toBe('complete');
    });

    it('should not record any responses when skipping', () => {
      const store = useAdvisorStore.getState();
      store.skipQuestion();
      store.skipQuestion();

      const state = useAdvisorStore.getState();
      expect(Object.keys(state.responses)).toHaveLength(0);
    });
  });

  describe('goToPreviousQuestion', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should go back within same stage', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'Test');

      expect(useAdvisorStore.getState().currentQuestionIndex).toBe(1);

      store.goToPreviousQuestion();

      const state = useAdvisorStore.getState();
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.currentStage).toBe('discovery');
    });

    it('should go back to previous stage', () => {
      const store = useAdvisorStore.getState();
      // Complete discovery stage
      getQuestionsForStage('discovery').forEach((q) => {
        store.recordResponse(q.id, q.type === 'multiselect' ? ['Developers'] : 'Test');
      });

      expect(useAdvisorStore.getState().currentStage).toBe('requirements');

      store.goToPreviousQuestion();

      const state = useAdvisorStore.getState();
      expect(state.currentStage).toBe('discovery');
      expect(state.currentQuestionIndex).toBe(getQuestionsForStage('discovery').length - 1);
    });

    it('should not go back from first question of first stage', () => {
      const store = useAdvisorStore.getState();
      store.goToPreviousQuestion();

      const state = useAdvisorStore.getState();
      expect(state.currentStage).toBe('discovery');
      expect(state.currentQuestionIndex).toBe(0);
    });

    it('should reset isComplete when going back from complete', () => {
      const store = useAdvisorStore.getState();
      // Complete all questions
      INTERVIEW_QUESTIONS.forEach((q) => {
        store.recordResponse(
          q.id,
          q.type === 'multiselect' ? ['Developers'] : q.type === 'boolean' ? true : q.options?.[0] || 'Test'
        );
      });

      expect(useAdvisorStore.getState().isComplete).toBe(true);

      store.goToPreviousQuestion();

      const state = useAdvisorStore.getState();
      expect(state.isComplete).toBe(false);
    });
  });

  describe('setRecommendations', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should set recommendations and mark complete', () => {
      const store = useAdvisorStore.getState();
      const mockRecs = createMockRecommendations();

      store.setRecommendations(mockRecs);

      const state = useAdvisorStore.getState();
      expect(state.recommendations).toEqual(mockRecs);
      expect(state.isComplete).toBe(true);
    });

    it('should overwrite existing recommendations', () => {
      const store = useAdvisorStore.getState();
      const mockRecs1 = createMockRecommendations({ agentType: 'type1' });
      const mockRecs2 = createMockRecommendations({ agentType: 'type2' });

      store.setRecommendations(mockRecs1);
      store.setRecommendations(mockRecs2);

      const state = useAdvisorStore.getState();
      expect(state.recommendations?.agentType).toBe('type2');
    });
  });

  describe('resetInterview', () => {
    it('should reset all state to initial values', () => {
      const store = useAdvisorStore.getState();
      store.initSession();
      store.recordResponse('q1_agent_name', 'TestAgent');
      store.setGenerating(true);
      store.setRecommendations(createMockRecommendations());

      store.resetInterview();

      const state = useAdvisorStore.getState();
      expect(state.sessionId).toBeNull();
      expect(state.currentStage).toBe('discovery');
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.responses).toEqual({});
      expect(state.requirements).toEqual({});
      expect(state.recommendations).toBeNull();
      expect(state.isComplete).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.startedAt).toBeNull();
    });
  });

  describe('setGenerating', () => {
    it('should set isGenerating to true', () => {
      const store = useAdvisorStore.getState();
      store.setGenerating(true);

      expect(useAdvisorStore.getState().isGenerating).toBe(true);
    });

    it('should set isGenerating to false', () => {
      const store = useAdvisorStore.getState();
      store.setGenerating(true);
      store.setGenerating(false);

      expect(useAdvisorStore.getState().isGenerating).toBe(false);
    });
  });

  describe('getCurrentQuestion', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should return first question initially', () => {
      const question = useAdvisorStore.getState().getCurrentQuestion();

      expect(question).toBeDefined();
      expect(question?.id).toBe('q1_agent_name');
    });

    it('should return correct question after advancing', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'Test');

      const question = useAdvisorStore.getState().getCurrentQuestion();
      expect(question?.id).toBe('q2_primary_outcome');
    });

    it('should return null when interview is complete', () => {
      const store = useAdvisorStore.getState();
      INTERVIEW_QUESTIONS.forEach((q) => {
        store.recordResponse(
          q.id,
          q.type === 'multiselect' ? ['Developers'] : q.type === 'boolean' ? true : q.options?.[0] || 'Test'
        );
      });

      const question = useAdvisorStore.getState().getCurrentQuestion();
      expect(question).toBeNull();
    });

    it('should return question for new stage after stage transition', () => {
      const store = useAdvisorStore.getState();
      getQuestionsForStage('discovery').forEach((q) => {
        store.recordResponse(q.id, q.type === 'multiselect' ? ['Developers'] : 'Test');
      });

      const question = useAdvisorStore.getState().getCurrentQuestion();
      expect(question?.stage).toBe('requirements');
    });
  });

  describe('getProgress', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should return initial progress values', () => {
      const progress = useAdvisorStore.getState().getProgress();

      expect(progress.currentStage).toBe('discovery');
      expect(progress.stageIndex).toBe(0);
      expect(progress.questionInStage).toBe(0);
      expect(progress.totalAnswered).toBe(0);
      expect(progress.totalQuestions).toBe(INTERVIEW_QUESTIONS.length);
      expect(progress.percentage).toBe(0);
    });

    it('should update progress after answering questions', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'Test');
      store.recordResponse('q2_primary_outcome', 'Testing');

      const progress = useAdvisorStore.getState().getProgress();

      expect(progress.totalAnswered).toBe(2);
      expect(progress.percentage).toBeGreaterThan(0);
    });

    it('should update stage progress after stage transition', () => {
      const store = useAdvisorStore.getState();
      getQuestionsForStage('discovery').forEach((q) => {
        store.recordResponse(q.id, q.type === 'multiselect' ? ['Developers'] : 'Test');
      });

      const progress = useAdvisorStore.getState().getProgress();

      expect(progress.currentStage).toBe('requirements');
      expect(progress.stageIndex).toBe(1);
      expect(progress.questionInStage).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      const store = useAdvisorStore.getState();
      const totalQuestions = INTERVIEW_QUESTIONS.length;

      // Answer half the questions
      const halfQuestions = Math.floor(totalQuestions / 2);
      for (let i = 0; i < halfQuestions; i++) {
        const q = INTERVIEW_QUESTIONS[i];
        if (q) {
          store.recordResponse(
            q.id,
            q.type === 'multiselect' ? ['Developers'] : q.type === 'boolean' ? true : q.options?.[0] || 'Test'
          );
        }
      }

      const progress = useAdvisorStore.getState().getProgress();
      expect(progress.percentage).toBeCloseTo(Math.round((halfQuestions / totalQuestions) * 100));
    });

    it('should return 100% when all questions answered', () => {
      const store = useAdvisorStore.getState();
      INTERVIEW_QUESTIONS.forEach((q) => {
        store.recordResponse(
          q.id,
          q.type === 'multiselect' ? ['Developers'] : q.type === 'boolean' ? true : q.options?.[0] || 'Test'
        );
      });

      const progress = useAdvisorStore.getState().getProgress();
      expect(progress.percentage).toBe(100);
    });
  });

  describe('canGoBack', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should return false at first question', () => {
      expect(useAdvisorStore.getState().canGoBack()).toBe(false);
    });

    it('should return true after advancing one question', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'Test');

      expect(useAdvisorStore.getState().canGoBack()).toBe(true);
    });

    it('should return true at first question of second stage', () => {
      const store = useAdvisorStore.getState();
      getQuestionsForStage('discovery').forEach((q) => {
        store.recordResponse(q.id, q.type === 'multiselect' ? ['Developers'] : 'Test');
      });

      // Now at first question of requirements stage
      expect(useAdvisorStore.getState().canGoBack()).toBe(true);
    });
  });

  describe('state persistence', () => {
    it('should persist state across store access', () => {
      // Set some state
      useAdvisorStore.getState().initSession('persistent-session');
      useAdvisorStore.getState().recordResponse('q1_agent_name', 'PersistentAgent');

      // Access store again
      const state = useAdvisorStore.getState();
      expect(state.sessionId).toBe('persistent-session');
      expect(state.responses['q1_agent_name']).toBe('PersistentAgent');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      useAdvisorStore.getState().initSession();
    });

    it('should handle recording response for unknown question id', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('unknown_question', 'value');

      const state = useAdvisorStore.getState();
      expect(state.responses['unknown_question']).toBe('value');
      // Requirements should not be affected
      expect(Object.keys(state.requirements)).toHaveLength(0);
    });

    it('should handle overwriting a response', () => {
      const store = useAdvisorStore.getState();
      store.recordResponse('q1_agent_name', 'FirstName');

      // Go back and answer again
      store.goToPreviousQuestion();
      store.recordResponse('q1_agent_name', 'SecondName');

      const state = useAdvisorStore.getState();
      expect(state.responses['q1_agent_name']).toBe('SecondName');
      expect(state.requirements.name).toBe('SecondName');
    });

    it('should create default capabilities when recording capability-related question', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'architecture');

      // First capability question
      store.recordResponse('q7_memory_needs', 'short-term');

      const state = useAdvisorStore.getState();
      expect(state.requirements.capabilities).toBeDefined();
      expect(state.requirements.capabilities?.memory).toBe('short-term');
      // Other capabilities should have defaults
      expect(state.requirements.capabilities?.fileAccess).toBe(false);
      expect(state.requirements.capabilities?.webAccess).toBe(false);
    });

    it('should preserve environment fields when updating runtime', () => {
      const store = useAdvisorStore.getState();
      answerAllQuestionsUpToStage(store, 'output');

      store.recordResponse('q13_runtime_preference', 'cloud');

      const state = useAdvisorStore.getState();
      expect(state.requirements.environment?.runtime).toBe('cloud');
    });
  });
});

/**
 * Helper function to answer all questions up to but not including a specific stage
 */
function answerAllQuestionsUpToStage(
  store: ReturnType<typeof useAdvisorStore.getState>,
  targetStage: string
) {
  const stages = ['discovery', 'requirements', 'architecture', 'output'];
  const targetIndex = stages.indexOf(targetStage);

  for (let i = 0; i < targetIndex; i++) {
    const stageQuestions = getQuestionsForStage(stages[i] ?? 'discovery');
    stageQuestions.forEach((q) => {
      const value =
        q.type === 'multiselect'
          ? ['Developers']
          : q.type === 'boolean'
            ? true
            : q.type === 'choice'
              ? q.options?.[0]
              : 'Test answer';
      store.recordResponse(q.id, value);
    });
  }
}
