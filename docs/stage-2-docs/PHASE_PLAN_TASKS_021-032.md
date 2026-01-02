# Phased Implementation Plan: Tasks 021-032

**Version**: 1.0  
**Created**: 2026-01-01  
**Scope**: User Profile + Cloud Sync + Providers + Enhanced Features  
**Total Estimated Hours**: 45 hours (~1.5-2 weeks)  
**Prerequisite**: Tasks 010-020 complete (specifically Task 020 - Clerk-Convex Connection)

---

## Context Documents (Progressive Disclosure)

Load these documents **only when starting the relevant phase** to minimize context window usage:

| Phase | Tasks | Load Document | Sections to Read |
|-------|-------|---------------|------------------|
| **F** (User Profile) | 021 | `docs/context/CLERK_CONVEX_CONTEXT.md` | §7 (User Profile Management), §8 (Schema) |
| **G** (Cloud Sync) | 022-024 | `docs/context/CONVEX_CONTEXT.md` | §5 (React Hooks), §8 (Optimistic Updates) |
| **H** (Providers) | 025-027 | None needed - follows existing adapter patterns |
| **I** (Features) | 028-032 | `docs/context/CONVEX_CONTEXT.md` | §2-4 as needed for new schemas |

**Strategy**: Context docs from Tasks 010-020 remain valid. Load sections only when entering specific tasks.

---

## Executive Summary

Tasks 021-032 complete Stage 2 with user-facing features:

| Area | Tasks | Hours | Description |
|------|-------|-------|-------------|
| User Profile | 021 | 4h | Profile page with cloud-synced preferences |
| Cloud Sync | 022-024 | 9h | Session history, cross-device testing, sync UI |
| Providers | 025-027 | 10h | OpenAI + GLM adapters, UI updates |
| Enhanced Features | 028-032 | 22h | Export formats, sharing, syntax highlighting, templates, analytics |

**Parallelization Opportunity**: Phase H (Providers) can run entirely in parallel with Phases F and G.

---

## Delegation Strategy: Alt Coder

Use **Alt Coder** for smaller/medium, well-scoped tasks that follow established patterns.

### Alt Coder Eligible Tasks

| Task | ID | Hours | Rationale |
|------|-----|-------|-----------|
| Sync Status & Indicators | 024 | 2h | Small, isolated UI component |
| OpenAI Provider Adapter | 025 | 4h | Follows existing adapter pattern exactly |
| GLM Provider Adapter | 026 | 4h | Follows existing adapter pattern exactly |
| Provider UI Updates | 027 | 2h | Adding logos + updating existing components |
| Syntax Highlighting | 030 | 3h | Self-contained, swapping one library for another |

**Total Alt Coder Hours**: 15h (33% of total)

### Main Agent Tasks (Require Orchestration/Complexity)

| Task | ID | Hours | Rationale |
|------|-----|-------|-----------|
| User Profile & Preferences | 021 | 4h | Convex schema + Zustand + sync logic |
| Session History UI | 022 | 4h | Core feature, multiple interacting components |
| Cross-Device Sync Testing | 023 | 3h | Manual testing, documentation, edge cases |
| Export Formats (PDF, HTML) | 028 | 5h | Library evaluation, complex rendering |
| Session Sharing | 029 | 4h | Backend + frontend + security |
| Template Customization UI | 031 | 6h | Complex multi-page feature |
| Analytics Dashboard | 032 | 4h | Aggregation logic, charts, multiple views |

**Total Main Agent Hours**: 30h (67% of total)

---

## Dependency Graph

