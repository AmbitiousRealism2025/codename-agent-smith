# Stage 2: Testing + Backend Migration - Phased Task List

**Version**: 1.0
**Date**: 2026-01-01
**Status**: ⏳ Not Started
**Prerequisites**: Stage 1 MVP Complete ✅
**Duration**: 4-6 weeks (estimated)

---

## Executive Summary

Stage 2 builds upon the MVP foundation with comprehensive testing, backend migration, and authentication. The primary goals are:

1. **Testing Infrastructure**: Achieve 80%+ test coverage with Vitest unit tests and Playwright E2E tests
2. **Convex Backend Migration**: Replace Dexie/IndexedDB with Convex for real-time cloud sync
3. **User Authentication**: Integrate Clerk for user accounts and session management
4. **Cloud Sync**: Enable cross-device session synchronization via Convex
5. **Additional Providers**: Add OpenAI and GLM provider adapters

**Design Philosophy**: Maintain the exceptional frontend experience from Stage 1 while adding robust backend infrastructure. Prioritize reliability and data integrity over new features.

---

## Phase Overview

| Phase | Focus | Duration | Dependencies |
|-------|-------|----------|--------------|
| 2.1 | Testing Infrastructure | 1-2 weeks | None |
| 2.2 | Convex Backend Migration | 1 week | None (parallel with 2.1) |
| 2.3 | Authentication (Clerk) | 1 week | Phase 2.2 |
| 2.4 | Cloud Sync | 0.5 weeks | Phase 2.2, 2.3 |
| 2.5 | Additional Providers | 0.5-1 week | None (can run parallel) |
| 2.6 | Enhanced Features | 1 week | Phase 2.3 |

---

## Phase 2.1: Testing Infrastructure (Week 1-2)

**Goal**: Establish comprehensive test coverage for all core business logic and critical user flows.

**Note**: Vitest and Playwright are already configured but have ZERO tests implemented.

### Task 2.1.1: Unit Test Setup & Configuration
**Estimated**: 3 hours

**Deliverables**:
- [ ] Configure Vitest with proper TypeScript paths
- [ ] Set up test utilities and mocking helpers
- [ ] Create test fixtures for common data structures
- [ ] Configure coverage reporting (Istanbul)
- [ ] Add test scripts to package.json (`bun run test`, `bun run test:coverage`)

**Files to Create**:
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

**Success Criteria**:
- `bun run test` executes without errors
- Coverage report generates correctly
- Mocks work for storage and API calls

---

### Task 2.1.2: Interview System Unit Tests
**Estimated**: 6 hours

**Coverage Target**: 90%+

**Deliverables**:
- [ ] Test `questions.ts` - question data integrity
- [ ] Test `validation.ts` - all Zod schemas validate correctly
- [ ] Test `advisor-store.ts` - state machine transitions
  - Session initialization
  - Response recording
  - Stage progression
  - Question navigation (next, previous, skip)
  - Requirements mapping from responses

**Test Files to Create**:
```
packages/web/src/lib/interview/__tests__/
├── questions.test.ts
├── validation.test.ts
└── advisor-store.test.ts
```

**Key Test Cases**:
```typescript
describe('advisor-store', () => {
  it('initializes session with correct defaults');
  it('records response and advances to next question');
  it('advances stage when all stage questions answered');
  it('allows navigation to previous question');
  it('handles skip for optional questions');
  it('maps responses to requirements correctly');
  it('persists state to localStorage');
  it('restores state from localStorage');
});
```

**Success Criteria**:
- All 15 questions have validated test data
- State machine handles all edge cases
- 90%+ coverage for `lib/interview/`

---

### Task 2.1.3: Classification Engine Unit Tests
**Estimated**: 5 hours

**Coverage Target**: 90%+

**Deliverables**:
- [ ] Test `classifier.ts` - scoring algorithm correctness
- [ ] Test template matching for each of 5 archetypes
- [ ] Test confidence score calculation
- [ ] Test alternative template ranking
- [ ] Test edge cases (incomplete requirements, tie-breaking)

