import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InterviewStage,
  ResponseValue,
  AgentRequirements,
  AgentRecommendations,
  AgentCapabilities,
} from '@/types/interview';
import { INTERVIEW_QUESTIONS } from '@/lib/interview/questions';

const STAGES: InterviewStage[] = ['discovery', 'requirements', 'architecture', 'output', 'complete'];

function getDefaultCapabilities(): AgentCapabilities {
  return {
    memory: 'none',
    fileAccess: false,
    webAccess: false,
    codeExecution: false,
    dataAnalysis: false,
    toolIntegrations: [],
  };
}

function getQuestionsForStage(stage: InterviewStage) {
  return INTERVIEW_QUESTIONS.filter((q) => q.stage === stage);
}

interface AdvisorStore {
  sessionId: string | null;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  responses: Record<string, ResponseValue>;
  requirements: Partial<AgentRequirements>;
  recommendations: AgentRecommendations | null;
  isComplete: boolean;
  isGenerating: boolean;
  startedAt: Date | null;

  initSession: (sessionId?: string) => void;
  recordResponse: (questionId: string, value: ResponseValue) => void;
  skipQuestion: () => void;
  goToPreviousQuestion: () => void;
  setRecommendations: (recs: AgentRecommendations) => void;
  resetInterview: () => void;
  setGenerating: (generating: boolean) => void;

  getCurrentQuestion: () => (typeof INTERVIEW_QUESTIONS)[number] | null;
  getProgress: () => {
    currentStage: InterviewStage;
    stageIndex: number;
    questionInStage: number;
    questionsInCurrentStage: number;
    totalAnswered: number;
    totalQuestions: number;
    percentage: number;
  };
  canGoBack: () => boolean;
}

export const useAdvisorStore = create<AdvisorStore>()(
  persist(
    (set, get) => ({
      sessionId: null,
      currentStage: 'discovery',
      currentQuestionIndex: 0,
      responses: {},
      requirements: {},
      recommendations: null,
      isComplete: false,
      isGenerating: false,
      startedAt: null,

      initSession: (sessionId) => {
        set({
          sessionId: sessionId ?? crypto.randomUUID(),
          currentStage: 'discovery',
          currentQuestionIndex: 0,
          responses: {},
          requirements: {},
          recommendations: null,
          isComplete: false,
          startedAt: new Date(),
        });
      },

      recordResponse: (questionId, value) => {
        const state = get();
        const newResponses = { ...state.responses, [questionId]: value };
        const newRequirements = updateRequirementsFromResponse(
          { ...state.requirements },
          questionId,
          value
        );

        const stageQuestions = getQuestionsForStage(state.currentStage);
        const nextIndex = state.currentQuestionIndex + 1;

        if (nextIndex >= stageQuestions.length) {
          const currentStageIndex = STAGES.indexOf(state.currentStage);
          const nextStage = STAGES[currentStageIndex + 1];

          if (!nextStage || nextStage === 'complete') {
            set({
              responses: newResponses,
              requirements: newRequirements,
              currentStage: 'complete',
              currentQuestionIndex: 0,
              isComplete: true,
            });
          } else {
            set({
              responses: newResponses,
              requirements: newRequirements,
              currentStage: nextStage,
              currentQuestionIndex: 0,
            });
          }
        } else {
          set({
            responses: newResponses,
            requirements: newRequirements,
            currentQuestionIndex: nextIndex,
          });
        }
      },

      skipQuestion: () => {
        const state = get();
        const stageQuestions = getQuestionsForStage(state.currentStage);
        const nextIndex = state.currentQuestionIndex + 1;

        if (nextIndex >= stageQuestions.length) {
          const currentStageIndex = STAGES.indexOf(state.currentStage);
          const nextStage = STAGES[currentStageIndex + 1];

          if (!nextStage || nextStage === 'complete') {
            set({
              currentStage: 'complete',
              currentQuestionIndex: 0,
              isComplete: true,
            });
          } else {
            set({
              currentStage: nextStage,
              currentQuestionIndex: 0,
            });
          }
        } else {
          set({ currentQuestionIndex: nextIndex });
        }
      },

      goToPreviousQuestion: () => {
        const state = get();

        if (state.currentQuestionIndex > 0) {
          set({ currentQuestionIndex: state.currentQuestionIndex - 1 });
          return;
        }

        const currentStageIndex = STAGES.indexOf(state.currentStage);
        if (currentStageIndex > 0) {
          const prevStage = STAGES[currentStageIndex - 1] as InterviewStage;
          const prevStageQuestions = getQuestionsForStage(prevStage);
          set({
            currentStage: prevStage,
            currentQuestionIndex: Math.max(0, prevStageQuestions.length - 1),
            isComplete: false,
          });
        }
      },

      setRecommendations: (recs) => {
        set({ recommendations: recs, isComplete: true });
      },

      resetInterview: () => {
        set({
          sessionId: null,
          currentStage: 'discovery',
          currentQuestionIndex: 0,
          responses: {},
          requirements: {},
          recommendations: null,
          isComplete: false,
          isGenerating: false,
          startedAt: null,
        });
      },

      setGenerating: (generating) => set({ isGenerating: generating }),

      getCurrentQuestion: () => {
        const state = get();
        if (state.isComplete) return null;

        const stageQuestions = getQuestionsForStage(state.currentStage);
        return stageQuestions[state.currentQuestionIndex] ?? null;
      },

      getProgress: () => {
        const state = get();
        const stageIndex = STAGES.indexOf(state.currentStage);
        const stageQuestions = getQuestionsForStage(state.currentStage);
        const totalAnswered = Object.keys(state.responses).length;

        return {
          currentStage: state.currentStage,
          stageIndex,
          questionInStage: state.currentQuestionIndex,
          questionsInCurrentStage: stageQuestions.length,
          totalAnswered,
          totalQuestions: INTERVIEW_QUESTIONS.length,
          percentage:
            INTERVIEW_QUESTIONS.length > 0
              ? Math.round((totalAnswered / INTERVIEW_QUESTIONS.length) * 100)
              : 0,
        };
      },

      canGoBack: () => {
        const state = get();
        return state.currentQuestionIndex > 0 || STAGES.indexOf(state.currentStage) > 0;
      },
    }),
    {
      name: 'advisor-session',
      partialize: (state) => ({
        sessionId: state.sessionId,
        currentStage: state.currentStage,
        currentQuestionIndex: state.currentQuestionIndex,
        responses: state.responses,
        requirements: state.requirements,
        recommendations: state.recommendations,
        isComplete: state.isComplete,
        startedAt: state.startedAt,
      }),
    }
  )
);

