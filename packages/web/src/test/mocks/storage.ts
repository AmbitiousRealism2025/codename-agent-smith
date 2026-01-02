/**
 * Mock storage layer for testing
 *
 * Provides in-memory mock implementations of Dexie/IndexedDB storage
 * for isolated testing of sessions, API keys, and settings functionality.
 */

import { vi } from "vitest";
import type {
  StoredSession,
  StoredApiKey,
  StoredSettings,
} from "@/lib/storage/db";
import type {
  InterviewStage,
  AgentRequirements,
} from "@/types/interview";

/**
 * In-memory storage for mock database
 * Reset these before each test for isolation
 */
export const mockStorage = {
  sessions: new Map<string, StoredSession>(),
  apiKeys: new Map<string, StoredApiKey>(),
  settings: new Map<string, StoredSettings>(),
};

/**
 * Clears all mock storage data
 * Call this in beforeEach() to ensure test isolation
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   clearMockStorage();
 * });
 * ```
 */
export function clearMockStorage(): void {
  mockStorage.sessions.clear();
  mockStorage.apiKeys.clear();
  mockStorage.settings.clear();
}

/**
 * Sample session data for testing
 */
export const MOCK_SESSION_DATA: Omit<StoredSession, "id" | "lastUpdatedAt"> = {
  sessionId: "test-session-123",
  currentStage: "discovery" as InterviewStage,
  currentQuestionIndex: 0,
  responses: {},
  requirements: {},
  recommendations: null,
  isComplete: false,
  startedAt: new Date("2026-01-01T00:00:00Z"),
};

/**
 * Sample completed session for testing
 */
export const MOCK_COMPLETED_SESSION: Omit<StoredSession, "id" | "lastUpdatedAt"> = {
  sessionId: "completed-session-456",
  currentStage: "output" as InterviewStage,
  currentQuestionIndex: 14,
  responses: {
    q1: "automated-testing",
    q2: "medium",
    q3: "moderate",
  },
  requirements: {
    name: "Test Agent",
    description: "An agent for automated testing",
    primaryOutcome: "Automated test execution",
    targetAudience: ["developers"],
    interactionStyle: "task-focused",
    deliveryChannels: ["cli"],
    successMetrics: ["test coverage"],
    capabilities: {
      memory: "short-term",
      fileAccess: true,
      webAccess: false,
      codeExecution: true,
      dataAnalysis: false,
      toolIntegrations: [],
    },
  } as Partial<AgentRequirements>,
  recommendations: {
    agentType: "code-assistant",
    requiredDependencies: ["vitest", "playwright"],
    mcpServers: [],
    systemPrompt: "You are a helpful testing assistant.",
    toolConfigurations: [],
    estimatedComplexity: "medium",
    implementationSteps: [
      "Set up test framework",
      "Configure test runner",
      "Write initial tests",
    ],
    notes: "Best match for automated testing requirements",
  },
  isComplete: true,
  startedAt: new Date("2026-01-01T00:00:00Z"),
};

/**
 * Sample API key data for testing
 */
export const MOCK_API_KEY_DATA: Record<StoredApiKey["provider"], StoredApiKey> = {
  anthropic: {
    id: "anthropic",
    provider: "anthropic",
    encryptedKey: "encrypted-sk-ant-mock-key-1234567890",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    lastUsedAt: null,
  },
  openrouter: {
    id: "openrouter",
    provider: "openrouter",
    encryptedKey: "encrypted-sk-or-mock-key-1234567890",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    lastUsedAt: new Date("2026-01-01T12:00:00Z"),
  },
  minimax: {
    id: "minimax",
    provider: "minimax",
    encryptedKey: "encrypted-minimax-mock-key-123456",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    lastUsedAt: null,
  },
  openai: {
    id: "openai",
    provider: "openai",
    encryptedKey: "encrypted-sk-openai-mock-key-1234567890",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    lastUsedAt: null,
  },
  glm: {
    id: "glm",
    provider: "glm",
    encryptedKey: "encrypted-glm.mock-key-1234567890",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    lastUsedAt: null,
  },
};

/**
 * Sample settings data for testing
 */
