# Task 2.3.4: Connect Clerk to Convex

**Task ID**: 2.3.4
**Phase**: 2.3 - Authentication (Clerk)
**Estimated**: 3 hours
**Dependencies**: Task 2.3.1 (Clerk Setup), Task 2.2.1 (Convex Setup)
**Status**: Not Started

---

## Overview

Connect Clerk authentication to Convex backend for user-scoped data access.

---

## Deliverables

- [ ] Configure Clerk JWT template for Convex
- [ ] Add userId to Convex session schema
- [ ] Update Convex functions to use auth
- [ ] Implement user-scoped queries
- [ ] Add auth context to Convex client

---

## Files to Update

```
convex/
├── schema.ts              # Add userId field
├── sessions.ts            # User-scoped queries
├── auth.config.ts         # Clerk configuration
└── _generated/
```

---

## Schema Update

```typescript
sessions: defineTable({
  userId: v.optional(v.string()),  // Add user association
  sessionId: v.string(),
  // ... existing fields
})
  .index('by_user', ['userId'])    // Add user index
  .index('by_session_id', ['sessionId'])
```

---

## Success Criteria

- User ID attached to sessions
- Queries return only user's data
- Auth token validated by Convex

---

## Notes

Convex + Clerk integration requires:
1. JWT template in Clerk dashboard
2. Auth config in Convex
3. Using `ctx.auth.getUserIdentity()` in Convex functions

This enables row-level security where users only see their own data.
