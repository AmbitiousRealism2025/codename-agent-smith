import { create } from 'zustand';
import type {
  InterviewStage,
  ResponseValue,
  AgentRequirements,
  AgentRecommendations,
  AgentCapabilities,
} from '@/types/interview';
import { INTERVIEW_QUESTIONS } from '@/lib/interview/questions';
import { getAdapter } from '@/lib/storage';
import type { SessionData } from '@/lib/storage/types';
import { useSyncStore } from './sync-store';

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

interface AdvisorState {
  sessionId: string | null;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  responses: Record<string, ResponseValue>;
  requirements: Partial<AgentRequirements>;
  recommendations: AgentRecommendations | null;
  isComplete: boolean;
  isGenerating: boolean;
  startedAt: Date | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSyncedAt: Date | null;
}

interface AdvisorActions {
  initSession: (sessionId?: string) => Promise<void>;
  loadSession: (sessionId?: string) => Promise<boolean>;
  recordResponse: (questionId: string, value: ResponseValue) => void;
  skipQuestion: () => void;
  goToPreviousQuestion: () => void;
  navigateToQuestion: (questionId: string) => void;
  setRecommendations: (recs: AgentRecommendations) => void;
  resetInterview: () => void;
  setGenerating: (generating: boolean) => void;
  getCurrentQuestion: () => (typeof INTERVIEW_QUESTIONS)[number] | null;
  getAnsweredQuestions: () => (typeof INTERVIEW_QUESTIONS)[number][];
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
  _persistToStorage: () => Promise<void>;
}

type AdvisorStore = AdvisorState & AdvisorActions;

const initialState: AdvisorState = {
  sessionId: null,
  currentStage: 'discovery',
  currentQuestionIndex: 0,
  responses: {},
  requirements: {},
  recommendations: null,
  isComplete: false,
  isGenerating: false,
  startedAt: null,
  isLoading: false,
  isSaving: false,
  lastSyncedAt: null,
};

function stateToSessionData(state: AdvisorState): SessionData | null {
  if (!state.sessionId) return null;
  return {
    sessionId: state.sessionId,
    currentStage: state.currentStage,
    currentQuestionIndex: state.currentQuestionIndex,
    responses: state.responses,
    requirements: state.requirements,
    recommendations: state.recommendations,
    isComplete: state.isComplete,
    startedAt: state.startedAt,
    lastUpdatedAt: new Date(),
  };
}

function sessionDataToState(session: SessionData): Partial<AdvisorState> {
  return {
    sessionId: session.sessionId,
    currentStage: session.currentStage,
    currentQuestionIndex: session.currentQuestionIndex,
    responses: session.responses,
    requirements: session.requirements,
    recommendations: session.recommendations,
    isComplete: session.isComplete,
    startedAt: session.startedAt,
    lastSyncedAt: session.lastUpdatedAt,
  };
}

export const useAdvisorStore = create<AdvisorStore>()((set, get) => ({
  ...initialState,

  initSession: async (sessionId) => {
    const newSessionId = sessionId ?? crypto.randomUUID();
    const newState: Partial<AdvisorState> = {
      sessionId: newSessionId,
      currentStage: 'discovery',
      currentQuestionIndex: 0,
      responses: {},
      requirements: {},
      recommendations: null,
      isComplete: false,
      startedAt: new Date(),
      isLoading: false,
      isSaving: false,
    };
    set(newState);
    await get()._persistToStorage();
  },

  loadSession: async (sessionId) => {
    set({ isLoading: true });
    const syncStore = useSyncStore.getState();
    syncStore.setSyncing();

    try {
      const adapter = getAdapter();
      const session = sessionId
        ? await adapter.getSession(sessionId)
        : await adapter.getLatestSession();

      if (session) {
        set({
          ...sessionDataToState(session),
          isLoading: false,
        });
        syncStore.setSynced();
        return true;
      }
      set({ isLoading: false });
      syncStore.setSynced();
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session';
      syncStore.setError(errorMessage);
      set({ isLoading: false });
      return false;
    }
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

    get()._persistToStorage().catch(console.error);
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

    get()._persistToStorage().catch(console.error);
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

  navigateToQuestion: (questionId) => {
    const question = INTERVIEW_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    const stageQuestions = getQuestionsForStage(question.stage);
    const questionIndex = stageQuestions.findIndex((q) => q.id === questionId);

    if (questionIndex !== -1) {
      set({
        currentStage: question.stage,
        currentQuestionIndex: questionIndex,
        isComplete: false,
      });
      get()._persistToStorage().catch(console.error);
    }
  },

  setRecommendations: (recs) => {
    set({ recommendations: recs, isComplete: true });
    get()._persistToStorage().catch(console.error);
  },

  resetInterview: () => {
    set(initialState);
  },

  setGenerating: (generating) => set({ isGenerating: generating }),

  getCurrentQuestion: () => {
    const state = get();
    if (state.isComplete) return null;

    const stageQuestions = getQuestionsForStage(state.currentStage);
    return stageQuestions[state.currentQuestionIndex] ?? null;
  },

  getAnsweredQuestions: () => {
    const state = get();
    return INTERVIEW_QUESTIONS.filter((q) => q.id in state.responses);
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

  _persistToStorage: async () => {
    const state = get();
    const sessionData = stateToSessionData(state);
    if (!sessionData) return;

    set({ isSaving: true });
    const syncStore = useSyncStore.getState();
    syncStore.setSyncing();

    try {
      const adapter = getAdapter();
      await adapter.saveSession(sessionData);
      set({ isSaving: false, lastSyncedAt: new Date() });
      syncStore.setSynced();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save session';
      syncStore.setError(errorMessage);
      set({ isSaving: false });
      throw error;
    }
  },
}));

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
