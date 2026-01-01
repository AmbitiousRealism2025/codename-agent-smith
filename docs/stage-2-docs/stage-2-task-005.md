# Task 2.1.5: Provider Adapter Unit Tests

**Task ID**: 2.1.5
**Phase**: 2.1 - Testing Infrastructure
**Estimated**: 5 hours
**Dependencies**: Task 2.1.1 (Unit Test Setup)
**Coverage Target**: 80%+
**Status**: Complete

---

## Overview

Create unit tests for all provider adapters, validating request/response formatting, authentication, and error handling.

---

## Deliverables

- [x] Test `anthropic-adapter.ts` - request/response formatting
- [x] Test `openrouter-adapter.ts` - multi-model support
- [x] Test `minimax-adapter.ts` - JWT authentication
- [x] Test `registry.ts` - provider lookup
- [x] Mock API responses for all providers

---

## Files to Create

```
packages/web/src/lib/providers/__tests__/
├── anthropic-adapter.test.ts
├── openrouter-adapter.test.ts
├── minimax-adapter.test.ts
├── registry.test.ts
└── __mocks__/
    └── fetch.ts
```

---

## Key Test Cases

```typescript
describe('ProviderAdapter', () => {
  it('validates API key format');
  it('formats request correctly for provider');
  it('parses streaming response chunks');
  it('handles rate limit errors');
  it('handles network timeouts');
  it('handles invalid API key errors');
});
```

---

## Success Criteria

- All 3 providers have mocked tests
- Error handling verified for each provider
- 80%+ coverage for `lib/providers/`

---

## Notes

The project uses an Adapter pattern with 3 implementations:
- Anthropic (direct API)
- OpenRouter (multi-model gateway)
- MiniMax (JWT authentication)

Registry pattern used for provider lookup. All tests should mock fetch to avoid real API calls.
