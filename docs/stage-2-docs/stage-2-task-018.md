# Task 2.3.2: Authentication UI Components

**Task ID**: 2.3.2
**Phase**: 2.3 - Authentication (Clerk)
**Estimated**: 4 hours
**Dependencies**: Task 2.3.1 (Clerk Setup)
**Status**: Not Started

---

## Overview

Create authentication UI components that integrate with Clerk and match the existing design system.

---

## Deliverables

- [ ] `<SignInButton>` - Trigger sign-in flow
- [ ] `<UserButton>` - User menu (profile, sign out)
- [ ] `<SignInPage>` - Dedicated sign-in route
- [ ] `<SignUpPage>` - Dedicated sign-up route
- [ ] Update Header with auth UI

---

## Files to Create

```
packages/web/src/
├── pages/
│   ├── SignInPage.tsx
│   └── SignUpPage.tsx
├── components/auth/
│   ├── SignInButton.tsx
│   ├── UserButton.tsx
│   └── AuthGuard.tsx
└── App.tsx                # Add auth routes
```

---

## Design Specifications

```
┌────────────────────────────────────────────────┐
│  Header                                         │
│  ┌────────────────────────────────────────────┐│
│  │ Logo          [Theme] [Sign In] [Sign Up]  ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  After sign in:                                 │
│  ┌────────────────────────────────────────────┐│
│  │ Logo          [Theme] [Avatar ▼]           ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  Avatar dropdown:                               │
│  ┌─────────────┐                                │
│  │ Profile     │                                │
│  │ Settings    │                                │
│  │ ─────────── │                                │
│  │ Sign Out    │                                │
│  └─────────────┘                                │
└────────────────────────────────────────────────┘
```

---

## Success Criteria

- Sign in/up flows work
- User menu displays after auth
- Consistent with existing design system (Catppuccin theme, shadcn/ui)

---

## Notes

Use Clerk's pre-built components where possible, styled to match:
- Tailwind CSS with Catppuccin palette
- shadcn/ui design patterns
- Typography: Satoshi (display), General Sans (body)
