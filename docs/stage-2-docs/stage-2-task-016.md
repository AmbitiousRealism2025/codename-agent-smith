# Task 2.2.6: Real-Time Sync Implementation

**Task ID**: 2.2.6
**Phase**: 2.2 - Convex Backend Migration
**Estimated**: 4 hours
**Dependencies**: Task 2.2.4 (Migrate Zustand Stores)
**Status**: Not Started

---

## Overview

Implement real-time synchronization between clients using Convex subscriptions.

---

## Deliverables

- [ ] Subscribe to Convex real-time updates
- [ ] Handle conflicts (last-write-wins strategy)
- [ ] Show sync status indicator in UI
- [ ] Handle reconnection after network loss
- [ ] Batch sync for multiple changes

---

## Files to Create/Update

```
packages/web/src/lib/storage/
├── realtime-sync.ts     # Real-time subscription logic
└── conflict-resolver.ts # Conflict resolution strategy

packages/web/src/components/layout/
└── SyncIndicator.tsx    # Sync status UI
```

---

## Sync States

- ✅ Synced (all changes saved)
- 🔄 Syncing... (changes in progress)
- ⚠️ Offline (queued for sync)
- ❌ Sync Error (retry button)

---

## Success Criteria

- Changes sync within 1 second
- Offline changes sync on reconnection
- Conflicts resolved without data loss

---

## Notes

Convex provides built-in real-time subscriptions via `useQuery`. This task focuses on:
1. Managing subscription lifecycle
2. Handling edge cases (network loss, conflicts)
3. Providing clear UI feedback

Target sync latency: < 1 second
Conflict resolution: Last-write-wins strategy