**Test Files to Create**:
```
packages/web/src/lib/classification/__tests__/
├── classifier.test.ts
└── scoring.test.ts
```

**Key Test Cases**:
```typescript
describe('AgentClassifier', () => {
  it('returns Solo Coder for single-dev, low complexity projects');
  it('returns Pair Programmer for pair-style collaboration');
  it('returns Dev Team for multi-developer projects');
  it('returns Autonomous Squad for high autonomy requirements');
  it('returns Human-in-the-Loop for low autonomy projects');
  it('calculates confidence scores correctly');
  it('ranks alternative templates by score');
  it('handles incomplete requirements gracefully');
});
```

**Success Criteria**:
- Each archetype has explicit test coverage
- Scoring algorithm produces deterministic results
- 90%+ coverage for `lib/classification/`

---

### Task 2.1.4: Document Generator Unit Tests
**Estimated**: 4 hours

**Coverage Target**: 85%+

**Deliverables**:
- [ ] Test `document-generator.ts` - output structure
- [ ] Test section generation for each of 8 sections
- [ ] Test Markdown validity
- [ ] Test template substitution
- [ ] Test edge cases (missing template, empty requirements)

**Test Files to Create**:
```
packages/web/src/lib/documentation/__tests__/
├── document-generator.test.ts
└── sections.test.ts
```

**Key Test Cases**:
```typescript
describe('PlanningDocumentGenerator', () => {
  it('generates valid Markdown output');
  it('includes all 8 required sections');
  it('substitutes template values correctly');
  it('handles missing requirements gracefully');
  it('generates correct TOC links');
});
```

**Success Criteria**:
- Generated documents pass Markdown linting
- All 8 sections verified
- 85%+ coverage for `lib/documentation/`

---

### Task 2.1.5: Provider Adapter Unit Tests
**Estimated**: 5 hours

**Coverage Target**: 80%+

**Deliverables**:
- [ ] Test `anthropic-adapter.ts` - request/response formatting
- [ ] Test `openrouter-adapter.ts` - multi-model support
- [ ] Test `minimax-adapter.ts` - JWT authentication
- [ ] Test `registry.ts` - provider lookup
- [ ] Mock API responses for all providers

**Test Files to Create**:
```
packages/web/src/lib/providers/__tests__/
├── anthropic-adapter.test.ts
├── openrouter-adapter.test.ts
├── minimax-adapter.test.ts
├── registry.test.ts
└── __mocks__/
    └── fetch.ts
```

**Key Test Cases**:
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

**Success Criteria**:
- All 3 providers have mocked tests
- Error handling verified for each provider
- 80%+ coverage for `lib/providers/`

---

### Task 2.1.6: Zustand Store Tests
**Estimated**: 4 hours

**Coverage Target**: 85%+

**Deliverables**:
- [ ] Test `advisor-store.ts` - all actions and selectors
- [ ] Test `provider-store.ts` - provider selection persistence
- [ ] Test `ui-store.ts` - theme and layout preferences
- [ ] Test persist middleware behavior

**Test Files to Create**:
```
packages/web/src/stores/__tests__/
├── advisor-store.test.ts
├── provider-store.test.ts
└── ui-store.test.ts
```

**Success Criteria**:
- Store actions update state correctly
- Selectors return expected computed values
- Persist middleware saves/restores correctly
- 85%+ coverage for `stores/`

---

### Task 2.1.7: E2E Test Setup
**Estimated**: 3 hours

**Deliverables**:
- [ ] Configure Playwright with project settings
- [ ] Create test fixtures and helpers
- [ ] Set up test database/storage mocking
- [ ] Configure CI workflow for E2E tests
- [ ] Create page object models for key pages

**Files to Create**:
```
packages/web/
├── e2e/
│   ├── fixtures/
│   │   ├── test-base.ts       # Extended test with fixtures
│   │   └── storage.ts         # Storage state fixtures
│   ├── pages/
│   │   ├── landing.page.ts    # Page object: Landing
│   │   ├── setup.page.ts      # Page object: Setup
│   │   ├── interview.page.ts  # Page object: Interview
│   │   └── results.page.ts    # Page object: Results
│   └── support/
│       └── commands.ts        # Custom test commands
├── playwright.config.ts       # Update existing config
└── package.json               # Update scripts
```

