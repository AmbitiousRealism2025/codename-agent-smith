# Task 2.2.4: Migrate Zustand Stores to Use Adapter

**Task ID**: 2.2.4
**Phase**: 2.2 - Convex Backend Migration
**Estimated**: 4 hours
**Dependencies**: Task 2.2.3 (Storage Adapter Abstraction)
**Status**: Not Started

---

## Overview

Update all Zustand stores to use the new StorageAdapter instead of direct Dexie calls, enabling seamless backend switching.

---

## Deliverables

- [ ] Update `advisor-store.ts` to use `StorageAdapter`
- [ ] Update `provider-store.ts` for API key storage
- [ ] Implement auto-sync on state changes
- [ ] Add loading states for async operations
- [ ] Handle adapter switching (local → cloud)

---

## Files to Update

```
packages/web/src/stores/
├── advisor-store.ts     # Use StorageAdapter
├── provider-store.ts    # API key storage
└── sync-store.ts        # New: sync state management
```

---

## Success Criteria

- State changes persist to correct adapter
- Loading states shown during async ops
- Seamless switch between adapters

---

## Notes

Key changes needed:
1. Replace direct Dexie calls with adapter methods
2. Add async action wrappers for persistence
3. Create sync-store for managing sync state
4. Handle the transition when user logs in (local → cloud adapter)

Important: API keys are encrypted via Web Crypto API before storage. This must continue regardless of backend.
