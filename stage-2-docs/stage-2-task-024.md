# Task 2.4.3: Sync Status & Indicators

**Task ID**: 2.4.3
**Phase**: 2.4 - Cloud Sync
**Estimated**: 2 hours
**Dependencies**: Task 2.2.6 (Real-Time Sync)
**Status**: Not Started

---

## Overview

Add visual indicators to show users the current sync status and last sync time.

---

## Deliverables

- [ ] Add sync status to header/footer
- [ ] Show last synced time
- [ ] Manual sync button
- [ ] Network status indicator

---

## Files to Create

```
packages/web/src/components/layout/
└── SyncStatus.tsx
```

---

## Success Criteria

- User knows sync state at all times
- Manual sync available
- Network issues clearly indicated

---

## Notes

Sync status indicators:
- ✅ **Synced** - "All changes saved"
- 🔄 **Syncing...** - "Saving changes..."
- ⚠️ **Offline** - "Working offline - changes will sync when connected"
- ❌ **Sync Error** - "Unable to sync - [Retry]"

Position options:
- Bottom-left corner (subtle)
- Header right side (prominent)
- Status bar (if added)

Consider using Framer Motion for smooth state transitions.
