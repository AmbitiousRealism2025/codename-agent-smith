# Task 2.2.3: Create Storage Adapter Abstraction

**Task ID**: 2.2.3
**Phase**: 2.2 - Convex Backend Migration
**Estimated**: 4 hours
**Dependencies**: Task 2.2.2 (Convex CRUD Functions)
**Status**: Not Started

---

## Overview

Create an abstraction layer that allows seamless switching between Dexie (IndexedDB) and Convex storage backends.

---

## Deliverables

- [ ] Create `StorageAdapter` interface
- [ ] Implement `DexieAdapter` (current IndexedDB)
- [ ] Implement `ConvexAdapter` (new cloud storage)
- [ ] Create adapter factory based on auth state
- [ ] Add offline queue for Convex operations

---

## Files to Create

```
packages/web/src/lib/storage/
├── adapter.ts           # StorageAdapter interface
├── dexie-adapter.ts     # IndexedDB implementation
├── convex-adapter.ts    # Convex implementation
├── adapter-factory.ts   # Creates appropriate adapter
└── offline-queue.ts     # Queue mutations when offline
```

---

## Interface Design

```typescript
interface StorageAdapter {
  // Sessions
  createSession(data: SessionData): Promise<string>;
  getSession(id: string): Promise<Session | null>;
  updateSession(id: string, data: Partial<SessionData>): Promise<void>;
  deleteSession(id: string): Promise<void>;
  listSessions(): Promise<Session[]>;

  // Responses
  recordResponse(sessionId: string, response: Response): Promise<void>;
  getResponses(sessionId: string): Promise<Response[]>;

  // Documents
  saveDocument(sessionId: string, doc: Document): Promise<string>;
  getDocument(sessionId: string): Promise<Document | null>;

  // Sync
  sync(): Promise<void>;
  getOfflineQueue(): OfflineAction[];
}
```

---

## Success Criteria

- Both adapters implement identical interface
- App works with either adapter
- Offline queue captures mutations

---

## Notes

This adapter pattern allows:
1. Graceful migration from Dexie to Convex
2. Fallback to local storage when offline
3. Easy testing with mock adapters
4. Future storage backend changes without app rewrites
