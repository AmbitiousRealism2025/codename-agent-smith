import type { SessionData } from './types';

export interface ConflictResult {
  resolved: SessionData;
  hadConflict: boolean;
  winner: 'local' | 'remote';
}

export function resolveConflict(local: SessionData, remote: SessionData): ConflictResult {
  const localTimestamp = local.lastUpdatedAt?.getTime() ?? 0;
  const remoteTimestamp = remote.lastUpdatedAt?.getTime() ?? 0;

  if (localTimestamp === remoteTimestamp) {
    return {
      resolved: local,
      hadConflict: false,
      winner: 'local',
    };
  }

  if (localTimestamp > remoteTimestamp) {
    return {
      resolved: local,
      hadConflict: true,
      winner: 'local',
    };
  }

  return {
    resolved: remote,
    hadConflict: true,
    winner: 'remote',
  };
}

export function mergeResponses(
  localResponses: Record<string, unknown>,
  remoteResponses: Record<string, unknown>,
  localTimestamp: number,
  remoteTimestamp: number
): Record<string, unknown> {
  if (localTimestamp > remoteTimestamp) {
    return { ...remoteResponses, ...localResponses };
  }
  return { ...localResponses, ...remoteResponses };
}

export function shouldOverwriteLocal(local: SessionData | null, remote: SessionData): boolean {
  if (!local) return true;

  const localTimestamp = local.lastUpdatedAt?.getTime() ?? 0;
  const remoteTimestamp = remote.lastUpdatedAt?.getTime() ?? 0;

  return remoteTimestamp > localTimestamp;
}

export function shouldPushToRemote(local: SessionData, remote: SessionData | null): boolean {
  if (!remote) return true;

  const localTimestamp = local.lastUpdatedAt?.getTime() ?? 0;
  const remoteTimestamp = remote.lastUpdatedAt?.getTime() ?? 0;

  return localTimestamp > remoteTimestamp;
}