**Success Criteria**:
- Playwright runs in headed and headless mode
- Page objects work for navigation
- CI configuration ready

---

### Task 2.1.8: E2E Happy Path Tests
**Estimated**: 6 hours

**Deliverables**:
- [ ] **Complete Interview Flow**: Landing → Setup → Interview → Results
- [ ] **Document Generation**: Complete interview → Generate → Download
- [ ] **Session Persistence**: Complete partial interview → Refresh → Resume
- [ ] **Theme Toggle**: Switch themes, verify persistence

**Test Files to Create**:
```
packages/web/e2e/
├── interview-flow.spec.ts
├── document-generation.spec.ts
├── session-persistence.spec.ts
└── theme-toggle.spec.ts
```

**Key Test Cases**:
```typescript
test('complete interview flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  // Setup provider
  await expect(page).toHaveURL('/setup');
  await page.click('[data-testid="provider-anthropic"]');
  await page.fill('[data-testid="api-key-input"]', 'test-key');
  await page.click('text=Continue');
  // Complete interview
  await expect(page).toHaveURL('/interview');
  // ... answer all 15 questions
  // Verify results
  await expect(page).toHaveURL('/results');
  await expect(page.locator('[data-testid="recommendation"]')).toBeVisible();
});
```

**Success Criteria**:
- Happy path tests pass consistently
- Tests complete in under 60 seconds
- No flaky tests

---

### Task 2.1.9: E2E Error & Edge Case Tests
**Estimated**: 4 hours

**Deliverables**:
- [ ] **Invalid API Key**: Show error, prompt to re-enter
- [ ] **Network Failure**: Show offline indicator, queue actions
- [ ] **Navigation**: Back button, refresh, browser close
- [ ] **Accessibility**: Keyboard navigation, screen reader flow

**Test Files to Create**:
```
packages/web/e2e/
├── error-handling.spec.ts
├── offline-mode.spec.ts
├── navigation.spec.ts
└── accessibility.spec.ts
```

**Success Criteria**:
- Error states display correctly
- Offline mode functions as expected
- Navigation edge cases handled
- axe-core passes in E2E tests

---

### Task 2.1.10: CI/CD Test Integration
**Estimated**: 3 hours

**Deliverables**:
- [ ] Configure GitHub Actions workflow for tests
- [ ] Run unit tests on every PR
- [ ] Run E2E tests on main branch merges
- [ ] Generate and upload coverage reports
- [ ] Set up test result badges

**Files to Create/Update**:
```
.github/workflows/
├── test.yml          # Unit tests on PR
├── e2e.yml           # E2E tests on main
└── coverage.yml      # Coverage reporting
```

**Success Criteria**:
- Tests run automatically on PR
- Coverage report visible in PR comments
- E2E tests pass before merge to main

---

## Phase 2.2: Convex Backend Migration (Week 2-3)

**Goal**: Replace Dexie/IndexedDB with Convex for cloud-first data persistence while maintaining offline capability.

**Dependency**: Can run in parallel with Phase 2.1 testing.

**Note**: Convex schema already exists in `convex/schema.ts`. This phase implements the migration.

### Task 2.2.1: Convex Project Setup
**Estimated**: 2 hours

**Deliverables**:
- [ ] Create Convex project (if not already done)
- [ ] Configure Convex environment variables
- [ ] Set up Convex client in React app
- [ ] Test real-time connection works
- [ ] Add Convex provider to app root

**Files to Update**:
```
packages/web/
├── src/
│   ├── main.tsx           # Add ConvexProvider
│   └── lib/
│       └── convex/
│           └── client.ts  # Convex client setup
├── .env.local             # Add CONVEX_URL
└── .env.example           # Document env var
```

**Success Criteria**:
- Convex dashboard accessible
- Real-time updates work in dev
- No TypeScript errors

---

### Task 2.2.2: Implement Convex CRUD Functions
**Estimated**: 6 hours

