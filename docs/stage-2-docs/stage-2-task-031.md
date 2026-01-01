# Task 2.6.4: Template Customization UI

**Task ID**: 2.6.4
**Phase**: 2.6 - Enhanced Features
**Estimated**: 6 hours
**Dependencies**: Task 2.3.4 (Clerk-Convex Connection)
**Status**: Not Started

---

## Overview

Create a template editor that allows users to customize and save their own agent templates.

---

## Deliverables

- [ ] Template editor page
- [ ] Edit section content
- [ ] Save custom templates
- [ ] Fork existing templates
- [ ] Preview before saving

---

## Files to Create

```
convex/
└── templates.ts           # Custom template storage

packages/web/src/
├── pages/
│   └── TemplateEditorPage.tsx
└── components/templates/
    ├── TemplateEditor.tsx
    └── SectionEditor.tsx
```

---

## Success Criteria

- Users can create custom templates
- Custom templates persist to cloud
- Templates usable in document generation

---

## Notes

Template structure from existing code:
- 5 built-in archetypes (data-analyst, content-creator, code-assistant, research-agent, automation-agent)
- Each template has: id, name, category, description, capabilityTags, sections

Custom template features:
1. Fork from built-in template
2. Edit name, description, capability tags
3. Modify sections
4. Save to user's account
5. Use in document generation

Convex `templates` table schema:
```typescript
templates: defineTable({
  userId: v.string(),
  name: v.string(),
  basedOn: v.optional(v.string()), // Original template ID
  // ... template content
})
  .index('by_user', ['userId'])
```
