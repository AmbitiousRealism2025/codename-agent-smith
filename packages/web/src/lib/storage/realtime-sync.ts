import { useEffect, useCallback, useRef } from 'react';
import { useSyncStore } from '@/stores/sync-store';
import { useAdvisorStore } from '@/stores/advisor-store';
import { getAdapterType } from './adapter-factory';
import type { SessionData } from './types';

interface PendingChange {
  sessionId: string;
  timestamp: number;
  data: Partial<SessionData>;
}

const BATCH_DELAY_MS = 500;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export function useRealtimeSync() {
  const syncStore = useSyncStore();
  const advisorStore = useAdvisorStore();
  const pendingChanges = useRef<PendingChange[]>([]);
  const batchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);

  const isOnline = useCallback(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }, []);

  const flushPendingChanges = useCallback(async () => {
    if (pendingChanges.current.length === 0) return;
    if (getAdapterType() !== 'convex') return;

    const changes = [...pendingChanges.current];
    pendingChanges.current = [];

    syncStore.setSyncing();

    try {
      for (let i = 0; i < changes.length; i++) {
        await advisorStore._persistToStorage();
      }
      syncStore.setSynced();
      retryCount.current = 0;
    } catch (error) {
      pendingChanges.current = [...changes, ...pendingChanges.current];

      if (retryCount.current < MAX_RETRY_ATTEMPTS) {
        retryCount.current++;
        setTimeout(flushPendingChanges, RETRY_DELAY_MS * retryCount.current);
      } else {
        const errorMsg = error instanceof Error ? error.message : 'Sync failed';
        syncStore.setError(errorMsg);
        retryCount.current = 0;
      }
    }
  }, [advisorStore, syncStore]);

  const queueChange = useCallback(
    (sessionId: string, data: Partial<SessionData>) => {
      if (!isOnline()) {
        syncStore.setOffline();
        pendingChanges.current.push({
          sessionId,
          timestamp: Date.now(),
          data,
        });
        return;
      }

      pendingChanges.current.push({
        sessionId,
        timestamp: Date.now(),
        data,
      });

      syncStore.incrementPending();

      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }

      batchTimeout.current = setTimeout(() => {
        flushPendingChanges();
        batchTimeout.current = null;
      }, BATCH_DELAY_MS);
    },
    [isOnline, syncStore, flushPendingChanges]
  );

  useEffect(() => {
    const handleOnline = () => {
      if (pendingChanges.current.length > 0) {
        flushPendingChanges();
      } else {
        syncStore.setSynced();
      }
    };

    const handleOffline = () => {
      syncStore.setOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!isOnline()) {
      syncStore.setOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  }, [isOnline, syncStore, flushPendingChanges]);

  return {
    queueChange,
    flushPendingChanges,
    pendingCount: pendingChanges.current.length,
  };
}

export function useConnectionStatus() {
  const syncStore = useSyncStore();

  useEffect(() => {
    const checkConnection = () => {
      if (!navigator.onLine) {
        syncStore.setOffline();
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [syncStore]);

  return syncStore.status;
}
