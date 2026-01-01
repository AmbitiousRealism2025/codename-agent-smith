# Task 2.3.1: Clerk Setup & Configuration

**Task ID**: 2.3.1
**Phase**: 2.3 - Authentication (Clerk)
**Estimated**: 2 hours
**Dependencies**: Task 2.2.1 (Convex Project Setup)
**Status**: Not Started

---

## Overview

Set up Clerk authentication service and integrate it with the React application.

---

## Deliverables

- [ ] Create Clerk application
- [ ] Configure authentication methods (email, Google, GitHub)
- [ ] Add Clerk environment variables
- [ ] Install `@clerk/clerk-react`
- [ ] Wrap app in `ClerkProvider`

---

## Files to Update

```
packages/web/
├── src/
│   └── main.tsx           # Add ClerkProvider
├── .env.local             # Add Clerk keys
└── .env.example           # Document env vars
```

---

## Success Criteria

- Clerk dashboard configured
- Provider wraps application
- No build errors

---

## Notes

Required setup:
```bash
bun add @clerk/clerk-react
```

Environment variables needed:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY` (server-side only, if needed)

Clerk provides pre-built UI components for sign-in/sign-up that match modern design standards.
