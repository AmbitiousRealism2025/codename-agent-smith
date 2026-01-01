# Task 2.5.1: OpenAI Provider Adapter

**Task ID**: 2.5.1
**Phase**: 2.5 - Additional Providers
**Estimated**: 4 hours
**Dependencies**: None (can run parallel with other phases)
**Status**: Not Started

---

## Overview

Create a provider adapter for OpenAI API, supporting GPT-4, GPT-4o, and GPT-3.5 models.

---

## Deliverables

- [ ] Create `openai-adapter.ts`
- [ ] Implement streaming with OpenAI API
- [ ] Support GPT-4, GPT-4o, GPT-3.5 models
- [ ] Handle API key validation
- [ ] Add to provider registry

---

## Files to Create

```
packages/web/src/lib/providers/
├── openai-adapter.ts
└── __tests__/
    └── openai-adapter.test.ts
```

---

## Provider Configuration

```typescript
{
  id: 'openai',
  name: 'OpenAI',
  baseUrl: 'https://api.openai.com/v1',
  authentication: 'bearer',
  models: [
    { id: 'gpt-4o', name: 'GPT-4o', context: 128000 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', context: 128000 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', context: 16385 }
  ]
}
```

---

## Success Criteria

- OpenAI API calls work
- Streaming responses render correctly
- Model selection works

---

## Notes

Follow the existing adapter pattern:
- Implement `ProviderAdapter` interface from `lib/providers/types.ts`
- Register in `lib/providers/registry.ts`
- Handle rate limiting and error responses

OpenAI API uses:
- Bearer token authentication
- SSE (Server-Sent Events) for streaming
- Standard Chat Completions endpoint