**Deliverables**:
- [ ] `sessions.ts` - Create, read, update, delete sessions
- [ ] `responses.ts` - Store and retrieve interview responses
- [ ] `documents.ts` - Save and load generated documents
- [ ] Type-safe queries and mutations

**Files to Create**:
```
convex/
├── sessions.ts      # Session CRUD
├── responses.ts     # Response CRUD
├── documents.ts     # Document CRUD
└── _generated/      # Auto-generated types
```

**Convex Functions**:
```typescript
// convex/sessions.ts
export const create = mutation({...});
export const get = query({...});
export const update = mutation({...});
export const remove = mutation({...});
export const listRecent = query({...});

// convex/responses.ts
export const record = mutation({...});
export const getBySession = query({...});
export const updateResponse = mutation({...});

// convex/documents.ts
export const save = mutation({...});
export const getBySession = query({...});
```

**Success Criteria**:
- All CRUD operations work via Convex dashboard
- Types are auto-generated correctly
- Real-time updates reflected in UI

---

### Task 2.2.3: Create Storage Adapter Abstraction
**Estimated**: 4 hours

**Deliverables**:
- [ ] Create `StorageAdapter` interface
- [ ] Implement `DexieAdapter` (current IndexedDB)
- [ ] Implement `ConvexAdapter` (new cloud storage)
- [ ] Create adapter factory based on auth state
- [ ] Add offline queue for Convex operations

**Files to Create**:
```
packages/web/src/lib/storage/
├── adapter.ts           # StorageAdapter interface
├── dexie-adapter.ts     # IndexedDB implementation
├── convex-adapter.ts    # Convex implementation
├── adapter-factory.ts   # Creates appropriate adapter
└── offline-queue.ts     # Queue mutations when offline
```

**Interface Design**:
```typescript
interface StorageAdapter {
  // Sessions
  createSession(data: SessionData): Promise<string>;
  getSession(id: string): Promise<Session | null>;
  updateSession(id: string, data: Partial<SessionData>): Promise<void>;
  deleteSession(id: string): Promise<void>;
  listSessions(): Promise<Session[]>;

  // Responses
  recordResponse(sessionId: string, response: Response): Promise<void>;
  getResponses(sessionId: string): Promise<Response[]>;

  // Documents
  saveDocument(sessionId: string, doc: Document): Promise<string>;
  getDocument(sessionId: string): Promise<Document | null>;

  // Sync
  sync(): Promise<void>;
  getOfflineQueue(): OfflineAction[];
}
```

**Success Criteria**:
- Both adapters implement identical interface
- App works with either adapter
- Offline queue captures mutations

---

### Task 2.2.4: Migrate Zustand Stores to Use Adapter
**Estimated**: 4 hours

**Deliverables**:
- [ ] Update `advisor-store.ts` to use `StorageAdapter`
- [ ] Update `provider-store.ts` for API key storage
- [ ] Implement auto-sync on state changes
- [ ] Add loading states for async operations
- [ ] Handle adapter switching (local → cloud)

**Files to Update**:
```
packages/web/src/stores/
├── advisor-store.ts     # Use StorageAdapter
├── provider-store.ts    # API key storage
└── sync-store.ts        # New: sync state management
```

**Success Criteria**:
- State changes persist to correct adapter
- Loading states shown during async ops
- Seamless switch between adapters

---

### Task 2.2.5: Data Migration Tool
**Estimated**: 3 hours

**Deliverables**:
- [ ] Create migration script for existing IndexedDB data
- [ ] One-click migration button in settings
- [ ] Progress indicator during migration
- [ ] Rollback capability if migration fails
- [ ] Verification that all data migrated

**Files to Create**:
```
packages/web/src/lib/storage/
├── migration.ts         # Migration logic
└── migration-ui.tsx     # Migration component
```

**Migration Flow**:
```
1. User logs in (new auth)
2. Detect existing IndexedDB data
3. Prompt: "Migrate existing sessions to cloud?"
4. Show progress: "Migrating 5/12 sessions..."
5. Verify: "Migration complete. X sessions migrated."
6. Option to keep local backup or clear
```