function updateRequirementsFromResponse(
  requirements: Partial<AgentRequirements>,
  questionId: string,
  value: ResponseValue
): Partial<AgentRequirements> {
  const updated = { ...requirements };

  switch (questionId) {
    case 'q1_agent_name':
      updated.name = value as string;
      if (!updated.description) {
        updated.description = `${value} agent`;
      }
      break;

    case 'q2_primary_outcome':
      updated.primaryOutcome = value as string;
      if (!updated.description) {
        updated.description = `Agent for: ${value}`;
      }
      break;

    case 'q3_target_audience':
      updated.targetAudience = value as string[];
      break;

    case 'q4_interaction_style':
      updated.interactionStyle = value as 'conversational' | 'task-focused' | 'collaborative';
      break;

    case 'q5_delivery_channels':
      updated.deliveryChannels = value as string[];
      break;

    case 'q6_success_metrics':
      updated.successMetrics = value as string[];
      break;

    case 'q7_memory_needs':
      if (!updated.capabilities) {
        updated.capabilities = getDefaultCapabilities();
      }
      updated.capabilities.memory = value as 'none' | 'short-term' | 'long-term';
      break;

    case 'q8_file_access':
      if (!updated.capabilities) {
        updated.capabilities = getDefaultCapabilities();
      }
      updated.capabilities.fileAccess = value as boolean;
      break;

    case 'q9_web_access':
      if (!updated.capabilities) {
        updated.capabilities = getDefaultCapabilities();
      }
      updated.capabilities.webAccess = value as boolean;
      break;

    case 'q10_code_execution':
      if (!updated.capabilities) {
        updated.capabilities = getDefaultCapabilities();
      }
      updated.capabilities.codeExecution = value as boolean;
      break;

    case 'q11_data_analysis':
      if (!updated.capabilities) {
        updated.capabilities = getDefaultCapabilities();
      }
      updated.capabilities.dataAnalysis = value as boolean;
      break;

    case 'q12_tool_integrations': {
      if (!updated.capabilities) {
        updated.capabilities = getDefaultCapabilities();
      }
      const integrations =
        typeof value === 'string'
          ? value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      updated.capabilities.toolIntegrations = integrations;
      break;
    }

    case 'q13_runtime_preference':
      updated.environment = {
        ...updated.environment,
        runtime: value as 'cloud' | 'local' | 'hybrid',
      };
      break;

    case 'q14_constraints':
      if (value && typeof value === 'string' && value.trim()) {
        updated.constraints = value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      break;

    case 'q15_additional_notes':
      if (value && typeof value === 'string' && value.trim()) {
        updated.additionalNotes = value as string;
      }
      break;
  }

  return updated;
}
