# Agent Advisor PWA - Session Handoff Document

**Last Updated**: 2026-01-01  
**Status**: Stage 2 In Progress (Tasks 010-027 Complete)

---

## Project Location
`/Users/ambrealismwork/Desktop/Coding-Projects/codename-agent-smith`

## Current Branch
`oc-dev` - ahead of main (not pushed)

---

## Stage 2 Progress

### Completed

| Task | Description | Status |
|------|-------------|--------|
| Mini-task | Agent Smith logo on landing page | ✅ |
| 010 | CI/CD GitHub Actions workflow | ✅ |
| 011 | Convex project setup + provider | ✅ |
| 012 | Convex CRUD functions (sessions, responses, documents) | ✅ |
| 013 | Storage adapter abstraction (Dexie + Convex adapters) | ✅ |
| 014 | Migrate Zustand stores to StorageAdapter | ✅ |
| 015 | Data migration tool (IndexedDB → Convex) | ✅ |
| 016 | Real-time sync with SyncIndicator | ✅ |
| 017 | Clerk setup with ClerkProvider | ✅ |
| 018 | Auth UI (SignInPage, SignUpPage, Header auth) | ✅ |
| 019 | Protected routes (AuthGuard, SaveToCloudButton) | ✅ |
| 020 | Connect Clerk to Convex (ConvexProviderWithClerk) | ✅ |
| 021 | User Profile & Preferences | ✅ |
| 022 | Session History UI | ✅ |
| 023 | Cross-Device Sync Testing | ⏭️ Manual testing |
| 024 | Sync Status & Indicators | ✅ |
| 025 | OpenAI Provider Adapter | ✅ |
| 026 | GLM Provider Adapter | ✅ |
| 027 | Provider Registry Update | ✅ |

### Next Up
- **Task 023**: Cross-Device Sync Testing (manual testing required)
- **Tasks 028-032**: E2E tests, interview enhancements, export improvements

---

## Key Files Created/Modified

```
.github/workflows/test.yml           # CI workflow

convex/
├── auth.config.ts                   # Clerk issuer config
├── schema.ts                        # Sessions + Users tables
├── sessions.ts                      # Session CRUD + user-scoped queries
├── responses.ts                     # Response CRUD
├── documents.ts                     # Document CRUD
├── users.ts                         # User profile + preferences

packages/web/src/
├── main.tsx                         # ClerkProvider + ConvexProviderWithClerk
├── App.tsx                          # Routes including /profile, /sign-in, /sign-up
├── hooks/
│   └── useNetworkStatus.ts          # Online/offline detection hook
├── lib/
│   ├── convex/client.ts             # Convex client
│   ├── providers/
│   │   ├── types.ts                 # ProviderId now includes openai, glm
│   │   ├── registry.ts              # All 5 providers registered
│   │   ├── openai-adapter.ts        # OpenAI adapter (GPT-4o, o1, etc)
│   │   └── glm-adapter.ts           # GLM/Zhipu adapter (GLM-4 models)
│   └── storage/
│       ├── types.ts                 # StorageAdapter interface
│       ├── db.ts                    # Uses ProviderId type
│       ├── dexie-adapter.ts         # Local storage
│       ├── convex-adapter.ts        # Cloud storage
│       ├── adapter-factory.ts       # Adapter switching
│       ├── migration.ts             # Data migration logic
│       ├── MigrationDialog.tsx      # Migration UI
│       ├── realtime-sync.ts         # Real-time sync hook
│       └── conflict-resolver.ts     # Last-write-wins
├── stores/
│   ├── advisor-store.ts             # Uses StorageAdapter
│   └── sync-store.ts                # Sync state + network awareness
├── pages/
│   ├── SignInPage.tsx               # Clerk SignIn
│   ├── SignUpPage.tsx               # Clerk SignUp
│   └── ProfilePage.tsx              # User profile
├── components/
│   ├── auth/
│   │   ├── AuthGuard.tsx            # Protected route wrapper
│   │   └── SaveToCloudButton.tsx    # Sign-in prompt for saving
│   ├── layout/
│   │   ├── Header.tsx               # Auth buttons, profile link
│   │   └── SyncIndicator.tsx        # Enhanced with network + manual sync
│   ├── sessions/
│   │   ├── SessionCard.tsx          # Session display card
│   │   ├── SessionList.tsx          # Real-time session list
│   │   ├── DeleteSessionDialog.tsx  # Delete confirmation
│   │   ├── EmptySessionState.tsx    # Empty state
│   │   └── index.ts                 # Barrel export
│   └── settings/
│       └── UserPreferences.tsx      # Theme + provider prefs
```