**Success Criteria**:
- Existing data preserved during migration
- Clear progress feedback
- Verification confirms no data loss

---

### Task 2.2.6: Real-Time Sync Implementation
**Estimated**: 4 hours

**Deliverables**:
- [ ] Subscribe to Convex real-time updates
- [ ] Handle conflicts (last-write-wins strategy)
- [ ] Show sync status indicator in UI
- [ ] Handle reconnection after network loss
- [ ] Batch sync for multiple changes

**Files to Create/Update**:
```
packages/web/src/lib/storage/
├── realtime-sync.ts     # Real-time subscription logic
└── conflict-resolver.ts # Conflict resolution strategy

packages/web/src/components/layout/
└── SyncIndicator.tsx    # Sync status UI
```

**Sync States**:
- ✅ Synced (all changes saved)
- 🔄 Syncing... (changes in progress)
- ⚠️ Offline (queued for sync)
- ❌ Sync Error (retry button)

**Success Criteria**:
- Changes sync within 1 second
- Offline changes sync on reconnection
- Conflicts resolved without data loss

---

## Phase 2.3: Authentication (Clerk) (Week 3-4)

**Goal**: Add user authentication for personalized experience and cloud data access.

**Dependency**: Requires Phase 2.2 Convex migration.

### Task 2.3.1: Clerk Setup & Configuration
**Estimated**: 2 hours

**Deliverables**:
- [ ] Create Clerk application
- [ ] Configure authentication methods (email, Google, GitHub)
- [ ] Add Clerk environment variables
- [ ] Install `@clerk/clerk-react`
- [ ] Wrap app in `ClerkProvider`

**Files to Update**:
```
packages/web/
├── src/
│   └── main.tsx           # Add ClerkProvider
├── .env.local             # Add Clerk keys
└── .env.example           # Document env vars
```

**Success Criteria**:
- Clerk dashboard configured
- Provider wraps application
- No build errors

---

### Task 2.3.2: Authentication UI Components
**Estimated**: 4 hours

**Deliverables**:
- [ ] `<SignInButton>` - Trigger sign-in flow
- [ ] `<UserButton>` - User menu (profile, sign out)
- [ ] `<SignInPage>` - Dedicated sign-in route
- [ ] `<SignUpPage>` - Dedicated sign-up route
- [ ] Update Header with auth UI

**Files to Create**:
```
packages/web/src/
├── pages/
│   ├── SignInPage.tsx
│   └── SignUpPage.tsx
├── components/auth/
│   ├── SignInButton.tsx
│   ├── UserButton.tsx
│   └── AuthGuard.tsx
└── App.tsx                # Add auth routes
```

**Design Specifications**:
```
┌────────────────────────────────────────────────┐
│  Header                                         │
│  ┌────────────────────────────────────────────┐│
│  │ Logo          [Theme] [Sign In] [Sign Up]  ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  After sign in:                                 │
│  ┌────────────────────────────────────────────┐│
│  │ Logo          [Theme] [Avatar ▼]           ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  Avatar dropdown:                               │
│  ┌─────────────┐                                │
│  │ Profile     │                                │
│  │ Settings    │                                │
│  │ ─────────── │                                │
│  │ Sign Out    │                                │
│  └─────────────┘                                │
└────────────────────────────────────────────────┘
```

**Success Criteria**:
- Sign in/up flows work
- User menu displays after auth
- Consistent with existing design system

---

### Task 2.3.3: Protected Routes
**Estimated**: 3 hours

**Deliverables**:
- [ ] Create `AuthGuard` component
- [ ] Protect `/results` route (require auth to save)
- [ ] Protect `/settings` route
- [ ] Redirect to sign-in when needed
- [ ] Allow anonymous interview (auth only for saving)

**Files to Update**:
```
packages/web/src/
├── App.tsx                # Protected route wrapper
└── components/auth/
    └── AuthGuard.tsx      # Route protection logic
```

