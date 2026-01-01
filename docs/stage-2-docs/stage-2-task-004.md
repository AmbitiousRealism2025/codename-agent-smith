# Task 2.1.4: Document Generator Unit Tests

**Task ID**: 2.1.4
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 4 hours
**Dependencies**: Task 2.1.1 (Unit Test Setup)
**Coverage Target**: 85%+
**Status**: Not Started

---

## Overview

Create unit tests for the document generator, validating output structure, section generation, and template substitution.

---

## Deliverables

- [ ] Test `document-generator.ts` - output structure
- [ ] Test section generation for each of 8 sections
- [ ] Test Markdown validity
- [ ] Test template substitution
- [ ] Test edge cases (missing template, empty requirements)

---

## Files to Create

```
packages/web/src/lib/documentation/__tests__/
├── document-generator.test.ts
└── sections.test.ts
```

---

## Key Test Cases

```typescript
describe('PlanningDocumentGenerator', () => {
  it('generates valid Markdown output');
  it('includes all 8 required sections');
  it('substitutes template values correctly');
  it('handles missing requirements gracefully');
  it('generates correct TOC links');
});
```

---

## Success Criteria

- Generated documents pass Markdown linting
- All 8 sections verified
- 85%+ coverage for `lib/documentation/`

---

## Notes

The document generator uses a Builder pattern to construct markdown docs from requirements + templates. Test all 8 section types and verify phase-based implementation planning is correctly generated.
