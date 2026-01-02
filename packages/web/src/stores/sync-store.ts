import { create } from 'zustand';
import type { AdapterType } from '@/lib/storage/types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

interface SyncState {
  status: SyncStatus;
  adapterType: AdapterType;
  lastSyncedAt: Date | null;
  error: string | null;
  pendingChanges: number;
  isOnline: boolean;
}

interface SyncActions {
  setSyncing: () => void;
  setSynced: () => void;
  setOffline: () => void;
  setOnline: () => void;
  setNetworkStatus: (online: boolean) => void;
  setError: (error: string) => void;
  setAdapterType: (type: AdapterType) => void;
  incrementPending: () => void;
  decrementPending: () => void;
  resetPending: () => void;
  reset: () => void;
}

type SyncStore = SyncState & SyncActions;

const initialState: SyncState = {
  status: 'idle',
  adapterType: 'dexie',
  lastSyncedAt: null,
  error: null,
  pendingChanges: 0,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
};

export const useSyncStore = create<SyncStore>()((set) => ({
  ...initialState,

  setSyncing: () => set({ status: 'syncing', error: null }),

  setSynced: () =>
    set({
      status: 'synced',
      lastSyncedAt: new Date(),
      error: null,
      pendingChanges: 0,
    }),

  setOffline: () => set({ status: 'offline', isOnline: false }),

  setOnline: () => set((state) => ({
    isOnline: true,
    status: state.status === 'offline' ? 'idle' : state.status,
  })),

  setNetworkStatus: (online: boolean) => set((state) => ({
    isOnline: online,
    status: online
      ? (state.status === 'offline' ? 'idle' : state.status)
      : 'offline',
  })),

  setError: (error: string) => set({ status: 'error', error }),

  setAdapterType: (type: AdapterType) => set({ adapterType: type }),

  incrementPending: () =>
    set((state) => ({ pendingChanges: state.pendingChanges + 1 })),

  decrementPending: () =>
    set((state) => ({ pendingChanges: Math.max(0, state.pendingChanges - 1) })),

  resetPending: () => set({ pendingChanges: 0 }),

  reset: () => set(initialState),
}));