**Route Protection Strategy**:
```
/               - Public (landing)
/setup          - Public (provider selection)
/interview      - Public (allow anonymous)
/results        - Semi-protected (view ok, save requires auth)
/settings       - Protected (require auth)
```

**Success Criteria**:
- Anonymous users can complete interview
- Saving results prompts sign-in
- Settings require authentication

---

### Task 2.3.4: Connect Clerk to Convex
**Estimated**: 3 hours

**Deliverables**:
- [ ] Configure Clerk JWT template for Convex
- [ ] Add userId to Convex session schema
- [ ] Update Convex functions to use auth
- [ ] Implement user-scoped queries
- [ ] Add auth context to Convex client

**Files to Update**:
```
convex/
├── schema.ts              # Add userId field
├── sessions.ts            # User-scoped queries
├── auth.config.ts         # Clerk configuration
└── _generated/
```

**Schema Update**:
```typescript
sessions: defineTable({
  userId: v.optional(v.string()),  // Add user association
  sessionId: v.string(),
  // ... existing fields
})
  .index('by_user', ['userId'])    // Add user index
  .index('by_session_id', ['sessionId'])
```

**Success Criteria**:
- User ID attached to sessions
- Queries return only user's data
- Auth token validated by Convex

---

### Task 2.3.5: User Profile & Preferences
**Estimated**: 4 hours

**Deliverables**:
- [ ] Create users table in Convex
- [ ] Store user preferences (theme, default provider)
- [ ] Sync preferences across devices
- [ ] Profile page with settings

**Files to Create**:
```
convex/
├── users.ts               # User CRUD

packages/web/src/
├── pages/
│   └── ProfilePage.tsx    # User profile
└── components/settings/
    └── UserPreferences.tsx
```

**Success Criteria**:
- Preferences sync across devices
- Theme preference persists
- Default provider remembered

---

## Phase 2.4: Cloud Sync (Week 4)

**Goal**: Enable seamless cross-device session synchronization.

**Dependency**: Requires Phase 2.2 and 2.3.

### Task 2.4.1: Session History UI
**Estimated**: 4 hours

**Deliverables**:
- [ ] `<SessionList>` - List of saved sessions
- [ ] Session cards showing: date, archetype, status
- [ ] Delete session with confirmation
- [ ] Load session (resume or view)
- [ ] Empty state when no sessions

**Files to Create**:
```
packages/web/src/components/sessions/
├── SessionList.tsx
├── SessionCard.tsx
├── DeleteSessionDialog.tsx
└── EmptySessionState.tsx
```

**Design Specifications**:
```
┌────────────────────────────────────────────────┐
│  Your Sessions                                  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 📊 Data Analyst                          │  │
│  │ Started: Jan 1, 2026 • Complete          │  │
│  │ [View] [Resume] [Delete]                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 💻 Code Assistant                        │  │
│  │ Started: Dec 28, 2025 • In Progress (8/15)│  │
│  │ [Resume] [Delete]                        │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [Start New Session]                            │
└────────────────────────────────────────────────┘
```

**Success Criteria**:
- Sessions load from Convex
- Real-time updates when synced
- Delete confirmation prevents accidents

---

### Task 2.4.2: Cross-Device Sync Testing
**Estimated**: 3 hours

**Deliverables**:
- [ ] Test sync between desktop and mobile
- [ ] Test sync during partial interview
- [ ] Test conflict resolution
- [ ] Test offline → online sync
- [ ] Document sync behavior

**Test Scenarios**:
1. Start session on desktop, continue on mobile
2. Start on mobile, finish on desktop
3. Offline answers, sync when online
4. Same session open on two devices (conflict)

**Success Criteria**:
- All test scenarios pass
- No data loss in any scenario
- Conflicts handled gracefully

---

### Task 2.4.3: Sync Status & Indicators
**Estimated**: 2 hours

**Deliverables**:
- [ ] Add sync status to header/footer
- [ ] Show last synced time
- [ ] Manual sync button
- [ ] Network status indicator

**Files to Create**:
```
packages/web/src/components/layout/
└── SyncStatus.tsx
```

**Success Criteria**:
- User knows sync state at all times
- Manual sync available
- Network issues clearly indicated

