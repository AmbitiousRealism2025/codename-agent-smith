# Task 2.1.7: E2E Test Setup

**Task ID**: 2.1.7
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 3 hours
**Dependencies**: Task 2.1.1 (Unit Test Setup)
**Status**: Not Started

---

## Overview

Configure Playwright for end-to-end testing with proper fixtures, page objects, and CI integration.

---

## Deliverables

- [ ] Configure Playwright with project settings
- [ ] Create test fixtures and helpers
- [ ] Set up test database/storage mocking
- [ ] Configure CI workflow for E2E tests
- [ ] Create page object models for key pages

---

## Files to Create

```
packages/web/
├── e2e/
│   ├── fixtures/
│   │   ├── test-base.ts       # Extended test with fixtures
│   │   └── storage.ts         # Storage state fixtures
│   ├── pages/
│   │   ├── landing.page.ts    # Page object: Landing
│   │   ├── setup.page.ts      # Page object: Setup
│   │   ├── interview.page.ts  # Page object: Interview
│   │   └── results.page.ts    # Page object: Results
│   └── support/
│       └── commands.ts        # Custom test commands
├── playwright.config.ts       # Update existing config
└── package.json               # Update scripts
```

---

## Success Criteria

- Playwright runs in headed and headless mode
- Page objects work for navigation
- CI configuration ready

---

## Notes

Page objects should map to the main user routes:
- `/` (Landing)
- `/setup` (Provider Selection)
- `/interview` (15-Question Flow)
- `/results` (Export/Download)

Use the existing test data from manual E2E testing documented in `/docs`.
