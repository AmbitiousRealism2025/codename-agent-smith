# Phased Implementation Plan: Tasks 010-020

**Version**: 1.1  
**Created**: 2026-01-01  
**Updated**: 2026-01-01 (Added Alt Coder delegation strategy)  
**Scope**: CI/CD + Convex Backend Migration + Clerk Authentication  
**Total Estimated Hours**: 38 hours (~1-1.5 weeks)

---

## Context Documents (Progressive Disclosure)

Load these documents **only when starting the relevant phase** to minimize context window usage:

| Phase | Tasks | Load Document | Sections to Read |
|-------|-------|---------------|------------------|
| **A2** (Convex Setup) | 011 | `docs/context/CONVEX_CONTEXT.md` | §1 Project Setup, §7 File Structure |
| **B** (Convex Core) | 012-014 | `docs/context/CONVEX_CONTEXT.md` | §2-5 (Schema, Queries, Mutations, Hooks) |
| **C** (Data & Sync) | 015-016 | `docs/context/CONVEX_CONTEXT.md` | §6 Index Best Practices, §9 Migration |
| **D** (Clerk Setup) | 017 | `docs/context/CLERK_CONVEX_CONTEXT.md` | §1-2 (Dashboard Setup, Provider Setup) |
| **E** (Auth Features) | 018-020 | `docs/context/CLERK_CONVEX_CONTEXT.md` | §3-6 (UI, Hooks, Server Auth, Routes) |

**Strategy**: Don't load context docs at session start. Load the specific document when entering each phase.

---

## Executive Summary

Tasks 010-020 span three major capabilities:

| Area | Tasks | Hours | Description |
|------|-------|-------|-------------|
| CI/CD | 010 | 3h | GitHub Actions for automated testing |
| Convex Backend | 011-016 | 23h | Cloud database, storage abstraction, real-time sync |
| Authentication | 017-020 | 12h | Clerk integration with protected routes |

**Critical Path**: 011 → 012 → 013 → 014 → (015 \| 016) → 020

---

## Delegation Strategy: Alt Coder

Use **Alt Coder** for smaller/medium tasks that follow established patterns or documentation.

### Alt Coder Eligible Tasks

| Task | ID | Hours | Rationale |
|------|-----|-------|-----------|
| CI/CD Test Integration | 010 | 3h | Follows GitHub Actions patterns, well-documented |
| Convex Project Setup | 011 | 2h | Follows official Convex setup docs |
| Clerk Setup & Configuration | 017 | 2h | Follows official Clerk docs |
| Protected Routes | 019 | 3h | Pattern-based, well-defined behavior |

**Total Alt Coder Hours**: 10h (26% of total)

### Main Agent Tasks (Require Orchestration/Complexity)

| Task | ID | Hours | Rationale |
|------|-----|-------|-----------|
| Convex CRUD Functions | 012 | 6h | Defines data layer, schema decisions |
| Storage Adapter Abstraction | 013 | 4h | Architecture, abstraction design |
| Migrate Zustand Stores | 014 | 4h | Core state management changes |
| Data Migration Tool | 015 | 3h | Rollback logic, data integrity |
| Real-Time Sync | 016 | 4h | Complex real-time logic, conflict resolution |
| Authentication UI | 018 | 4h | Design system integration, UX decisions |
| Connect Clerk to Convex | 020 | 3h | Two-system integration, security |

**Total Main Agent Hours**: 28h (74% of total)

---

