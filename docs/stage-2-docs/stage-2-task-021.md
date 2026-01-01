# Task 2.3.5: User Profile & Preferences

**Task ID**: 2.3.5
**Phase**: 2.3 - Authentication (Clerk)
**Estimated**: 4 hours
**Dependencies**: Task 2.3.4 (Clerk-Convex Connection)
**Status**: Not Started

---

## Overview

Create user profile functionality with cloud-synced preferences.

---

## Deliverables

- [ ] Create users table in Convex
- [ ] Store user preferences (theme, default provider)
- [ ] Sync preferences across devices
- [ ] Profile page with settings

---

## Files to Create

```
convex/
├── users.ts               # User CRUD

packages/web/src/
├── pages/
│   └── ProfilePage.tsx    # User profile
└── components/settings/
    └── UserPreferences.tsx
```

---

## Success Criteria

- Preferences sync across devices
- Theme preference persists
- Default provider remembered

---

## Notes

User preferences to store:
- Theme (light/dark)
- Default provider
- Notification settings (future)
- Language preference (future i18n)

The existing `ui-store.ts` handles local theme/layout preferences. This task extends it with cloud sync for authenticated users.