export const MOCK_SETTINGS_DATA: Record<string, StoredSettings> = {
  theme: {
    id: "theme",
    key: "theme",
    value: "dark",
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  preferredProvider: {
    id: "preferredProvider",
    key: "preferredProvider",
    value: "anthropic",
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  autoSave: {
    id: "autoSave",
    key: "autoSave",
    value: true,
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
};

/**
 * Mock implementation of saveSession
 */
export const mockSaveSession = vi.fn(
  async (session: Omit<StoredSession, "id" | "lastUpdatedAt">): Promise<string> => {
    const id = session.sessionId;
    const storedSession: StoredSession = {
      ...session,
      id,
      lastUpdatedAt: new Date(),
    };
    mockStorage.sessions.set(id, storedSession);
    return id;
  }
);

/**
 * Mock implementation of getSession
 */
export const mockGetSession = vi.fn(
  async (sessionId: string): Promise<StoredSession | undefined> => {
    return mockStorage.sessions.get(sessionId);
  }
);

/**
 * Mock implementation of getLatestSession
 */
export const mockGetLatestSession = vi.fn(
  async (): Promise<StoredSession | undefined> => {
    const sessions = Array.from(mockStorage.sessions.values());
    if (sessions.length === 0) return undefined;

    return sessions.reduce((latest, current) =>
      current.lastUpdatedAt > latest.lastUpdatedAt ? current : latest
    );
  }
);

/**
 * Mock implementation of getIncompleteSessions
 */
export const mockGetIncompleteSessions = vi.fn(
  async (): Promise<StoredSession[]> => {
    return Array.from(mockStorage.sessions.values()).filter(
      (session) => !session.isComplete
    );
  }
);

/**
 * Mock implementation of deleteSession
 */
export const mockDeleteSession = vi.fn(
  async (sessionId: string): Promise<void> => {
    mockStorage.sessions.delete(sessionId);
  }
);

/**
 * Mock implementation of clearAllSessions
 */
export const mockClearAllSessions = vi.fn(async (): Promise<void> => {
  mockStorage.sessions.clear();
});

/**
 * Mock implementation of saveApiKey
 */
export const mockSaveApiKey = vi.fn(
  async (
    provider: StoredApiKey["provider"],
    encryptedKey: string
  ): Promise<string> => {
    const id = provider;
    const storedKey: StoredApiKey = {
      id,
      provider,
      encryptedKey,
      createdAt: new Date(),
      lastUsedAt: null,
    };
    mockStorage.apiKeys.set(id, storedKey);
    return id;
  }
);

/**
 * Mock implementation of getApiKey
 */
export const mockGetApiKey = vi.fn(
  async (
    provider: StoredApiKey["provider"]
  ): Promise<StoredApiKey | undefined> => {
    return mockStorage.apiKeys.get(provider);
  }
);

/**
 * Mock implementation of deleteApiKey
 */
export const mockDeleteApiKey = vi.fn(
  async (provider: StoredApiKey["provider"]): Promise<void> => {
    mockStorage.apiKeys.delete(provider);
  }
);

/**
 * Mock implementation of updateApiKeyLastUsed
 */
export const mockUpdateApiKeyLastUsed = vi.fn(
  async (provider: StoredApiKey["provider"]): Promise<void> => {
    const key = mockStorage.apiKeys.get(provider);
    if (key) {
      mockStorage.apiKeys.set(provider, {
        ...key,
        lastUsedAt: new Date(),
      });
    }
  }
);

/**
 * Mock implementation of saveSetting
 */
export const mockSaveSetting = vi.fn(
  async <T>(key: string, value: T): Promise<void> => {
    mockStorage.settings.set(key, {
      id: key,
      key,
      value,
      updatedAt: new Date(),
    });
  }
);

/**
 * Mock implementation of getSetting
 */
export const mockGetSetting = vi.fn(
  async <T>(key: string): Promise<T | undefined> => {
    const setting = mockStorage.settings.get(key);
    return setting?.value as T | undefined;
  }
);

/**
 * Mock implementation of deleteSetting
 */
export const mockDeleteSetting = vi.fn(async (key: string): Promise<void> => {
  mockStorage.settings.delete(key);
});

/**
 * All mock storage functions bundled together
 * Use with vi.mock() to replace the real storage module
 *
 * @example
 * ```ts
 * vi.mock('@/lib/storage/db', () => mockStorageFunctions);
 * ```
 */
export const mockStorageFunctions = {
  saveSession: mockSaveSession,
  getSession: mockGetSession,
  getLatestSession: mockGetLatestSession,
  getIncompleteSessions: mockGetIncompleteSessions,
  deleteSession: mockDeleteSession,
  clearAllSessions: mockClearAllSessions,
  saveApiKey: mockSaveApiKey,
  getApiKey: mockGetApiKey,
  deleteApiKey: mockDeleteApiKey,
  updateApiKeyLastUsed: mockUpdateApiKeyLastUsed,
  saveSetting: mockSaveSetting,
  getSetting: mockGetSetting,
  deleteSetting: mockDeleteSetting,
  // Mock the db object for direct table access if needed
  db: {
    sessions: {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      toArray: vi.fn(),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          first: vi.fn(),
        })),
      })),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
    apiKeys: {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    settings: {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  },
};