## Dependency Graph

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                                                         │
  PHASE A           │    ┌──────────┐                    ┌──────────┐        │
  (Parallel)        │    │ Task 010 │                    │ Task 011 │◄───────┼───┐
                    │    │ CI/CD    │                    │ Convex   │        │   │
                    │    └──────────┘                    │ Setup    │        │   │
                    │                                    └────┬─────┘        │   │
                    └─────────────────────────────────────────┼──────────────┘   │
                                                              │                   │
  PHASE B                                                     ▼                   │
  (Sequential)                                         ┌──────────┐              │
                                                       │ Task 012 │              │
                                                       │ CRUD Fns │              │
                                                       └────┬─────┘              │
                                                            │                     │
                                                            ▼                     │
                                                     ┌──────────┐                │
                                                     │ Task 013 │                │
                                                     │ Adapter  │                │
                                                     └────┬─────┘                │
                                                          │                       │
                                                          ▼                       │
                                                   ┌──────────┐                  │
                                                   │ Task 014 │                  │
                                                   │ Zustand  │                  │
                                                   └────┬─────┘                  │
                                                        │                         │
                              ┌──────────────────┬──────┘                         │
                              │                  │                                │
  PHASE C                     ▼                  ▼                                │
  (Parallel)           ┌──────────┐       ┌──────────┐                           │
                       │ Task 015 │       │ Task 016 │                           │
                       │ Migration│       │ Realtime │                           │
                       └──────────┘       └──────────┘                           │
                                                                                  │
  PHASE D                                                                         │
  (After 011)                                    ┌──────────┐                     │
                                                 │ Task 017 │◄────────────────────┘
                                                 │ Clerk    │
                                                 └────┬─────┘
                                                      │
  PHASE E                                             │
  (Sequential)                                        ▼
                               ┌───────────────┬──────────┐
                               │               │          │
                               ▼               │          ▼
                        ┌──────────┐          │    ┌──────────┐
                        │ Task 018 │          │    │ Task 020 │
                        │ Auth UI  │          │    │ Clerk+   │
                        └────┬─────┘          │    │ Convex   │
                             │                │    └──────────┘
                             ▼                │
                      ┌──────────┐           │
                      │ Task 019 │◄──────────┘
                      │ Routes   │
                      └──────────┘
```

---

## Phase A: Foundation Setup (Days 1-2)

> **Goal**: Establish CI/CD and Convex project infrastructure in parallel.

### Track A1: CI/CD Integration (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| CI/CD Test Integration | 010 | 3h | **Alt Coder** | `.github/workflows/test.yml`, `e2e.yml`, `coverage.yml` |

**Prerequisites**: Tasks 2.1.1-2.1.9 (all testing tasks) completed

**Alt Coder Prompt**:
```
TASK: Create GitHub Actions workflows for automated testing.

EXPECTED OUTCOME:
- .github/workflows/test.yml - Unit tests on every PR
- .github/workflows/e2e.yml - E2E tests on main branch merges
- .github/workflows/coverage.yml - Coverage reporting

REQUIRED SKILLS: None

REQUIRED TOOLS: Read, Write, Glob, Bash

MUST DO:
- Use Bun 1.2.17+ as package manager
- Build command: bun run build
- Test command: bun run test
- E2E command: bun run test:e2e
- Cache bun dependencies for speed
- Target total CI build time < 5 minutes
- Add coverage badge to README (optional)
- Use ubuntu-latest runner

MUST NOT DO:
- Do not use npm or yarn
- Do not add complex matrix builds
- Do not install unnecessary dependencies

CONTEXT:
- Package location: packages/web/
- Existing package.json: packages/web/package.json
- Vitest config: packages/web/vitest.config.ts
- Playwright config: packages/web/playwright.config.ts (if exists)
```

### Track A2: Convex Project Setup (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Convex Project Setup | 011 | 2h | **Alt Coder** | `lib/convex/client.ts`, ConvexProvider in main.tsx |

**Prerequisites**: None (can start immediately)

**Alt Coder Prompt**:
```
TASK: Set up Convex project and integrate with React app.

EXPECTED OUTCOME:
- Convex client configured in packages/web/src/lib/convex/client.ts
- ConvexProvider wrapping app in main.tsx
- Environment variables documented

REQUIRED SKILLS: None

REQUIRED TOOLS: Read, Write, Edit, Bash

CONTEXT DOCUMENTS (Read First):
- docs/context/CONVEX_CONTEXT.md §1 (Project Setup)
- docs/context/CONVEX_CONTEXT.md §7 (File Structure)

MUST DO:
- Read the context document sections above FIRST
- Run: bun add convex
- Create client.ts following the pattern in §1
- Add ConvexProvider to main.tsx (wrap existing providers)
- Add VITE_CONVEX_URL to .env.example with placeholder
- Test real-time connection works in dev
- Follow existing schema in convex/schema.ts

MUST NOT DO:
- Do not modify convex/schema.ts
- Do not run bunx convex deploy (only dev mode)
- Do not add authentication yet (separate task)

