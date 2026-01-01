# Task 2.3.3: Protected Routes

**Task ID**: 2.3.3
**Phase**: 2.3 - Authentication (Clerk)
**Estimated**: 3 hours
**Dependencies**: Task 2.3.2 (Authentication UI)
**Status**: Not Started

---

## Overview

Implement route protection to require authentication for certain features while allowing anonymous interview completion.

---

## Deliverables

- [ ] Create `AuthGuard` component
- [ ] Protect `/results` route (require auth to save)
- [ ] Protect `/settings` route
- [ ] Redirect to sign-in when needed
- [ ] Allow anonymous interview (auth only for saving)

---

## Files to Update

```
packages/web/src/
├── App.tsx                # Protected route wrapper
└── components/auth/
    └── AuthGuard.tsx      # Route protection logic
```

---

## Route Protection Strategy

```
/               - Public (landing)
/setup          - Public (provider selection)
/interview      - Public (allow anonymous)
/results        - Semi-protected (view ok, save requires auth)
/settings       - Protected (require auth)
```

---

## Success Criteria

- Anonymous users can complete interview
- Saving results prompts sign-in
- Settings require authentication

---

## Notes

Key user flow:
1. User completes interview without signing in
2. When they try to save results, prompt for sign-in
3. After sign-in, save results automatically
4. Return user to results page

This approach maximizes conversion by not requiring auth upfront.
