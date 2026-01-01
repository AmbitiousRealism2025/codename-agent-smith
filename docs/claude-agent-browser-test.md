# Agent Advisor PWA - Browser Test Plan

**Date**: 2026-01-01
**Application URL**: http://localhost:5173
**Test Status**: Ready for execution (requires Claude Code restart for automated browsermcp testing)

---

## Executive Summary

This document outlines the comprehensive browser testing strategy for the Agent Advisor PWA. The application guides users through an interview process to determine their ideal AI agent type and generates planning documentation.

### Application Flow
```
Landing → Setup (Provider) → Interview (15 questions) → Results → Document Generation
```

---

## Test Environment

- **Dev Server**: Running on localhost:5173 (verified via `lsof -ti:5173`)
- **Browser Target**: Chrome, Firefox, Safari, Edge
- **MCP Tool**: browsermcp (installed but requires session restart)
- **Test Type**: Functional, UI/UX, Accessibility, Performance

---

## Route Testing

### 1. Landing Page (`/`)

**Purpose**: First impression, onboarding entry point

**Test Cases**:
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] CTA buttons are visible and clickable
- [ ] Navigation to `/setup` works
- [ ] Responsive layout on mobile (320px, 768px, 1024px)
- [ ] Dark mode toggle works (if present)
- [ ] Performance: LCP < 2.5s

**Critical Elements**:
- Main heading
- Description/value proposition
- "Get Started" or similar CTA button
- Footer (if present)

---

### 2. Setup Page (`/setup`)

**Purpose**: Provider configuration (Anthropic, OpenRouter, MiniMax)

**Test Cases**:
- [ ] Provider selector displays all 3 providers
- [ ] Provider cards are clickable
- [ ] API Key input field:
  - [ ] Shows masked input (••••)
  - [ ] Has show/hide toggle
  - [ ] Accepts paste
  - [ ] Validates on blur
- [ ] Model selector dropdown works (if applicable)
- [ ] "Test Connection" button:
  - [ ] Shows loading state
  - [ ] Displays success checkmark on valid key
  - [ ] Shows error message on invalid key
- [ ] "Continue" button:
  - [ ] Disabled until provider configured
  - [ ] Navigates to `/interview` when enabled
- [ ] Configuration persists to IndexedDB
- [ ] Back button returns to landing

**Provider-Specific Tests**:
- Anthropic: API key format validation
- OpenRouter: Model selection works
- MiniMax: JWT auth handling (if applicable)

---

### 3. Interview Page (`/interview`)

**Purpose**: 15-question interview across 4 stages

**Test Cases - Overall Flow**:
- [ ] Page loads with first question
- [ ] Progress indicator shows "1/15"
- [ ] Stage indicator shows current stage
- [ ] Question cards slide in with animation (250ms)
- [ ] Auto-save indicator appears on input change
- [ ] "Saving..." → "Saved" transition works
- [ ] Navigation buttons:
  - [ ] "Back" disabled on first question
  - [ ] "Skip" available when appropriate
  - [ ] "Continue" enabled after valid response
- [ ] Keyboard navigation:
  - [ ] Tab moves through interactive elements
  - [ ] Enter submits/advances
  - [ ] Escape cancels (if modal)

**Question Type Tests**:

#### Text Input Questions
- [ ] Text input renders with placeholder
- [ ] Character counter updates (if present)
- [ ] Validation on submit (required fields)
- [ ] Error message animation (shake + red border)
- [ ] Large textarea for long-form responses

#### Choice/Radio Questions
- [ ] Card-style options render
- [ ] Selected state shows primary background + checkmark
- [ ] Hover effect (lift + shadow)
- [ ] Click selects option
- [ ] Auto-advances on selection (or requires Continue)

#### Multiselect Questions
- [ ] Pill-style tags render
- [ ] Multiple selections work
- [ ] Selected pills have primary background
- [ ] "Other" option opens inline text input (if present)
- [ ] Deselection works

#### Boolean Questions
- [ ] Toggle switch renders (48px wide)
- [ ] Animated slider with spring physics
- [ ] "Yes" / "No" labels visible
- [ ] Click toggles state
- [ ] Accessible to keyboard (Space to toggle)

**Progress & Navigation**:
- [ ] Progress ring animates on each answer
- [ ] "8/15 questions" text updates
- [ ] Going back shows previous question with saved answer
- [ ] Stage advances automatically when stage complete
- [ ] Final question navigates to `/results`

**State Persistence**:
- [ ] Refresh mid-interview preserves progress
- [ ] Close tab → reopen resumes session
- [ ] Responses saved to IndexedDB

---

### 4. Results Page (`/results`)

**Purpose**: Classification results and template recommendation