```
From Phase E (Tasks 010-020):
                    ┌──────────┐
                    │ Task 020 │ (Clerk-Convex Connection)
                    │ Required │
                    └────┬─────┘
                         │
    ┌────────────────────┼────────────────────────────────────┐
    │                    │                                    │
    │                    │                                    │
    ▼                    ▼                                    ▼
┌──────────┐      ┌──────────┐                         ┌──────────┐
│ Task 021 │      │ Task 022 │◄────┐                   │ Task 029 │
│ Profile  │      │ Sessions │     │                   │ Sharing  │
│ [MAIN]   │      │ [MAIN]   │     │                   │ [MAIN]   │
└──────────┘      └────┬─────┘     │                   └──────────┘
                       │           │
                       ▼           │                   ┌──────────┐
                ┌──────────┐       │                   │ Task 031 │
                │ Task 023 │       │                   │ Templates│
                │ Testing  │       │                   │ [MAIN]   │
                │ [MAIN]   │       │                   └──────────┘
                └──────────┘       │
                                   │                   ┌──────────┐
From Task 016:                     │                   │ Task 032 │
┌──────────┐                       │                   │Analytics │
│ Task 016 │                       │                   │ [MAIN]   │
│ Realtime │───────────────────────┘                   └──────────┘
└────┬─────┘
     │
     ▼
┌──────────┐
│ Task 024 │
│ SyncUI   │
│ [ALT]    │
└──────────┘


INDEPENDENT TRACK (Phase H - Providers):
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌──────────┐          ┌──────────┐                 │
│  │ Task 025 │          │ Task 026 │                 │
│  │ OpenAI   │          │ GLM      │                 │
│  │ [ALT]    │          │ [ALT]    │                 │
│  └────┬─────┘          └────┬─────┘                 │
│       │                     │                        │
│       └──────────┬──────────┘                        │
│                  │                                   │
│                  ▼                                   │
│           ┌──────────┐                              │
│           │ Task 027 │                              │
│           │ UI       │                              │
│           │ [ALT]    │                              │
│           └──────────┘                              │
│                                                      │
│  Can run in PARALLEL with all other phases          │
└──────────────────────────────────────────────────────┘


INDEPENDENT TRACK (Enhanced Features - No Auth Deps):
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌──────────┐          ┌──────────┐                 │
│  │ Task 028 │          │ Task 030 │                 │
│  │ Export   │          │ Syntax   │                 │
│  │ [MAIN]   │          │ [ALT]    │                 │
│  └──────────┘          └──────────┘                 │
│                                                      │
│  Can run in PARALLEL with all other phases          │
└──────────────────────────────────────────────────────┘
```

---

## Phase F: User Profile (Day 1)

> **Goal**: Enable authenticated users to manage their profile and preferences.

**Start Condition**: Task 020 (Clerk-Convex Connection) complete

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| User Profile & Preferences | 021 | 4h | **Main** | `convex/users.ts`, `ProfilePage.tsx`, `UserPreferences.tsx` |

**Context Documents**:
- `docs/context/CLERK_CONVEX_CONTEXT.md` §7 (User Profile Management)
- `docs/context/CLERK_CONVEX_CONTEXT.md` §8 (Schema with User References)

**Key Actions**:
1. Create `convex/users.ts` with CRUD for user preferences (follow §7 pattern)
2. Add users table schema with theme, default provider fields (§8)
3. Create `ProfilePage.tsx` with user info display
4. Create `UserPreferences.tsx` component for preference editing
5. Connect `ui-store.ts` to sync with Convex when authenticated

**Convex Schema**:
```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.optional(v.string()),
  preferences: v.object({
    theme: v.union(v.literal('light'), v.literal('dark'), v.literal('system')),
    defaultProvider: v.optional(v.string()),
  }),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_clerk_id', ['clerkId'])
```

**Verification Checkpoint**:
- [ ] Preferences persist after logout/login
- [ ] Theme syncs across devices
- [ ] Default provider remembered

---

## Phase G: Cloud Sync Features (Days 1-3)

> **Goal**: Complete session management with cross-device synchronization.

### Track G1: Session History (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Session History UI | 022 | 4h | **Main** | `SessionList.tsx`, `SessionCard.tsx`, `DeleteSessionDialog.tsx`, `EmptySessionState.tsx` |

**Dependencies**: Task 016 (Real-Time Sync), Task 020 (Clerk-Convex)

**Context Documents**:
- `docs/context/CONVEX_CONTEXT.md` §5 (React Hooks Usage - useQuery patterns)
- `docs/context/CONVEX_CONTEXT.md` §8 (Optimistic Updates)