CONTEXT:
- Existing schema: convex/schema.ts
- App entry: packages/web/src/main.tsx
```

**Verification Checkpoint**:
- [ ] `bun run test` passes in CI
- [ ] Convex dashboard accessible
- [ ] Real-time updates visible in dev console

---

## Phase B: Convex Backend Core (Days 2-4)

> **Goal**: Implement full CRUD functionality and storage abstraction.

**Start Condition**: Task 011 complete

### Step 1: CRUD Functions (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Convex CRUD Functions | 012 | 6h | **Main** | `convex/sessions.ts`, `responses.ts`, `documents.ts` |

**Context Documents**: `docs/context/CONVEX_CONTEXT.md` §2-4 (Schema, Queries, Mutations)

**Key Actions**:
1. Implement session CRUD: create, get, update, remove, listRecent
2. Implement response CRUD: record, getBySession, updateResponse
3. Implement document CRUD: save, getBySession
4. Add proper indexes per existing schema (see §6 Index Best Practices)
5. Test via Convex dashboard

### Step 2: Storage Adapter (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Storage Adapter Abstraction | 013 | 4h | **Main** | `adapter.ts`, `dexie-adapter.ts`, `convex-adapter.ts`, `adapter-factory.ts` |

**Key Actions**:
1. Define `StorageAdapter` interface with full CRUD signature
2. Implement `DexieAdapter` wrapping existing IndexedDB logic
3. Implement `ConvexAdapter` using Task 012 functions
4. Create factory that selects adapter based on auth state
5. Add `offline-queue.ts` for queuing mutations when offline

### Step 3: Zustand Migration (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Migrate Zustand Stores | 014 | 4h | **Main** | Updated `advisor-store.ts`, `provider-store.ts`, new `sync-store.ts` |

**Key Actions**:
1. Replace direct Dexie calls in `advisor-store.ts` with adapter methods
2. Update `provider-store.ts` for API key storage via adapter
3. Create `sync-store.ts` for managing sync state
4. Add async action wrappers with loading states
5. Handle adapter switching when user authenticates (local → cloud)

**Verification Checkpoint**:
- [ ] All CRUD operations work via Convex dashboard
- [ ] App works with both Dexie and Convex adapters
- [ ] State changes persist correctly to selected adapter

---

## Phase C: Data & Sync Features (Days 4-5)

> **Goal**: Enable data migration and real-time synchronization.

**Start Condition**: Task 014 complete  
**Parallelization**: Tasks 015 and 016 can run simultaneously

### Track C1: Migration Tool (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Data Migration Tool | 015 | 3h | **Main** | `migration.ts`, `migration-ui.tsx` |

**Key Actions**:
1. Create migration script to copy IndexedDB → Convex
2. Add "Migrate to Cloud" button in settings
3. Implement progress indicator during migration
4. Add rollback capability if migration fails
5. Verification step to confirm no data loss

**Migration Flow**:
```
User logs in → Detect local data → Prompt migration →
Show progress → Verify complete → Option to clear local
```

### Track C2: Real-Time Sync (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Real-Time Sync | 016 | 4h | **Main** | `realtime-sync.ts`, `conflict-resolver.ts`, `SyncIndicator.tsx` |

**Key Actions**:
1. Subscribe to Convex real-time updates via `useQuery`
2. Implement last-write-wins conflict resolution
3. Create `SyncIndicator` component for UI feedback
4. Handle reconnection after network loss
5. Batch multiple rapid changes before sync

**Sync States**:
- ✅ Synced (all changes saved)
- 🔄 Syncing... (changes in progress)
- ⚠️ Offline (queued for sync)
- ❌ Sync Error (retry button)

**Verification Checkpoint**:
- [ ] Existing IndexedDB data migrates successfully
- [ ] Changes sync within 1 second
- [ ] Offline changes queue and sync on reconnection
- [ ] Conflicts resolved without data loss

---

## Phase D: Authentication Setup (Days 3-4)

> **Goal**: Integrate Clerk authentication.

**Start Condition**: Task 011 complete  
**Parallelization**: Can run in parallel with Phase B/C

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Clerk Setup & Configuration | 017 | 2h | **Alt Coder** | ClerkProvider in main.tsx, environment variables |

**Prerequisites**: Clerk account created with OAuth apps configured

**Alt Coder Prompt**:
```
TASK: Set up Clerk authentication and integrate with React app.

EXPECTED OUTCOME:
- @clerk/clerk-react installed
- ClerkProvider wrapping app in main.tsx
- Environment variables documented

REQUIRED SKILLS: None

REQUIRED TOOLS: Read, Write, Edit, Bash

CONTEXT DOCUMENTS (Read First):
- docs/context/CLERK_CONVEX_CONTEXT.md §1 (Clerk Dashboard Setup)
- docs/context/CLERK_CONVEX_CONTEXT.md §2 (React Provider Setup)

MUST DO:
- Read the context document sections above FIRST
- Run: bun add @clerk/clerk-react
- Add ClerkProvider to main.tsx following the pattern in §2
- Add VITE_CLERK_PUBLISHABLE_KEY to .env.example
- Verify no TypeScript errors after integration