**Test Cases**:
- [ ] Page shows classification results
- [ ] Recommended template card displays:
  - [ ] Template name and icon
  - [ ] Confidence percentage
  - [ ] Animated confidence bar (0 → final value)
  - [ ] "Generate Document" CTA button
- [ ] Alternative templates section:
  - [ ] Shows 2-3 alternatives
  - [ ] Confidence scores visible
  - [ ] Clickable to switch selection
- [ ] Reasoning section explains why template chosen
- [ ] "Generate Document" button:
  - [ ] Shows loading state during generation
  - [ ] Streams document content character-by-character
  - [ ] Displays DocumentViewer when complete

**Classification Accuracy**:
- [ ] Correct template for data analysis responses
- [ ] Correct template for content creation responses
- [ ] Correct template for code assistance responses
- [ ] Correct template for research responses
- [ ] Correct template for automation responses

---

### 5. Document Viewer (embedded in Results)

**Purpose**: Display and download generated planning document

**Test Cases**:
- [ ] Markdown renders correctly:
  - [ ] Headings (H1, H2, H3) styled properly
  - [ ] Code blocks have syntax highlighting
  - [ ] Tables are responsive
  - [ ] Lists have custom bullet styling
  - [ ] Links are styled and clickable
- [ ] Table of Contents (TOC):
  - [ ] Auto-generated from headings
  - [ ] Sticky positioning works
  - [ ] Section links jump to correct location
  - [ ] Highlights current section on scroll
- [ ] Streaming effect:
  - [ ] Characters appear with typewriter effect
  - [ ] Code blocks fade in when complete
  - [ ] Smooth, no jank
- [ ] Document actions:
  - [ ] Download button produces valid .md file
  - [ ] Copy button copies to clipboard (with success toast)
  - [ ] Print button opens print dialog
- [ ] Responsive on mobile:
  - [ ] TOC collapses or becomes bottom sheet
  - [ ] Code blocks scroll horizontally if needed

---

### 6. Advisor Page (`/advisor`)

**Purpose**: Main dashboard with layout

**Test Cases**:
- [ ] MainLayout renders correctly
- [ ] Header shows:
  - [ ] Logo
  - [ ] Provider selector
  - [ ] Settings button
  - [ ] Theme toggle
- [ ] Sidebar:
  - [ ] Collapsible (toggle button works)
  - [ ] Session list displays
  - [ ] Quick actions available
  - [ ] Collapses to hamburger on mobile
- [ ] Content area:
  - [ ] Max-width centered (max-w-4xl)
  - [ ] Responsive padding
- [ ] Navigation between /advisor, /templates, /settings works

---

### 7. Templates Page (`/templates`)

**Purpose**: Browse all 5 agent templates

**Test Cases**:
- [ ] Template gallery grid renders
- [ ] All 5 template cards display:
  - [ ] Data Analyst 📊
  - [ ] Content Creator 📝
  - [ ] Code Assistant 💻
  - [ ] Research Agent 🔍
  - [ ] Automation Agent ⚡
- [ ] Filter bar works:
  - [ ] "All" shows all templates
  - [ ] Filter by capability tags
  - [ ] Smooth fade/resize animation
- [ ] Template cards:
  - [ ] Icon and name visible
  - [ ] Short description readable
  - [ ] Capability pills display
  - [ ] Hover effect (lift + shadow)
  - [ ] Staggered entry animation (50ms delay)
- [ ] "View Details" opens modal:
  - [ ] Modal shows full template info
  - [ ] All sections preview
  - [ ] "Start with this template" button works
  - [ ] Close modal (X, Escape, click outside)

---

### 8. Settings Page (`/settings`)

**Purpose**: User preferences and data management

**Test Cases**:
- [ ] Settings panel renders
- [ ] Theme toggle:
  - [ ] Light/Dark/System options
  - [ ] Persists across sessions
  - [ ] Updates UI immediately
- [ ] Provider settings:
  - [ ] Manage API keys
  - [ ] Remove provider configuration
  - [ ] Re-test connection
- [ ] Data management:
  - [ ] Export sessions produces valid JSON
  - [ ] Import sessions works (file upload)
  - [ ] Clear data shows confirmation dialog
  - [ ] Clear data wipes IndexedDB
- [ ] About section:
  - [ ] Version info displays
  - [ ] Links to docs/repo work

---

## Cross-Cutting Concerns

### Accessibility (WCAG 2.1 AA)
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all elements
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Screen reader announces states (VoiceOver, NVDA tested)
- [ ] Skip-to-content link present
- [ ] ARIA labels on icon buttons
- [ ] Form inputs have associated labels
- [ ] Error messages announced
- [ ] axe-core: Zero critical/serious issues

### Performance
- [ ] Lighthouse Performance: 90+
- [ ] Core Web Vitals:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Bundle size < 500KB gzipped
- [ ] TTI < 3s on 3G
- [ ] Font loading without FOUT
- [ ] Images lazy loaded