**Key Actions**:
1. Create `SessionList.tsx` using Convex `useQuery` for real-time updates (§5)
2. Create `SessionCard.tsx` with archetype icon, date, status, actions
3. Implement delete with confirmation dialog
4. Add load/resume session functionality
5. Design empty state for new users

**Design Reference**:
```
┌──────────────────────────────────────────┐
│ 📊 Data Analyst                          │
│ Started: Jan 1, 2026 • Complete          │
│ [View] [Resume] [Delete]                 │
└──────────────────────────────────────────┘
```

### Track G2: Sync Testing (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Cross-Device Sync Testing | 023 | 3h | **Main** | Test results in `docs/sync-test-results.md` |

**Dependencies**: Task 022 (Session History UI)

**Test Scenarios**:
1. Start session on desktop, continue on mobile
2. Start on mobile, finish on desktop
3. Offline answers, sync when online
4. Same session open on two devices (conflict test)

**Key Actions**:
1. Set up test environments (2 browsers/devices)
2. Execute each scenario manually
3. Document results with screenshots
4. Verify data integrity after each scenario
5. Note any edge cases discovered

### Track G3: Sync Status UI (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Sync Status & Indicators | 024 | 2h | **Alt Coder** | `SyncStatus.tsx` |

**Dependencies**: Task 016 (Real-Time Sync)

**Alt Coder Prompt**:
```
TASK: Create a SyncStatus component showing real-time sync state.

EXPECTED OUTCOME: 
- SyncStatus.tsx component in packages/web/src/components/layout/
- Integrates with existing sync-store.ts (if available) or creates minimal state
- Shows 4 states: Synced, Syncing, Offline, Error

REQUIRED SKILLS: frontend-design (invoke for styling)

REQUIRED TOOLS: Read, Write, Edit, Glob

CONTEXT DOCUMENTS (Read First):
- docs/context/CONVEX_CONTEXT.md §5 (React Hooks - for useQuery subscription patterns)

MUST DO:
- Use Catppuccin theme colors (see src/styles/globals.css)
- Use shadcn/ui patterns for consistency
- Show "Last synced: X minutes ago" when synced
- Add manual refresh button for error state
- Use Framer Motion for smooth state transitions
- Position in bottom-left corner (subtle)
- Make it responsive (smaller on mobile)

MUST NOT DO:
- Do not create new stores without checking existing ones
- Do not use colors outside the design system
- Do not add heavy dependencies
- Do not modify layout components (Header, Sidebar, etc.)

CONTEXT:
- Existing components: packages/web/src/components/layout/
- Theme: packages/web/src/styles/globals.css
- Similar component reference: ThemeToggle in ui/
- Sync states needed: synced, syncing, offline, error
```

**Verification Checkpoint (Phase G)**:
- [ ] Session list displays with real-time updates
- [ ] Delete confirmation works
- [ ] All sync test scenarios pass
- [ ] Sync status visible and accurate

---

## Phase H: Additional Providers (Days 1-2, Parallel)

> **Goal**: Add OpenAI and GLM provider support.

**Parallelization**: This entire phase runs in parallel with Phases F and G.

### Track H1: OpenAI Adapter (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| OpenAI Provider Adapter | 025 | 4h | **Alt Coder** | `openai-adapter.ts`, `openai-adapter.test.ts` |

**Alt Coder Prompt**:
```
TASK: Create OpenAI provider adapter following existing adapter pattern.

EXPECTED OUTCOME:
- openai-adapter.ts in packages/web/src/lib/providers/
- openai-adapter.test.ts with mocked tests
- Registered in registry.ts

REQUIRED SKILLS: None (follow existing patterns)

REQUIRED TOOLS: Read, Write, Edit, Grep, Bash (for tests)

MUST DO:
- Read anthropic-adapter.ts first as reference pattern
- Read types.ts for ProviderAdapter interface
- Implement streaming via SSE (Server-Sent Events)
- Support models: gpt-4o (128k), gpt-4-turbo (128k), gpt-3.5-turbo (16k)
- Use Bearer token authentication
- Handle rate limiting (429) with exponential backoff
- Handle invalid API key (401) with clear error
- Add to registry.ts exports
- Write unit tests with fetch mocking

MUST NOT DO:
- Do not modify existing adapters
- Do not change the ProviderAdapter interface
- Do not add new dependencies without justification

CONTEXT:
- Reference adapter: packages/web/src/lib/providers/anthropic-adapter.ts
- Types: packages/web/src/lib/providers/types.ts
- Registry: packages/web/src/lib/providers/registry.ts
- Test reference: packages/web/src/lib/providers/__tests__/ (if exists)
- OpenAI API docs: https://platform.openai.com/docs/api-reference/chat
```

