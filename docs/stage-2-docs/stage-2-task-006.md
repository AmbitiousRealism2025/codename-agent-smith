# Task 2.1.6: Zustand Store Tests

**Task ID**: 2.1.6
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 4 hours
**Dependencies**: Task 2.1.1 (Unit Test Setup)
**Coverage Target**: 85%+
**Status**: Not Started

---

## Overview

Create unit tests for all Zustand stores, validating actions, selectors, and persistence middleware behavior.

---

## Deliverables

- [ ] Test `advisor-store.ts` - all actions and selectors
- [ ] Test `provider-store.ts` - provider selection persistence
- [ ] Test `ui-store.ts` - theme and layout preferences
- [ ] Test persist middleware behavior

---

## Files to Create

```
packages/web/src/stores/__tests__/
├── advisor-store.test.ts
├── provider-store.test.ts
└── ui-store.test.ts
```

---

## Success Criteria

- Store actions update state correctly
- Selectors return expected computed values
- Persist middleware saves/restores correctly
- 85%+ coverage for `stores/`

---

## Notes

The project uses Zustand with persist middleware for:
- `advisor-store.ts` - Interview session state, stage progression
- `provider-store.ts` - API provider configuration
- `ui-store.ts` - UI preferences (theme, layout)

Key selectors to test: `getProgress()`, `getCurrentQuestion()`
