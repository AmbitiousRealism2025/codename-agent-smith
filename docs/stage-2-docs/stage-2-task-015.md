# Task 2.2.5: Data Migration Tool

**Task ID**: 2.2.5
**Phase**: 2.2 - Convex Backend Migration
**Estimated**: 3 hours
**Dependencies**: Task 2.2.4 (Migrate Zustand Stores)
**Status**: Not Started

---

## Overview

Create a migration tool that moves existing IndexedDB data to Convex when users authenticate.

---

## Deliverables

- [ ] Create migration script for existing IndexedDB data
- [ ] One-click migration button in settings
- [ ] Progress indicator during migration
- [ ] Rollback capability if migration fails
- [ ] Verification that all data migrated

---

## Files to Create

```
packages/web/src/lib/storage/
├── migration.ts         # Migration logic
└── migration-ui.tsx     # Migration component
```

---

## Migration Flow

```
1. User logs in (new auth)
2. Detect existing IndexedDB data
3. Prompt: "Migrate existing sessions to cloud?"
4. Show progress: "Migrating 5/12 sessions..."
5. Verify: "Migration complete. X sessions migrated."
6. Option to keep local backup or clear
```

---

## Success Criteria

- Existing data preserved during migration
- Clear progress feedback
- Verification confirms no data loss

---

## Notes

Data to migrate:
- `sessions` table - Interview sessions, responses, requirements
- `settings` table - User preferences
- `apiKeys` table - Encrypted provider API keys (handle with care)

Migration should be idempotent (safe to run multiple times).
