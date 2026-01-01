# Task 2.1.2: Interview System Unit Tests

**Task ID**: 2.1.2
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 6 hours
**Dependencies**: Task 2.1.1 (Unit Test Setup)
**Coverage Target**: 90%+
**Status**: Not Started

---

## Overview

Create comprehensive unit tests for the interview system, covering question data integrity, validation schemas, and state machine transitions.

---

## Deliverables

- [ ] Test `questions.ts` - question data integrity
- [ ] Test `validation.ts` - all Zod schemas validate correctly
- [ ] Test `advisor-store.ts` - state machine transitions
  - Session initialization
  - Response recording
  - Stage progression
  - Question navigation (next, previous, skip)
  - Requirements mapping from responses

---

## Files to Create

```
packages/web/src/lib/interview/__tests__/
├── questions.test.ts
├── validation.test.ts
└── advisor-store.test.ts
```

---

## Key Test Cases

```typescript
describe('advisor-store', () => {
  it('initializes session with correct defaults');
  it('records response and advances to next question');
  it('advances stage when all stage questions answered');
  it('allows navigation to previous question');
  it('handles skip for optional questions');
  it('maps responses to requirements correctly');
  it('persists state to localStorage');
  it('restores state from localStorage');
});
```

---

## Success Criteria

- All 15 questions have validated test data
- State machine handles all edge cases
- 90%+ coverage for `lib/interview/`

---

## Notes

The interview system is the core user flow. Tests should validate the complete journey from session start through all 15 questions across 4 stages (discovery, requirements, architecture, output).
