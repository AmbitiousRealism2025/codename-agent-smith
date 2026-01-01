# Task 2.5.3: Provider UI Updates

**Task ID**: 2.5.3
**Phase**: 2.5 - Additional Providers
**Estimated**: 2 hours
**Dependencies**: Tasks 2.5.1, 2.5.2 (New Provider Adapters)
**Status**: Not Started

---

## Overview

Update the provider selection UI to include OpenAI and GLM as options.

---

## Deliverables

- [ ] Add OpenAI and GLM logos
- [ ] Update ProviderSelector with new providers
- [ ] Update model selection dropdowns
- [ ] Test provider switching

---

## Files to Update

```
packages/web/src/components/providers/
├── ProviderSelector.tsx
├── ProviderCard.tsx
└── ModelSelector.tsx

packages/web/public/
└── provider-logos/
    ├── openai.svg
    └── glm.svg
```

---

## Success Criteria

- New providers selectable in UI
- Logos display correctly
- Switching providers works smoothly

---

## Notes

Provider UI should maintain consistency with existing design:
- Provider cards with logo, name, description
- Model dropdown for each provider
- API key input with validation feedback

After Stage 2, total providers will be 5:
1. Anthropic (existing)
2. OpenRouter (existing)
3. MiniMax (existing)
4. OpenAI (new)
5. GLM (new)

Ensure responsive layout works with 5 providers on both mobile and desktop.