MUST NOT DO:
- Do not create sign-in/sign-up pages yet (separate task)
- Do not add protected routes yet (separate task)
- Do not configure Clerk dashboard (manual step)
- Do not add ConvexProviderWithClerk yet (Task 020)

CONTEXT:
- App entry: packages/web/src/main.tsx
- Existing providers may include: ConvexProvider, ThemeProvider
```

---

## Phase E: Authentication Features (Days 5-6)

> **Goal**: Build authentication UI and integrate with Convex.

**Start Condition**: Task 017 complete

### Step 1: Authentication UI (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Authentication UI Components | 018 | 4h | **Main** | `SignInPage.tsx`, `SignUpPage.tsx`, auth components |

**Key Actions**:
1. Create `SignInButton.tsx` and `UserButton.tsx`
2. Create dedicated `/sign-in` and `/sign-up` routes
3. Update Header with auth UI (Sign In/Up or Avatar dropdown)
4. Style using Catppuccin palette + shadcn patterns
5. Ensure consistent typography (Satoshi/General Sans)

### Step 2: Protected Routes (Alt Coder)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Protected Routes | 019 | 3h | **Alt Coder** | `AuthGuard.tsx`, updated App.tsx |

**Route Protection Strategy**:
| Route | Protection |
|-------|------------|
| `/` | Public |
| `/setup` | Public |
| `/interview` | Public (anonymous allowed) |
| `/results` | Semi-protected (view OK, save requires auth) |
| `/settings` | Protected |

**Alt Coder Prompt**:
```
TASK: Implement protected routes using Clerk authentication.

EXPECTED OUTCOME:
- AuthGuard.tsx component in packages/web/src/components/auth/
- App.tsx updated with protected route wrappers

REQUIRED SKILLS: None

REQUIRED TOOLS: Read, Write, Edit, Glob

CONTEXT DOCUMENTS (Read First):
- docs/context/CLERK_CONVEX_CONTEXT.md §4 (Client-Side Auth Hooks)
- docs/context/CLERK_CONVEX_CONTEXT.md §6 (Protected Routes Pattern)

MUST DO:
- Read the context document sections above FIRST
- Read App.tsx to understand current routing structure
- Create AuthGuard component following the pattern in §6
- Use useConvexAuth() hook (not useUser) per §4
- Protect /settings route (redirect to sign-in if not authenticated)
- Keep /interview public (anonymous allowed)
- Make /results semi-protected (view OK, save requires auth)
- Redirect to sign-in with return URL preserved

MUST NOT DO:
- Do not modify sign-in/sign-up pages (separate task)
- Do not change the interview flow logic
- Do not add loading spinners (use the pattern from context doc)

CONTEXT:
- App.tsx: packages/web/src/App.tsx
- Existing route structure in App.tsx

ROUTE PROTECTION MATRIX:
- / → Public
- /setup → Public  
- /interview → Public (anonymous)
- /results → Semi-protected (view=public, save=auth required)
- /settings → Protected (require auth)
```

### Step 3: Clerk + Convex Integration (Main Agent)

| Task | ID | Hours | Agent | Deliverables |
|------|----|-------|-------|--------------|
| Connect Clerk to Convex | 020 | 3h | **Main** | Updated schema, auth.config.ts, user-scoped queries |

**Context Documents**: 
- `docs/context/CLERK_CONVEX_CONTEXT.md` §1 (JWT Template Setup)
- `docs/context/CLERK_CONVEX_CONTEXT.md` §5 (Server-Side Auth)
- `docs/context/CLERK_CONVEX_CONTEXT.md` §8 (Schema with User References)

**Key Actions**:
1. Configure Clerk JWT template for Convex in Clerk dashboard (§1)
2. Add `userId` field to sessions schema (see §8 pattern)
3. Add `by_user` index for efficient user-scoped queries
4. Update Convex functions to use `ctx.auth.getUserIdentity()` (§5)
5. Ensure queries return only authenticated user's data

**Schema Update**:
```typescript
sessions: defineTable({
  userId: v.optional(v.string()),  // NEW
  sessionId: v.string(),
  // ... existing fields
})
  .index('by_user', ['userId'])      // NEW
  .index('by_session_id', ['sessionId'])
