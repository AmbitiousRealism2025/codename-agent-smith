# Task 2.1.3: Classification Engine Unit Tests

**Task ID**: 2.1.3
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 5 hours
**Dependencies**: Task 2.1.1 (Unit Test Setup)
**Coverage Target**: 90%+
**Status**: Not Started

---

## Overview

Create comprehensive unit tests for the classification engine, ensuring the scoring algorithm correctly matches requirements to agent archetypes.

---

## Deliverables

- [ ] Test `classifier.ts` - scoring algorithm correctness
- [ ] Test template matching for each of 5 archetypes
- [ ] Test confidence score calculation
- [ ] Test alternative template ranking
- [ ] Test edge cases (incomplete requirements, tie-breaking)

---

## Files to Create

```
packages/web/src/lib/classification/__tests__/
├── classifier.test.ts
└── scoring.test.ts
```

---

## Key Test Cases

```typescript
describe('AgentClassifier', () => {
  it('returns Solo Coder for single-dev, low complexity projects');
  it('returns Pair Programmer for pair-style collaboration');
  it('returns Dev Team for multi-developer projects');
  it('returns Autonomous Squad for high autonomy requirements');
  it('returns Human-in-the-Loop for low autonomy projects');
  it('calculates confidence scores correctly');
  it('ranks alternative templates by score');
  it('handles incomplete requirements gracefully');
});
```

---

## Success Criteria

- Each archetype has explicit test coverage
- Scoring algorithm produces deterministic results
- 90%+ coverage for `lib/classification/`

---

## Notes

The 5 agent archetypes are:
1. Solo Coder
2. Pair Programmer
3. Dev Team
4. Autonomous Squad
5. Human-in-the-Loop

Tests should cover the weighted multi-criteria scoring strategy and ensure consistent, deterministic results.