### Track H2: GLM Adapter (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| GLM Provider Adapter | 026 | 4h | **Alt Coder** | `glm-adapter.ts`, `glm-adapter.test.ts` |

**Alt Coder Prompt**:
```
TASK: Create GLM (Zhipu AI) provider adapter.

EXPECTED OUTCOME:
- glm-adapter.ts in packages/web/src/lib/providers/
- glm-adapter.test.ts with mocked tests
- Registered in registry.ts

REQUIRED SKILLS: None (follow existing patterns)

REQUIRED TOOLS: Read, Write, Edit, Grep, Bash (for tests), WebFetch (for API docs)

MUST DO:
- Research GLM/Zhipu AI API documentation first
- Read minimax-adapter.ts as reference (may have similar JWT auth)
- Implement according to ProviderAdapter interface
- Support GLM-4 models
- Handle GLM-specific authentication flow
- Add to registry.ts exports
- Write unit tests with mocked responses

MUST NOT DO:
- Do not modify existing adapters
- Do not guess API format - research first
- Do not skip error handling

CONTEXT:
- Reference adapter (JWT auth): packages/web/src/lib/providers/minimax-adapter.ts
- Types: packages/web/src/lib/providers/types.ts
- GLM API likely at: https://open.bigmodel.cn/ or similar
```

### Track H3: Provider UI Updates (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Provider UI Updates | 027 | 2h | **Alt Coder** | Updated `ProviderSelector.tsx`, SVG logos |

**Dependencies**: Tasks 025, 026 complete

**Alt Coder Prompt**:
```
TASK: Add OpenAI and GLM to the provider selection UI.

EXPECTED OUTCOME:
- OpenAI and GLM logos in packages/web/public/provider-logos/
- Updated ProviderSelector.tsx with new providers
- Model dropdowns for each new provider

REQUIRED SKILLS: frontend-design (invoke for layout)

REQUIRED TOOLS: Read, Write, Edit, Glob

MUST DO:
- Read existing ProviderSelector.tsx for current pattern
- Add openai.svg and glm.svg logos (simple, recognizable)
- Maintain responsive 5-card layout (2 rows on mobile, single row desktop)
- Use consistent card styling with existing providers
- Connect to new adapters from registry.ts
- Test provider switching in dev

MUST NOT DO:
- Do not redesign the entire provider UI
- Do not change existing provider configurations
- Do not remove skip functionality

CONTEXT:
- Current UI: packages/web/src/components/providers/ProviderSelector.tsx
- Existing logos reference: Check if provider-logos folder exists
- Total providers after: 5 (Anthropic, OpenRouter, MiniMax, OpenAI, GLM)
```

**Verification Checkpoint (Phase H)**:
- [ ] OpenAI API calls work with valid key
- [ ] GLM API calls work with valid key
- [ ] Streaming responses render correctly
- [ ] All 5 providers visible in selector
- [ ] Provider switching works smoothly

---

## Phase I: Enhanced Features (Days 2-5)

> **Goal**: Complete Stage 2 with export, sharing, and advanced features.

### Track I1: Export Formats (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Export Formats (PDF, HTML) | 028 | 5h | **Main** | `pdf-export.ts`, `html-export.ts`, `ExportFormatSelector.tsx` |

**Dependencies**: None (can start immediately)

