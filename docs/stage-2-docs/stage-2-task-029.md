# Task 2.6.2: Session Sharing (Public Links)

**Task ID**: 2.6.2
**Phase**: 2.6 - Enhanced Features
**Estimated**: 4 hours
**Dependencies**: Task 2.3.4 (Clerk-Convex Connection)
**Status**: Not Started

---

## Overview

Enable users to share completed sessions via public links.

---

## Deliverables

- [ ] Generate shareable links for completed sessions
- [ ] Public view page (read-only)
- [ ] Link expiration options
- [ ] Copy link button

---

## Files to Create

```
convex/
└── shares.ts              # Share link management

packages/web/src/
├── pages/
│   └── SharedSessionPage.tsx
└── components/export/
    └── ShareButton.tsx
```

---

## Success Criteria

- Shareable links work
- Shared view is read-only
- Links can expire

---

## Notes

Share link features:
- Unique URL per share (e.g., `/share/abc123`)
- Read-only view of results document
- Optional expiration (1 day, 7 days, 30 days, never)
- Revoke capability

Privacy considerations:
- No login required to view shared link
- Original user can revoke at any time
- Shared content is a snapshot (doesn't update if original changes)

Convex `shares` table schema:
```typescript
shares: defineTable({
  sessionId: v.id('sessions'),
  shareCode: v.string(),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index('by_code', ['shareCode'])
```