### PWA Functionality
- [ ] Lighthouse PWA score: 100
- [ ] Manifest.json valid
- [ ] Icons (192px, 512px) present
- [ ] Service worker registered
- [ ] Install prompt appears (A2HS)
- [ ] Installable on:
  - [ ] Chrome (desktop/mobile)
  - [ ] Safari (iOS)
  - [ ] Firefox
  - [ ] Edge
- [ ] Offline fallback page shows
- [ ] Cached assets load offline
- [ ] IndexedDB operations work offline

### Offline Mode
- [ ] Offline indicator in header
- [ ] Interview continues offline (saves to IndexedDB)
- [ ] API calls queued when offline
- [ ] Sync when connection restored
- [ ] No data loss during network interruptions
- [ ] Clear messaging when generation requires network

### Responsive Design
- [ ] Mobile breakpoints (320px, 375px, 414px)
- [ ] Tablet (768px, 1024px)
- [ ] Desktop (1280px, 1920px)
- [ ] No horizontal scroll
- [ ] Touch targets 44px minimum
- [ ] Readable text without zooming
- [ ] Landscape orientation works

### Browser Compatibility
- [ ] Chrome (latest, -1)
- [ ] Firefox (latest, -1)
- [ ] Safari (iOS 15+, macOS latest)
- [ ] Edge (latest)
- [ ] No console errors in any browser

---

## Automated Test Execution (browsermcp)

**Status**: ⚠️ Requires Claude Code restart to enable browsermcp tools

### Once browsermcp is available:

```typescript
// Test flow example
await browser.navigate('http://localhost:5173');
await browser.click('button:has-text("Get Started")');
await browser.waitForURL('/setup');
// ... continue test automation
```

### Test Scenarios to Automate:
1. **Happy Path**: Landing → Setup → Interview (all 15 questions) → Results → Download
2. **Provider Switching**: Change provider mid-flow
3. **Error Recovery**: Invalid API key, network failure simulation
4. **Navigation**: Back button, browser refresh, tab close/reopen
5. **Offline**: Start interview → go offline → complete → go online → sync

---

## Manual Testing Checklist

Until automated browsermcp testing is available, follow these manual steps:

### Quick Smoke Test (5 minutes)
1. Open http://localhost:5173
2. Click through landing → setup → interview
3. Answer 3-5 questions
4. Verify progress updates
5. Check auto-save works (refresh page, verify state persists)

### Full Flow Test (15 minutes)
1. Complete entire interview (all 15 questions)
2. Verify classification results
3. Generate document
4. Verify streaming works
5. Download document and verify content
6. Test theme toggle
7. Test provider switching in settings

### Edge Case Testing (10 minutes)
1. Invalid API key handling
2. Network disconnection mid-interview
3. Browser refresh during generation
4. Mobile viewport testing
5. Keyboard-only navigation

---

## Known Issues / Limitations

*Document any issues discovered during testing here*

- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

---

## Test Results

### Last Run: [Date/Time]
### Tester: Claude Code + browsermcp
### Status: ⏳ Pending (requires restart)

| Test Area | Status | Notes |
|-----------|--------|-------|
| Landing Page | ⏳ | Pending browsermcp |
| Setup Flow | ⏳ | Pending browsermcp |
| Interview (15Q) | ⏳ | Pending browsermcp |
| Classification | ⏳ | Pending browsermcp |
| Document Gen | ⏳ | Pending browsermcp |
| Templates | ⏳ | Pending browsermcp |
| Settings | ⏳ | Pending browsermcp |
| Accessibility | ⏳ | Pending axe-core |
| Performance | ⏳ | Pending Lighthouse |
| PWA | ⏳ | Pending install test |
| Offline | ⏳ | Pending network simulation |

---

## Next Steps

1. **Restart Claude Code** to enable browsermcp tools
2. **Execute automated test suite** using browsermcp
3. **Run Lighthouse audits** for performance/accessibility/PWA
4. **Document results** and any issues found
5. **Create bug tickets** for P0/P1 issues
6. **Iterate and retest** until all tests pass

---

## Appendix: Test Data

### Sample Interview Responses (Data Analyst Path)
- Primary goal: "Analyze CSV files and generate statistical reports"
- Capabilities: Data analysis, visualization, statistical modeling
- Target audience: Data scientists, analysts
- Memory needs: Long-term persistent
- File access: Yes (CSV, Excel)
- Web access: No
- etc.

### Sample Interview Responses (Content Creator Path)
- Primary goal: "Generate blog posts and social media content"
- Capabilities: Writing, editing, SEO optimization
- Target audience: Content marketers, bloggers
- etc.

---

*End of Test Plan*
