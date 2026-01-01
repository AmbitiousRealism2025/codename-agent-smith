# Task 2.1.9: E2E Error & Edge Case Tests

**Task ID**: 2.1.9
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 4 hours
**Dependencies**: Task 2.1.7 (E2E Test Setup)
**Status**: Not Started

---

## Overview

Create end-to-end tests for error states, edge cases, and accessibility validation.

---

## Deliverables

- [ ] **Invalid API Key**: Show error, prompt to re-enter
- [ ] **Network Failure**: Show offline indicator, queue actions
- [ ] **Navigation**: Back button, refresh, browser close
- [ ] **Accessibility**: Keyboard navigation, screen reader flow

---

## Files to Create

```
packages/web/e2e/
├── error-handling.spec.ts
├── offline-mode.spec.ts
├── navigation.spec.ts
└── accessibility.spec.ts
```

---

## Success Criteria

- Error states display correctly
- Offline mode functions as expected
- Navigation edge cases handled
- axe-core passes in E2E tests

---

## Notes

The application already has:
- WCAG AA compliant color contrast
- Skip-to-content links on all pages
- ARIA labels on icon-only buttons
- Focus-visible states on all interactive elements
- Keyboard navigation support
- axe-core testing in dev mode

Ensure E2E tests verify these accessibility features remain functional.