---

## Phase 2.5: Additional Providers (Week 4-5)

**Goal**: Expand provider support with OpenAI and GLM adapters.

**Dependency**: None (can run in parallel with other phases).

### Task 2.5.1: OpenAI Provider Adapter
**Estimated**: 4 hours

**Deliverables**:
- [ ] Create `openai-adapter.ts`
- [ ] Implement streaming with OpenAI API
- [ ] Support GPT-4, GPT-4o, GPT-3.5 models
- [ ] Handle API key validation
- [ ] Add to provider registry

**Files to Create**:
```
packages/web/src/lib/providers/
├── openai-adapter.ts
└── __tests__/
    └── openai-adapter.test.ts
```

**Provider Configuration**:
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

**Success Criteria**:
- OpenAI API calls work
- Streaming responses render correctly
- Model selection works

---

### Task 2.5.2: GLM Provider Adapter
**Estimated**: 4 hours

**Deliverables**:
- [ ] Create `glm-adapter.ts`
- [ ] Implement GLM-specific authentication
- [ ] Support GLM-4 models
- [ ] Handle API key validation
- [ ] Add to provider registry

**Files to Create**:
```
packages/web/src/lib/providers/
├── glm-adapter.ts
└── __tests__/
    └── glm-adapter.test.ts
```

**Success Criteria**:
- GLM API calls work
- Authentication handled correctly
- Streaming responses work

---

### Task 2.5.3: Provider UI Updates
**Estimated**: 2 hours

**Deliverables**:
- [ ] Add OpenAI and GLM logos
- [ ] Update ProviderSelector with new providers
- [ ] Update model selection dropdowns
- [ ] Test provider switching

**Files to Update**:
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

**Success Criteria**:
- New providers selectable in UI
- Logos display correctly
- Switching providers works smoothly

---

## Phase 2.6: Enhanced Features (Week 5-6)

**Goal**: Add quality-of-life features planned for Stage 2.

**Dependency**: Phase 2.3 (some features require auth).

### Task 2.6.1: Export Formats (PDF, HTML)
**Estimated**: 5 hours

**Deliverables**:
- [ ] PDF export using react-pdf or html2pdf
- [ ] HTML export with inline styles
- [ ] Export format selector in DocumentViewer
- [ ] Styled exports matching theme

**Files to Create**:
```
packages/web/src/lib/export/
├── pdf-export.ts
├── html-export.ts
└── export-utils.ts

packages/web/src/components/export/
└── ExportFormatSelector.tsx
```

**Success Criteria**:
- PDF generates correctly
- HTML renders in any browser
- Styles match application theme

---

### Task 2.6.2: Session Sharing (Public Links)
**Estimated**: 4 hours

**Deliverables**:
- [ ] Generate shareable links for completed sessions
- [ ] Public view page (read-only)
- [ ] Link expiration options
- [ ] Copy link button

**Files to Create**:
```
convex/
└── shares.ts              # Share link management

packages/web/src/
├── pages/
│   └── SharedSessionPage.tsx
└── components/export/
    └── ShareButton.tsx
```

**Success Criteria**:
- Shareable links work
- Shared view is read-only
- Links can expire

---

### Task 2.6.3: Syntax Highlighting Enhancement
**Estimated**: 3 hours

**Deliverables**:
- [ ] Replace current syntax highlighting with Shiki
- [ ] Support for more languages
- [ ] Copy code button on code blocks
- [ ] Theme-aware highlighting

**Files to Update**:
```
packages/web/src/components/document/
└── MarkdownRenderer.tsx
```

**Success Criteria**:
- Syntax highlighting works for common languages
- Copy button on all code blocks
- Colors match light/dark theme

---

### Task 2.6.4: Template Customization UI
**Estimated**: 6 hours

**Deliverables**:
- [ ] Template editor page
- [ ] Edit section content
- [ ] Save custom templates
- [ ] Fork existing templates
- [ ] Preview before saving

**Files to Create**:
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

**Success Criteria**:
- Users can create custom templates
- Custom templates persist to cloud
- Templates usable in document generation

