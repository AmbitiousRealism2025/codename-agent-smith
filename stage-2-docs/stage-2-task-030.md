# Task 2.6.3: Syntax Highlighting Enhancement

**Task ID**: 2.6.3
**Phase**: 2.6 - Enhanced Features
**Estimated**: 3 hours
**Dependencies**: None
**Status**: Not Started

---

## Overview

Enhance syntax highlighting in generated documents with Shiki and add copy functionality.

---

## Deliverables

- [ ] Replace current syntax highlighting with Shiki
- [ ] Support for more languages
- [ ] Copy code button on code blocks
- [ ] Theme-aware highlighting

---

## Files to Update

```
packages/web/src/components/document/
└── MarkdownRenderer.tsx
```

---

## Success Criteria

- Syntax highlighting works for common languages
- Copy button on all code blocks
- Colors match light/dark theme

---

## Notes

Shiki advantages:
- VSCode-quality highlighting
- Supports all VSCode themes
- Works with Catppuccin theme
- Better accuracy than highlight.js/Prism

Languages to prioritize:
- JavaScript/TypeScript
- Python
- Bash/Shell
- JSON/YAML
- Markdown

Copy button behavior:
- Shows on hover (desktop) or always visible (mobile)
- Visual feedback on copy (checkmark, "Copied!")
- Copies without line numbers if present
