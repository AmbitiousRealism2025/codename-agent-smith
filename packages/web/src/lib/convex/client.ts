import { ConvexReactClient } from 'convex/react';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (import.meta.env.DEV) {
  console.log('[Convex] Initializing with URL:', convexUrl ? '✓ URL loaded' : '✗ URL missing');
}

export const convex = new ConvexReactClient(convexUrl);