---

### Task 2.6.5: Analytics Dashboard (Basic)
**Estimated**: 4 hours

**Deliverables**:
- [ ] Track sessions started, completed, abandoned
- [ ] Track most popular archetypes
- [ ] Track provider usage
- [ ] Simple dashboard in settings

**Files to Create**:
```
convex/
└── analytics.ts           # Analytics aggregation

packages/web/src/
├── pages/
│   └── AnalyticsPage.tsx
└── components/analytics/
    ├── StatsCard.tsx
    └── UsageChart.tsx
```

**Success Criteria**:
- Basic stats displayed
- Data aggregated correctly
- Privacy-respecting (user's own data only)

---

## Success Metrics

### Phase 2.1: Testing
| Metric | Target |
|--------|--------|
| Unit test coverage | 80%+ overall |
| `lib/interview/` coverage | 90%+ |
| `lib/classification/` coverage | 90%+ |
| `lib/documentation/` coverage | 85%+ |
| `lib/providers/` coverage | 80%+ |
| E2E tests passing | 100% |
| CI build time | < 5 minutes |

### Phase 2.2: Convex Migration
| Metric | Target |
|--------|--------|
| Data migration success rate | 100% |
| Sync latency | < 1 second |
| Offline queue size | Unlimited |
| Conflict resolution | Last-write-wins |

### Phase 2.3: Authentication
| Metric | Target |
|--------|--------|
| Sign-up conversion | Track baseline |
| Sign-in methods | Email, Google, GitHub |
| Session timeout | 30 days |
| Auth errors | < 1% |

### Phase 2.4: Cloud Sync
| Metric | Target |
|--------|--------|
| Cross-device sync time | < 2 seconds |
| Data integrity | 100% |
| Offline support | Full interview flow |

### Phase 2.5: Providers
| Metric | Target |
|--------|--------|
| Total providers | 5 (Anthropic, OpenRouter, MiniMax, OpenAI, GLM) |
| Provider test coverage | 80%+ each |

---

## Rollback Plan

If Stage 2 features cause issues, the following rollback procedures apply:

### Testing (2.1)
- Tests are additive; no rollback needed
- Disable failing tests in CI if blocking

### Convex Migration (2.2)
- Keep Dexie adapter as fallback
- Migration tool includes rollback option
- User data remains in IndexedDB until explicitly deleted

### Authentication (2.3)
- Anonymous mode still works
- Can disable Clerk integration via env var
- Local storage persists for non-auth users

### Cloud Sync (2.4)
- Dexie fallback for local-only mode
- Sync can be disabled in settings

### Providers (2.5)
- New providers are additive
- Original 3 providers unaffected

---

## Dependencies & Prerequisites

### Before Starting Phase 2.1
- [ ] Stage 1 MVP verified working
- [ ] Access to development environment
- [ ] Vitest and Playwright configs reviewed

### Before Starting Phase 2.2
- [ ] Convex account created
- [ ] Convex CLI installed (`bun add -D convex`)
- [ ] Schema reviewed (`convex/schema.ts`)

### Before Starting Phase 2.3
- [ ] Clerk account created
- [ ] OAuth apps configured (Google, GitHub)
- [ ] Clerk JWT template configured for Convex

### Before Starting Phase 2.5
- [ ] OpenAI API key for testing
- [ ] GLM API key for testing

---

## Open Questions

1. **Billing Integration**: Should Stage 2 include basic Stripe integration, or defer to Stage 3?
2. **Team Collaboration**: Multi-user sessions deferred to Stage 3, or include basic sharing in Stage 2?
3. **React 19 Upgrade**: Evaluate ecosystem stability mid-Stage 2, upgrade if safe
4. **i18n**: Multi-language support in Stage 2 or Stage 3?
5. **Performance Budget**: Define bundle size limits for Stage 2 additions

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on business value
3. **Create GitHub issues/milestones** for tracking
4. **Begin Phase 2.1** (Testing Infrastructure)
5. **Set up Convex project** in parallel

---

*This document is a living plan. Update as implementation progresses.*