```

**Verification Checkpoint**:
- [ ] Sign in/up flows work correctly
- [ ] User menu displays after authentication
- [ ] Anonymous interview completion works
- [ ] Saving results prompts sign-in
- [ ] User ID attached to sessions
- [ ] Queries return only user's own data

---

---

## Alt Coder Delegation Summary

| Task | Alt Coder Prompt Location | Review Priority |
|------|---------------------------|-----------------|
| 010 - CI/CD | Track A1 above | Medium (verify workflow runs) |
| 011 - Convex Setup | Track A2 above | Medium (verify connection) |
| 017 - Clerk Setup | Phase D above | Medium (verify provider works) |
| 019 - Protected Routes | Step 2 (Phase E) above | High (auth security) |

### Post-Delegation Verification Checklist

For each Alt Coder task, verify:
- [ ] Code follows existing patterns
- [ ] No new anti-patterns introduced
- [ ] `bun run typecheck` passes
- [ ] Manual smoke test in dev
- [ ] Security-sensitive code reviewed (especially Task 019)

---

## Implementation Schedule

| Day | Tasks | Agents | Focus |
|-----|-------|--------|-------|
| **Day 1** | 010, 011 (parallel) | Alt + Alt | CI/CD + Convex setup |
| **Day 2** | 012, 017 (parallel) | Main + Alt | Convex CRUD + Clerk setup |
| **Day 3** | 013, 018 | Main + Main | Storage adapter + Auth UI |
| **Day 4** | 014, 019 (parallel) | Main + Alt | Zustand migration + Routes |
| **Day 5** | 015, 016 (parallel) | Main + Main | Migration + Sync |
| **Day 6** | 020, integration testing | Main | Clerk-Convex connection |

### Parallel Execution Map

```
Day 1:
├── Alt Coder 1: Task 010 (CI/CD)
└── Alt Coder 2: Task 011 (Convex Setup)

Day 2:
├── Main Agent: Task 012 (CRUD Functions)
└── Alt Coder: Task 017 (Clerk Setup)

Day 3:
├── Main Agent: Task 013 (Storage Adapter)
└── Main Agent: Task 018 (Auth UI) [if capacity]

Day 4:
├── Main Agent: Task 014 (Zustand)
└── Alt Coder: Task 019 (Protected Routes)

Day 5:
├── Main Agent: Task 015 (Migration)
└── Main Agent: Task 016 (Real-Time Sync)

Day 6:
└── Main Agent: Task 020 (Clerk-Convex Integration)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Convex connection issues | Keep Dexie adapter as fallback |
| Clerk OAuth config complexity | Document setup steps, test early |
| Migration data loss | Implement rollback, verify before clearing local |
| CI build timeout | Optimize test parallelization, cache dependencies |
| Real-time sync conflicts | Last-write-wins is simple, document behavior |

---

## Rollback Procedures

### If Convex fails:
1. `adapter-factory.ts` defaults to Dexie adapter
2. User data remains in IndexedDB
3. No cloud features, but app works

### If Clerk fails:
1. Set `VITE_CLERK_PUBLISHABLE_KEY=""` to disable
2. Anonymous mode continues working
3. No auth-gated features available

### If Migration fails:
1. Rollback button restores from backup
2. Original IndexedDB data preserved
3. User can retry migration later

---

## Success Criteria

### Phase A Complete When:
- [ ] GitHub Actions runs tests on PR
- [ ] Coverage report visible in PR comments
- [ ] Convex dashboard shows project
- [ ] Real-time connection verified

### Phase B Complete When:
- [ ] All CRUD operations work via Convex
- [ ] Both storage adapters pass same test suite
- [ ] Zustand stores persist via adapter

### Phase C Complete When:
- [ ] IndexedDB → Convex migration works
- [ ] Sync latency < 1 second
- [ ] Offline queue functions correctly

### Phase D/E Complete When:
- [ ] Sign in/up flows work
- [ ] Protected routes enforce auth
- [ ] User sessions scoped to authenticated user
- [ ] Row-level security enforced by Convex

---

## Post-Implementation Verification

Run this checklist after all tasks complete:

```bash
# 1. Test CI/CD
# Push a test PR and verify workflows run

# 2. Test Convex
bunx convex dashboard  # Verify data visible

# 3. Test Auth Flow
# - Sign up new user
# - Complete interview
# - Save results
# - Sign out
# - Sign in different device
# - Verify session synced

# 4. Test Offline
# - Disconnect network
# - Complete interview
# - Reconnect
# - Verify sync
```

---

*This plan is designed for sequential execution with parallelization where dependencies allow. Adjust based on team capacity and blockers encountered.*
