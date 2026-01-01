# Task 2.2.2: Implement Convex CRUD Functions

**Task ID**: 2.2.2
**Phase**: 2.2 - Convex Backend Migration
**Estimated**: 6 hours
**Dependencies**: Task 2.2.1 (Convex Project Setup)
**Status**: Not Started

---

## Overview

Implement all CRUD (Create, Read, Update, Delete) functions for sessions, responses, and documents in Convex.

---

## Deliverables

- [ ] `sessions.ts` - Create, read, update, delete sessions
- [ ] `responses.ts` - Store and retrieve interview responses
- [ ] `documents.ts` - Save and load generated documents
- [ ] Type-safe queries and mutations

---

## Files to Create

```
convex/
├── sessions.ts      # Session CRUD
├── responses.ts     # Response CRUD
├── documents.ts     # Document CRUD
└── _generated/      # Auto-generated types
```

---

## Convex Functions

```typescript
// convex/sessions.ts
export const create = mutation({...});
export const get = query({...});
export const update = mutation({...});
export const remove = mutation({...});
export const listRecent = query({...});

// convex/responses.ts
export const record = mutation({...});
export const getBySession = query({...});
export const updateResponse = mutation({...});

// convex/documents.ts
export const save = mutation({...});
export const getBySession = query({...});
```

---

## Success Criteria

- All CRUD operations work via Convex dashboard
- Types are auto-generated correctly
- Real-time updates reflected in UI

---

## Notes

Follow the existing schema in `convex/schema.ts`:
- `sessions` - Interview sessions with metadata
- `apiKeys` - Encrypted provider API keys (handle carefully)
- `settings` - User preferences

Ensure proper indexing for efficient queries.