**Key Actions**:
1. Evaluate library options: `html2pdf.js` vs `jsPDF` vs `react-pdf`
2. Implement PDF export with proper styling
3. Implement HTML export with inline CSS
4. Create format selector component
5. Handle font fallbacks for PDF (Satoshi → system fonts)
6. Test in multiple browsers

**Library Recommendation**: `html2pdf.js` - simple, works client-side, good quality.

### Track I2: Syntax Highlighting (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Syntax Highlighting Enhancement | 030 | 3h | **Alt Coder** | Updated `MarkdownRenderer.tsx` |

**Dependencies**: None (can start immediately, parallel with I1)

**Alt Coder Prompt**:
```
TASK: Replace current syntax highlighting with Shiki and add copy button.

EXPECTED OUTCOME:
- MarkdownRenderer.tsx updated with Shiki
- Copy button on all code blocks
- Theme-aware highlighting (Catppuccin)

REQUIRED SKILLS: None

REQUIRED TOOLS: Read, Write, Edit, Bash (for dependency)

MUST DO:
- Run: bun add shiki
- Read current MarkdownRenderer.tsx implementation
- Integrate Shiki with Catppuccin theme
- Support languages: JavaScript, TypeScript, Python, Bash, JSON, YAML, Markdown
- Add copy button that appears on hover (desktop) or always (mobile)
- Show "Copied!" feedback with timeout
- Ensure no layout shift during highlight loading

MUST NOT DO:
- Do not change the markdown parsing logic
- Do not add unused language support (bundle size)
- Do not break existing document rendering

CONTEXT:
- Current renderer: packages/web/src/components/document/MarkdownRenderer.tsx (or similar)
- Theme tokens: packages/web/src/styles/globals.css
- Shiki Catppuccin: Available in shiki themes
```

### Track I3: Session Sharing (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Session Sharing (Public Links) | 029 | 4h | **Main** | `convex/shares.ts`, `SharedSessionPage.tsx`, `ShareButton.tsx` |

**Dependencies**: Task 020 (Clerk-Convex Connection)

**Context Documents**:
- `docs/context/CONVEX_CONTEXT.md` §2 (Schema Definition - for shares table)
- `docs/context/CONVEX_CONTEXT.md` §3-4 (Queries/Mutations)

**Key Actions**:
1. Create `convex/shares.ts` with share CRUD and expiration logic
2. Generate unique share codes (nanoid or similar)
3. Create public `/share/:code` route (no auth required)
4. Build read-only view of session results
5. Add ShareButton to results page
6. Implement expiration options (1d, 7d, 30d, never)

**Convex Schema**:
```typescript
shares: defineTable({
  sessionId: v.id('sessions'),
  shareCode: v.string(),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index('by_code', ['shareCode'])
  .index('by_session', ['sessionId'])
```

### Track I4: Template Customization (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Template Customization UI | 031 | 6h | **Main** | `convex/templates.ts`, `TemplateEditorPage.tsx`, `TemplateEditor.tsx`, `SectionEditor.tsx` |

**Dependencies**: Task 020 (Clerk-Convex Connection)

**Key Actions**:
1. Create `convex/templates.ts` for custom template storage
2. Build template editor page with section-by-section editing
3. Implement "Fork from template" functionality
4. Add live preview of template output
5. Connect to document generation to use custom templates
6. Handle template versioning (optional)

**This is the most complex task** - consider breaking into subtasks if needed.

### Track I5: Analytics Dashboard (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Analytics Dashboard (Basic) | 032 | 4h | **Main** | `convex/analytics.ts`, `AnalyticsPage.tsx`, `StatsCard.tsx`, `UsageChart.tsx` |

**Dependencies**: Task 020 (Clerk-Convex Connection)

**Key Actions**:
1. Create `convex/analytics.ts` for aggregation queries
2. Build `StatsCard` component for single metrics
3. Add simple chart using Recharts (lightweight)
4. Track: sessions started/completed/abandoned, archetype usage, provider usage
5. Ensure user-scoped data (privacy)

---

## Implementation Schedule