---

## Environment Setup

1. **Convex dev server** (run from repo root):
   ```bash
   bunx convex dev
   ```

2. **Environment file** at `packages/web/.env.local`:
   ```
   VITE_CONVEX_URL=https://standing-hamster-34.convex.cloud
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Dashboards**:
   - Convex: https://dashboard.convex.dev/d/standing-hamster-34
   - Clerk: https://dashboard.clerk.com (heroic-cricket-38)

---

## Commands

```bash
cd packages/web

bun install          # Install dependencies
bun run typecheck    # Verify TypeScript
bun run dev          # Start dev server (localhost:5173)
bun run build        # Production build with PWA

# From repo root
bunx convex dev      # Start Convex dev server
npx convex dev --once # Deploy Convex functions once
```

---

## Phase Plans

- `docs/stage-2-docs/PHASE_PLAN_TASKS_010-020.md` - CI/CD, Convex, Clerk (COMPLETE)
- `docs/stage-2-docs/PHASE_PLAN_TASKS_021-032.md` - Profile, Sync, Providers, Features

## Context Documents

- `docs/context/CONVEX_CONTEXT.md` - Convex patterns and examples
- `docs/context/CLERK_CONVEX_CONTEXT.md` - Clerk + Convex auth integration

---

## Continuation Prompt

```
Continue Stage 2 of Agent Advisor PWA.

LOCATION: /Users/ambrealismwork/Desktop/Coding-Projects/codename-agent-smith
BRANCH: oc-dev
BUILD: TypeScript passes, Convex deployed

COMPLETED (Tasks 010-027):
- CI/CD workflow (.github/workflows/test.yml)
- Convex setup (ConvexProvider in main.tsx)
- Convex CRUD (sessions, responses, documents, users)
- Storage adapter abstraction (dexie-adapter, convex-adapter)
- Zustand store migration to StorageAdapter
- Data migration tool (MigrationDialog)
- Real-time sync (SyncIndicator)
- Clerk auth (ClerkProvider, SignIn/SignUp pages)
- Protected routes (AuthGuard, SaveToCloudButton)
- Clerk-Convex connection (ConvexProviderWithClerk)
- User Profile & Preferences (ProfilePage, UserPreferences)
- Session History UI (SessionCard, SessionList, DeleteSessionDialog)
- Sync Status & Indicators (useNetworkStatus, enhanced SyncIndicator)
- OpenAI Provider Adapter (openai-adapter.ts - GPT-4o, o1 models)
- GLM Provider Adapter (glm-adapter.ts - GLM-4 models)
- Provider Registry Update (5 total: Anthropic, OpenRouter, MiniMax, OpenAI, GLM)

SKIPPED:
- Task 023: Cross-Device Sync Testing (requires manual testing)

NEXT (Phase I - Testing & Enhancements):
- Task 028: E2E Testing
- Task 029: Interview Enhancements
- Task 030: Export Improvements
- Task 031: Documentation
- Task 032: Final Polish

CONVEX:
- Dashboard: https://dashboard.convex.dev/d/standing-hamster-34
- Clerk issuer: https://heroic-cricket-38.clerk.accounts.dev

PHASE PLANS:
- docs/stage-2-docs/PHASE_PLAN_TASKS_021-032.md
```
