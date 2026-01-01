# Task 2.5.2: GLM Provider Adapter

**Task ID**: 2.5.2
**Phase**: 2.5 - Additional Providers
**Estimated**: 4 hours
**Dependencies**: None (can run parallel with other phases)
**Status**: Not Started

---

## Overview

Create a provider adapter for GLM (Zhipu AI) API, supporting GLM-4 models.

---

## Deliverables

- [ ] Create `glm-adapter.ts`
- [ ] Implement GLM-specific authentication
- [ ] Support GLM-4 models
- [ ] Handle API key validation
- [ ] Add to provider registry

---

## Files to Create

```
packages/web/src/lib/providers/
├── glm-adapter.ts
└── __tests__/
    └── glm-adapter.test.ts
```

---

## Success Criteria

- GLM API calls work
- Authentication handled correctly
- Streaming responses work

---

## Notes

GLM (Zhipu AI) may have different:
- Authentication method (similar to MiniMax JWT)
- API endpoint format
- Response structure

Research the GLM API documentation for:
- Authentication flow
- Available models and their capabilities
- Streaming vs non-streaming endpoints
- Rate limits and error codes

Follow the existing adapter pattern established by Anthropic, OpenRouter, and MiniMax adapters.
