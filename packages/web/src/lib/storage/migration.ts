import { db, type StoredSession } from './db';
import type { StorageAdapter, SessionData } from './types';

export interface MigrationProgress {
  total: number;
  completed: number;
  current: string | null;
  status: 'idle' | 'detecting' | 'migrating' | 'verifying' | 'complete' | 'error';
  error: string | null;
}

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface LocalDataInfo {
  sessionCount: number;
  hasApiKeys: boolean;
  oldestSession: Date | null;
  newestSession: Date | null;
}

export async function detectLocalData(): Promise<LocalDataInfo> {
  const sessions = await db.sessions.toArray();
  const apiKeys = await db.apiKeys.toArray();

  let oldestSession: Date | null = null;
  let newestSession: Date | null = null;

  for (const session of sessions) {
    if (session.startedAt) {
      if (!oldestSession || session.startedAt < oldestSession) {
        oldestSession = session.startedAt;
      }
      if (!newestSession || session.startedAt > newestSession) {
        newestSession = session.startedAt;
      }
    }
  }

  return {
    sessionCount: sessions.length,
    hasApiKeys: apiKeys.length > 0,
    oldestSession,
    newestSession,
  };
}

export async function migrateToCloud(
  cloudAdapter: StorageAdapter,
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  const reportProgress = (update: Partial<MigrationProgress>) => {
    if (onProgress) {
      onProgress({
        total: 0,
        completed: 0,
        current: null,
        status: 'idle',
        error: null,
        ...update,
      });
    }
  };

  try {
    reportProgress({ status: 'detecting' });

    const localSessions = await db.sessions.toArray();
    const total = localSessions.length;

    if (total === 0) {
      reportProgress({ status: 'complete', total: 0, completed: 0 });
      result.success = true;
      return result;
    }

    reportProgress({ status: 'migrating', total, completed: 0 });

    for (let i = 0; i < localSessions.length; i++) {
      const localSession = localSessions[i];
      if (!localSession) continue;
      const sessionId = localSession.sessionId;

      reportProgress({
        status: 'migrating',
        total,
        completed: i,
        current: sessionId,
      });

      try {
        const existingCloud = await cloudAdapter.getSession(sessionId);
        if (existingCloud) {
          result.skippedCount++;
          continue;
        }

        const sessionData = storedSessionToSessionData(localSession);
        await cloudAdapter.saveSession(sessionData);
        result.migratedCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Session ${sessionId}: ${errorMsg}`);
      }
    }

    reportProgress({ status: 'verifying', total, completed: total });
    const verifyResult = await verifyMigration(cloudAdapter, localSessions);

    if (!verifyResult.success) {
      result.errors.push(...verifyResult.missingIds.map((id) => `Missing after migration: ${id}`));
    }

    result.success = result.errors.length === 0;
    reportProgress({
      status: result.success ? 'complete' : 'error',
      total,
      completed: total,
      error: result.errors.length > 0 ? result.errors[0] : null,
    });

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Migration failed';
    result.errors.push(errorMsg);
    reportProgress({ status: 'error', error: errorMsg });
    return result;
  }
}

async function verifyMigration(
  cloudAdapter: StorageAdapter,
  localSessions: StoredSession[]
): Promise<{ success: boolean; missingIds: string[] }> {
  const missingIds: string[] = [];

  for (const local of localSessions) {
    try {
      const cloudSession = await cloudAdapter.getSession(local.sessionId);
      if (!cloudSession) {
        missingIds.push(local.sessionId);
      }
    } catch {
      missingIds.push(local.sessionId);
    }
  }

  return {
    success: missingIds.length === 0,
    missingIds,
  };
}

function storedSessionToSessionData(stored: StoredSession): SessionData {
  return {
    sessionId: stored.sessionId,
    currentStage: stored.currentStage,
    currentQuestionIndex: stored.currentQuestionIndex,
    responses: stored.responses,
    requirements: stored.requirements,
    recommendations: stored.recommendations,
    isComplete: stored.isComplete,
    startedAt: stored.startedAt,
    lastUpdatedAt: stored.lastUpdatedAt,
  };
}

export async function clearLocalSessionsAfterMigration(): Promise<void> {
  await db.sessions.clear();
}

export async function getLocalSessionBackup(): Promise<StoredSession[]> {
  return db.sessions.toArray();
}

export async function restoreLocalSessions(sessions: StoredSession[]): Promise<void> {
  await db.sessions.bulkPut(sessions);
}
