import type { Page } from "@playwright/test";
import type {
  InterviewStage,
  ResponseValue,
  AgentRequirements,
  AgentRecommendations,
} from "../../src/types/interview";

/**
 * Storage key used by Zustand persist middleware for advisor store
 */
export const ADVISOR_STORAGE_KEY = "advisor-session";

/**
 * Persisted state structure that matches the advisor store's partialize config
 *
 * This matches the structure saved by Zustand's persist middleware in advisor-store.ts
 */
export interface PersistedAdvisorState {
  sessionId: string | null;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  responses: Record<string, ResponseValue>;
  requirements: Partial<AgentRequirements>;
  recommendations: AgentRecommendations | null;
  isComplete: boolean;
  startedAt: string | null;
}

/**
 * Full Zustand persist storage structure
 */
interface ZustandPersistStorage {
  state: PersistedAdvisorState;
  version?: number;
}

/**
 * Default empty session state
 */
export function createEmptySession(): PersistedAdvisorState {
  return {
    sessionId: null,
    currentStage: "discovery",
    currentQuestionIndex: 0,
    responses: {},
    requirements: {},
    recommendations: null,
    isComplete: false,
    startedAt: null,
  };
}

/**
 * Create a new session with a fresh session ID
 */
export function createNewSession(
  overrides?: Partial<PersistedAdvisorState>
): PersistedAdvisorState {
  return {
    sessionId: crypto.randomUUID(),
    currentStage: "discovery",
    currentQuestionIndex: 0,
    responses: {},
    requirements: {},
    recommendations: null,
    isComplete: false,
    startedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a session at the discovery stage with some responses
 */
export function createDiscoverySession(
  responses: Partial<{
    q1_agent_name: string;
    q2_primary_outcome: string;
    q3_target_audience: string[];
  }> = {}
): PersistedAdvisorState {
  const allResponses: Record<string, ResponseValue> = {};
  const requirements: Partial<AgentRequirements> = {};

  if (responses.q1_agent_name) {
    allResponses["q1_agent_name"] = responses.q1_agent_name;
    requirements.name = responses.q1_agent_name;
    requirements.description = `${responses.q1_agent_name} agent`;
  }

  if (responses.q2_primary_outcome) {
    allResponses["q2_primary_outcome"] = responses.q2_primary_outcome;
    requirements.primaryOutcome = responses.q2_primary_outcome;
  }

  if (responses.q3_target_audience) {
    allResponses["q3_target_audience"] = responses.q3_target_audience;
    requirements.targetAudience = responses.q3_target_audience;
  }

  return createNewSession({
    currentStage: "discovery",
    currentQuestionIndex: Object.keys(allResponses).length,
    responses: allResponses,
    requirements,
  });
}

/**
 * Create a session midway through the interview (at requirements stage)
 */
export function createMidwaySession(): PersistedAdvisorState {
  return createNewSession({
    currentStage: "requirements",
    currentQuestionIndex: 0,
    responses: {
      q1_agent_name: "Test Agent",
      q2_primary_outcome: "Automate testing workflows",
      q3_target_audience: ["Developers", "Data Scientists"],
    },
    requirements: {
      name: "Test Agent",
      description: "Test Agent agent",
      primaryOutcome: "Automate testing workflows",
      targetAudience: ["Developers", "Data Scientists"],
    },
  });
}

/**
 * Create a fully completed interview session ready for results
 */
export function createCompletedSession(): PersistedAdvisorState {
  return createNewSession({
    currentStage: "complete",
    currentQuestionIndex: 0,
    isComplete: true,
    responses: {
      q1_agent_name: "Code Assistant",
      q2_primary_outcome: "Help developers write better code",
      q3_target_audience: ["Developers", "Product Managers"],
      q4_interaction_style: "collaborative",
      q5_delivery_channels: ["IDE Extension", "CLI"],
      q6_success_metrics: ["Task completion rate", "User satisfaction scores"],
      q7_memory_needs: "short-term",
      q8_file_access: true,
      q9_web_access: true,
      q10_code_execution: true,
      q11_data_analysis: false,
      q12_tool_integrations: "GitHub, Jira",
      q13_runtime_preference: "local",
      q14_constraints: "Must work offline",
      q15_additional_notes: "Focus on TypeScript and React projects",
    },
    requirements: {
      name: "Code Assistant",
      description: "Code Assistant agent",
      primaryOutcome: "Help developers write better code",
      targetAudience: ["Developers", "Product Managers"],
      interactionStyle: "collaborative",
      deliveryChannels: ["IDE Extension", "CLI"],
      successMetrics: ["Task completion rate", "User satisfaction scores"],
      capabilities: {
        memory: "short-term",
        fileAccess: true,
        webAccess: true,
        codeExecution: true,
        dataAnalysis: false,
        toolIntegrations: ["GitHub", "Jira"],
      },
      environment: {
        runtime: "local",
      },
      constraints: ["Must work offline"],
      additionalNotes: "Focus on TypeScript and React projects",
    },
  });
}

/**
 * Create a completed session with recommendations
 */
export function createSessionWithRecommendations(): PersistedAdvisorState {
  const completed = createCompletedSession();
  return {
    ...completed,
    recommendations: {
      agentType: "code-assistant",
      requiredDependencies: ["@anthropic-ai/sdk", "@modelcontextprotocol/sdk"],
      mcpServers: [
        {
          name: "filesystem",
          description: "Access to local files",
          url: "file://",
        },
      ],
      systemPrompt: "You are a helpful coding assistant...",
      toolConfigurations: [
        {
          name: "read_file",
          description: "Read file contents",
          parameters: {},
          requiredPermissions: ["fs:read"],
        },
      ],
      estimatedComplexity: "medium",
      implementationSteps: [
        "Install dependencies",
        "Configure MCP servers",
        "Set up system prompt",
      ],
    },
  };
}

/**
 * Inject session state into localStorage via Playwright page
 *
 * @param page - Playwright page instance
 * @param state - The session state to inject
 */
export async function injectSessionState(
  page: Page,
  state: PersistedAdvisorState
): Promise<void> {
  const storage: ZustandPersistStorage = {
    state,
    version: 0,
  };

  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: ADVISOR_STORAGE_KEY, value: storage }
  );
}

