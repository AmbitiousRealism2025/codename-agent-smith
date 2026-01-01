# Task 2.2.1: Convex Project Setup

**Task ID**: 2.2.1
**Phase**: 2.2 - Convex Backend Migration
**Estimated**: 2 hours
**Dependencies**: None (can run parallel with Phase 2.1)
**Status**: Not Started

---

## Overview

Set up the Convex project and integrate the Convex client into the React application. Note: Convex schema already exists in `convex/schema.ts`.

---

## Deliverables

- [ ] Create Convex project (if not already done)
- [ ] Configure Convex environment variables
- [ ] Set up Convex client in React app
- [ ] Test real-time connection works
- [ ] Add Convex provider to app root

---

## Files to Update

```
packages/web/
├── src/
│   ├── main.tsx           # Add ConvexProvider
│   └── lib/
│       └── convex/
│           └── client.ts  # Convex client setup
├── .env.local             # Add CONVEX_URL
└── .env.example           # Document env var
```

---

## Success Criteria

- Convex dashboard accessible
- Real-time updates work in dev
- No TypeScript errors

---

## Notes

Required setup commands:
```bash
bun add convex
bunx convex dev  # Start development mode
bunx convex deploy  # Production deployment
```

The existing schema in `convex/schema.ts` defines the table structures for sessions, responses, and documents.
