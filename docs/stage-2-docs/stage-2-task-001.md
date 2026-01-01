# Task 2.1.1: Unit Test Setup & Configuration

**Task ID**: 2.1.1
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 3 hours
**Dependencies**: None
**Status**: Complete

---

## Overview

Configure the testing infrastructure foundation for the project. Vitest and Playwright are already installed but have ZERO tests implemented.

---

## Deliverables

- [ ] Configure Vitest with proper TypeScript paths
- [ ] Set up test utilities and mocking helpers
- [ ] Create test fixtures for common data structures
- [ ] Configure coverage reporting (Istanbul)
- [ ] Add test scripts to package.json (`bun run test`, `bun run test:coverage`)

---

## Files to Create

```
packages/web/
├── src/
│   └── test/
│       ├── setup.ts           # Vitest setup file
│       ├── mocks/
│       │   ├── providers.ts   # Mock API providers
│       │   ├── storage.ts     # Mock IndexedDB/Convex
│       │   └── zustand.ts     # Mock Zustand stores
│       └── fixtures/
│           ├── sessions.ts    # Sample session data
│           ├── responses.ts   # Sample interview responses
│           └── templates.ts   # Sample template data
├── vitest.config.ts           # Update existing config
└── package.json               # Update scripts
```

---

## Success Criteria

- `bun run test` executes without errors
- Coverage report generates correctly
- Mocks work for storage and API calls

---

## Notes

This task establishes the foundation for all subsequent testing tasks. Ensure proper TypeScript path aliasing matches the existing `@/` pattern used throughout the codebase.
