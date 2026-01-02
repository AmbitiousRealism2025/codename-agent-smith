# Mini-Task: Landing Page Logo Integration

**Status:** Ready to Implement  
**Estimated Time:** 15 minutes  
**Priority:** Pre-Stage 2

---

## Objective

Replace the text-based hero content on the landing page with the Agent Smith logo image, creating a prominent, centered brand identity above the CTA buttons.

---

## Current State

```
LandingPage.tsx structure:
├── Skip link (a11y)
├── ThemeToggle
├── <main>
│   ├── Badge ("Build Claude Agent SDK Apps")  ← REMOVE
│   ├── <h1>Agent Advisor</h1>                 ← REMOVE
│   ├── <p>Description...</p>                  ← REMOVE
│   └── Buttons (Get Started, Browse)          ← KEEP
```

---

## Target State

```
LandingPage.tsx structure:
├── Skip link (a11y)
├── ThemeToggle
├── <main>
│   ├── <img> Agent Smith Logo                 ← NEW
│   └── Buttons (Get Started, Browse)          ← KEEP
```

---

## Image Details

| Property | Value |
|----------|-------|
| Source | `images/Agent-Smith-Logo-test.png` |
| Dimensions | 1024 × 683 px (landscape) |
| Content | Circular emblem + "AGENT SMITH" text + tagline |
| Background | Dark navy (baked in) |

---

## Implementation Steps

### Step 1: Copy Image to Public Folder

```bash
cp images/Agent-Smith-Logo-test.png packages/web/public/images/
```

**Why:** Vite serves files from `public/` at root. Keeps assets organized.

### Step 2: Update LandingPage.tsx

**Remove:**
- Badge div (line 16-19)
- `<h1>` element (line 21-23)
- `<p>` description (line 25-28)
- Lucide imports: `Sparkles` (no longer needed)

**Add:**
```tsx
<img
  src="/images/Agent-Smith-Logo-test.png"
  alt="Agent Smith - smithing custom agent plans and templates"
  className="mb-10 w-full max-w-xl"
/>
```

**Styling:**
- `w-full` - responsive, fills container up to max
- `max-w-xl` (576px) - prominent but not overwhelming
- `mb-10` - spacing before buttons (matches current `mt-10` on buttons div)

### Step 3: Adjust Button Container

Remove `mt-10` from buttons div (spacing now handled by image's `mb-10`).

### Step 4: Verify

- [ ] Image displays centered above buttons
- [ ] Responsive on mobile (scales down)
- [ ] Alt text present for a11y
- [ ] Both light and dark themes render correctly
- [ ] Build passes (`bun run build`)

---

## Code Diff Preview

```diff
- import { ArrowRight, Sparkles } from 'lucide-react';
+ import { ArrowRight } from 'lucide-react';

  <main className="text-center" role="main">
-   <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
-     <Sparkles size={14} className="text-accent" aria-hidden="true" />
-     Build Claude Agent SDK Apps
-   </div>
-
-   <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
-     Agent Advisor
-   </h1>
-
-   <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
-     A guided interview that helps you create custom Claude Agent SDK
-     applications. Answer questions, get a tailored implementation plan.
-   </p>
+   <img
+     src="/images/Agent-Smith-Logo-test.png"
+     alt="Agent Smith - smithing custom agent plans and templates"
+     className="mb-10 w-full max-w-xl"
+   />

-   <div id="main-actions" className="mt-10 flex flex-col ..." tabIndex={-1}>
+   <div id="main-actions" className="flex flex-col ..." tabIndex={-1}>
```

---

## Future Considerations (Not This Task)

- **Transparent background version** - for seamless light theme integration
- **Responsive image variants** - srcset with smaller versions for mobile
- **Loading optimization** - consider lazy loading if below fold (not applicable here)
- **Retina support** - 2x version at 2048×1366

---

## Dependencies

None. Pure static asset addition.

---

## Rollback

```bash
git checkout packages/web/src/components/pages/LandingPage.tsx
rm packages/web/public/images/Agent-Smith-Logo-test.png
```