| Day | Tasks | Agents | Focus |
|-----|-------|--------|-------|
| **Day 1** | 021, 025, 026, 028, 030 | Main + 2-3 Alt | Profile, Providers, Export (parallel) |
| **Day 2** | 022, 027, 028 (cont.) | Main + Alt | Sessions, Provider UI, Export |
| **Day 3** | 023, 024, 029 | Main + Alt | Sync testing, Sync UI, Sharing |
| **Day 4** | 031 | Main | Template Editor (complex) |
| **Day 5** | 031 (cont.), 032 | Main | Templates, Analytics |

### Parallel Execution Map

```
Day 1:
├── Main Agent: Task 021 (Profile)
├── Alt Coder 1: Task 025 (OpenAI)
├── Alt Coder 2: Task 026 (GLM)
└── Alt Coder 3: Task 030 (Syntax)

Day 2:
├── Main Agent: Task 022 (Sessions) → Task 028 (Export)
└── Alt Coder: Task 027 (Provider UI)

Day 3:
├── Main Agent: Task 023 (Testing) → Task 029 (Sharing)
└── Alt Coder: Task 024 (Sync UI)

Day 4-5:
└── Main Agent: Task 031 (Templates) → Task 032 (Analytics)
```

---

## Alt Coder Delegation Summary

| Task | Alt Coder Prompt Location | Review Priority |
|------|---------------------------|-----------------|
| 024 - Sync Status | Track G3 above | Medium (UI only) |
| 025 - OpenAI Adapter | Track H1 above | High (API integration) |
| 026 - GLM Adapter | Track H2 above | High (API integration) |
| 027 - Provider UI | Track H3 above | Low (simple updates) |
| 030 - Syntax Highlighting | Track I2 above | Medium (library swap) |

### Post-Delegation Verification Checklist

For each Alt Coder task, verify:
- [ ] Code follows existing patterns (read reference files first)
- [ ] No new anti-patterns introduced
- [ ] Tests pass (if tests were required)
- [ ] `lsp_diagnostics` clean
- [ ] `bun run typecheck` passes
- [ ] Manual smoke test in dev

---

## Success Criteria

### Phase F Complete When:
- [ ] User preferences sync across devices
- [ ] Theme persists after logout/login
- [ ] Profile page accessible from user menu

### Phase G Complete When:
- [ ] Session history shows all user sessions
- [ ] Cross-device sync tests pass (documented)
- [ ] Sync status indicator visible and accurate

### Phase H Complete When:
- [ ] 5 providers available in selector
- [ ] OpenAI and GLM APIs work correctly
- [ ] Provider switching seamless

### Phase I Complete When:
- [ ] PDF and HTML exports generate correctly
- [ ] Shareable links work and expire properly
- [ ] Syntax highlighting uses Shiki with copy button
- [ ] Custom templates can be created and used
- [ ] Analytics dashboard shows user stats

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| GLM API documentation unclear | Alt Coder can research + escalate if blocked |
| PDF export quality issues | Fall back to HTML export, iterate on PDF |
| Template editor complexity | Break into 2-day subtasks, MVP first |
| Alt Coder produces non-conforming code | All delegated tasks require explicit pattern references |

---

## Rollback Procedures

### If Provider Adapters Fail:
- Remove from registry.ts
- Existing 3 providers continue working
- Re-attempt with more research

### If Export Fails:
- Markdown export continues working
- PDF/HTML are optional enhancements

### If Template Editor Fails:
- Built-in templates continue working
- Defer custom templates to Stage 3

### If Analytics Fails:
- No impact on core functionality
- Defer to Stage 3

---

## Final Stage 2 Verification

After all tasks 021-032 complete, run this checklist:

```bash
# 1. Full build
bun run build

# 2. Type check
bun run typecheck

# 3. Unit tests
bun run test

# 4. E2E tests
bun run test:e2e

# 5. Manual verification
# - Sign up new user
# - Complete interview
# - Save results
# - Share session
# - Export PDF + HTML
# - Create custom template
# - Check analytics
# - Verify cross-device sync
# - Test all 5 providers
```

---

*This plan maximizes parallelization with Alt Coder delegation while ensuring thorough verification of all delegated work.*
