import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useConvex } from 'convex/react';
import { setAdapter, resetToLocalAdapter } from '@/lib/storage';
import { useSyncStore } from '@/stores/sync-store';

/**
 * Switches the storage adapter based on authentication state.
 * - Signed in: Use Convex (cloud) adapter
 * - Signed out: Use Dexie (local) adapter
 */
export function AdapterSwitcher({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const convexClient = useConvex();
  const { setAdapterType } = useSyncStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && convexClient) {
      console.log('[Storage] Switching to Convex adapter (cloud)');
      setAdapter('convex', convexClient);
      setAdapterType('convex');
    } else {
      console.log('[Storage] Using Dexie adapter (local)');
      resetToLocalAdapter();
      setAdapterType('dexie');
    }
  }, [isSignedIn, isLoaded, convexClient, setAdapterType]);

  return <>{children}</>;
}
