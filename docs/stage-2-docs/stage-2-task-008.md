# Task 2.1.8: E2E Happy Path Tests

**Task ID**: 2.1.8
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 6 hours
**Dependencies**: Task 2.1.7 (E2E Test Setup)
**Status**: Not Started

---

## Overview

Create end-to-end tests for the primary user flows (happy paths) through the application.

---

## Deliverables

- [ ] **Complete Interview Flow**: Landing → Setup → Interview → Results
- [ ] **Document Generation**: Complete interview → Generate → Download
- [ ] **Session Persistence**: Complete partial interview → Refresh → Resume
- [ ] **Theme Toggle**: Switch themes, verify persistence

---

## Files to Create

```
packages/web/e2e/
├── interview-flow.spec.ts
├── document-generation.spec.ts
├── session-persistence.spec.ts
└── theme-toggle.spec.ts
```

---

## Key Test Cases

```typescript
test('complete interview flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  // Setup provider
  await expect(page).toHaveURL('/setup');
  await page.click('[data-testid="provider-anthropic"]');
  await page.fill('[data-testid="api-key-input"]', 'test-key');
  await page.click('text=Continue');
  // Complete interview
  await expect(page).toHaveURL('/interview');
  // ... answer all 15 questions
  // Verify results
  await expect(page).toHaveURL('/results');
  await expect(page.locator('[data-testid="recommendation"]')).toBeVisible();
});
```

---

## Success Criteria

- Happy path tests pass consistently
- Tests complete in under 60 seconds
- No flaky tests

---

## Notes

Reference the manual E2E test results documented in:
- `docs/full-interview-test-results.md`
- `docs/e2e-test-results.md`
- `docs/claude-agent-browser-test.md`

Ensure data-testid attributes are added to components as needed.