/**
 * Resets all mock function call history
 * Call this in beforeEach() along with clearMockStorage()
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   clearMockStorage();
 *   resetMockStorageFunctions();
 * });
 * ```
 */
export function resetMockStorageFunctions(): void {
  mockSaveSession.mockClear();
  mockGetSession.mockClear();
  mockGetLatestSession.mockClear();
  mockGetIncompleteSessions.mockClear();
  mockDeleteSession.mockClear();
  mockClearAllSessions.mockClear();
  mockSaveApiKey.mockClear();
  mockGetApiKey.mockClear();
  mockDeleteApiKey.mockClear();
  mockUpdateApiKeyLastUsed.mockClear();
  mockSaveSetting.mockClear();
  mockGetSetting.mockClear();
  mockDeleteSetting.mockClear();
}

/**
 * Seeds mock storage with sample data for testing
 *
 * @param options - What data to seed
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   clearMockStorage();
 *   seedMockStorage({ sessions: true, apiKeys: true });
 * });
 * ```
 */
export function seedMockStorage(options: {
  sessions?: boolean;
  apiKeys?: boolean;
  settings?: boolean;
} = {}): void {
  if (options.sessions) {
    const session: StoredSession = {
      ...MOCK_SESSION_DATA,
      id: MOCK_SESSION_DATA.sessionId,
      lastUpdatedAt: new Date(),
    };
    mockStorage.sessions.set(session.id, session);

    const completedSession: StoredSession = {
      ...MOCK_COMPLETED_SESSION,
      id: MOCK_COMPLETED_SESSION.sessionId,
      lastUpdatedAt: new Date(),
    };
    mockStorage.sessions.set(completedSession.id, completedSession);
  }

  if (options.apiKeys) {
    Object.values(MOCK_API_KEY_DATA).forEach((key) => {
      mockStorage.apiKeys.set(key.id, key);
    });
  }

  if (options.settings) {
    Object.values(MOCK_SETTINGS_DATA).forEach((setting) => {
      mockStorage.settings.set(setting.id, setting);
    });
  }
}

/**
 * Creates a custom mock session with partial overrides
 *
 * @param overrides - Partial session data to override defaults
 * @returns A complete StoredSession object
 *
 * @example
 * ```ts
 * const session = createMockSession({
 *   sessionId: 'custom-session',
 *   isComplete: true,
 * });
 * ```
 */
export function createMockSession(
  overrides: Partial<Omit<StoredSession, "id">> = {}
): StoredSession {
  const sessionId = overrides.sessionId ?? `mock-session-${Date.now()}`;
  return {
    id: sessionId,
    sessionId,
    currentStage: "discovery" as InterviewStage,
    currentQuestionIndex: 0,
    responses: {},
    requirements: {},
    recommendations: null,
    isComplete: false,
    startedAt: new Date(),
    lastUpdatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a custom mock API key with partial overrides
 *
 * @param provider - The provider type
 * @param overrides - Partial API key data to override defaults
 * @returns A complete StoredApiKey object
 *
 * @example
 * ```ts
 * const key = createMockApiKey('anthropic', {
 *   encryptedKey: 'custom-encrypted-key',
 * });
 * ```
 */
export function createMockApiKey(
  provider: StoredApiKey["provider"],
  overrides: Partial<Omit<StoredApiKey, "id" | "provider">> = {}
): StoredApiKey {
  return {
    id: provider,
    provider,
    encryptedKey: `encrypted-mock-key-${provider}`,
    createdAt: new Date(),
    lastUsedAt: null,
    ...overrides,
  };
}

/**
 * Creates a custom mock setting with partial overrides
 *
 * @param key - The setting key
 * @param value - The setting value
 * @returns A complete StoredSettings object
 *
 * @example
 * ```ts
 * const setting = createMockSetting('customSetting', { enabled: true });
 * ```
 */
export function createMockSetting<T>(key: string, value: T): StoredSettings {
  return {
    id: key,
    key,
    value,
    updatedAt: new Date(),
  };
}