/**
 * Clear session state from localStorage
 *
 * @param page - Playwright page instance
 */
export async function clearSessionState(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, ADVISOR_STORAGE_KEY);
}

/**
 * Get current session state from localStorage
 *
 * @param page - Playwright page instance
 * @returns The current session state or null if not found
 */
export async function getSessionState(
  page: Page
): Promise<PersistedAdvisorState | null> {
  const result = await page.evaluate((key) => {
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return parsed.state ?? null;
    } catch {
      return null;
    }
  }, ADVISOR_STORAGE_KEY);

  return result;
}

/**
 * Wait for session state to be saved to localStorage
 *
 * @param page - Playwright page instance
 * @param predicate - Optional predicate to check specific state conditions
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForSessionState(
  page: Page,
  predicate?: (state: PersistedAdvisorState) => boolean,
  timeout = 5000
): Promise<PersistedAdvisorState> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const state = await getSessionState(page);

    if (state) {
      if (!predicate || predicate(state)) {
        return state;
      }
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`Timeout waiting for session state after ${timeout}ms`);
}

/**
 * Storage utilities for setting up test fixtures
 *
 * Provides a collection of pre-configured session states for common test scenarios
 */
export const StorageFixtures = {
  /** Empty/cleared session */
  empty: createEmptySession,
  /** Fresh session with new ID */
  new: createNewSession,
  /** Session in discovery stage with partial responses */
  discovery: createDiscoverySession,
  /** Session midway through interview (at requirements stage) */
  midway: createMidwaySession,
  /** Fully completed interview session */
  completed: createCompletedSession,
  /** Completed session with generated recommendations */
  withRecommendations: createSessionWithRecommendations,
};
