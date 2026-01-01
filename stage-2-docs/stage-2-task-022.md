# Task 2.4.1: Session History UI

**Task ID**: 2.4.1
**Phase**: 2.4 - Cloud Sync
**Estimated**: 4 hours
**Dependencies**: Task 2.2.6 (Real-Time Sync), Task 2.3.4 (Clerk-Convex Connection)
**Status**: Not Started

---

## Overview

Create a UI for viewing and managing saved sessions with real-time updates from Convex.

---

## Deliverables

- [ ] `<SessionList>` - List of saved sessions
- [ ] Session cards showing: date, archetype, status
- [ ] Delete session with confirmation
- [ ] Load session (resume or view)
- [ ] Empty state when no sessions

---

## Files to Create

```
packages/web/src/components/sessions/
├── SessionList.tsx
├── SessionCard.tsx
├── DeleteSessionDialog.tsx
└── EmptySessionState.tsx
```

---

## Design Specifications

```
┌────────────────────────────────────────────────┐
│  Your Sessions                                  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 📊 Data Analyst                          │  │
│  │ Started: Jan 1, 2026 • Complete          │  │
│  │ [View] [Resume] [Delete]                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 💻 Code Assistant                        │  │
│  │ Started: Dec 28, 2025 • In Progress (8/15)│  │
│  │ [Resume] [Delete]                        │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [Start New Session]                            │
└────────────────────────────────────────────────┘
```

---

## Success Criteria

- Sessions load from Convex
- Real-time updates when synced
- Delete confirmation prevents accidents

---

## Notes

Session card should display:
- Agent archetype icon/emoji
- Session start date
- Status (Complete / In Progress with question count)
- Action buttons based on status

Use Convex `useQuery` for real-time session list updates.
