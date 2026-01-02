# AGENT ADVISOR PWA - PROJECT KNOWLEDGE BASE

**Updated:** 2026-01-02  
**Version:** v1.1.0  
**Branch:** oc-dev  
**PR:** [#8](https://github.com/AmbitiousRealism2025/codename-agent-smith/pull/8)  
**Status:** Stage 2 Complete

---

## OVERVIEW

Progressive Web App guiding developers through AI agent configuration. 15-question interview → classification into 5 agent archetypes → planning document generation. Supports local-first (IndexedDB) and cloud sync (Convex + Clerk auth).

---

## STRUCTURE

```
./
├── convex/                      # Convex backend (serverless)
│   ├── schema.ts                # Database tables (6 tables)
│   ├── auth.config.ts           # Clerk issuer configuration
│   ├── sessions.ts              # Session CRUD + user-scoped queries
│   ├── responses.ts             # Interview response storage
│   ├── documents.ts             # Generated document storage
│   ├── users.ts                 # User profile + preferences
│   ├── shares.ts                # Session sharing (public links)
│   ├── templates.ts             # Custom template storage
│   └── analytics.ts             # User statistics aggregation
│
├── packages/web/                # React PWA application
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/       # AnalyticsPage, StatsCard, UsageChart
│   │   │   ├── auth/            # AuthGuard, SaveToCloudButton
│   │   │   ├── interview/       # QuestionCard, ProgressIndicator, StageIndicator
│   │   │   ├── layout/          # MainLayout, Sidebar, Header, BottomNav, SyncIndicator
│   │   │   ├── pages/           # LandingPage, AdvisorPage, TemplatesPage, SettingsPage
│   │   │   ├── providers/       # ProviderSelector, AdapterSwitcher
│   │   │   ├── sessions/        # SessionCard, SessionList, DeleteSessionDialog
│   │   │   ├── settings/        # UserPreferences
│   │   │   ├── templates/       # TemplateEditor, SectionEditor
│   │   │   ├── export/          # DocumentExport, ShareDialog
│   │   │   └── ui/              # shadcn components + ThemeToggle
│   │   ├── hooks/               # useNetworkStatus
│   │   ├── lib/
│   │   │   ├── interview/       # questions.ts (15 questions, 4 stages)
│   │   │   ├── classification/  # classifier.ts (weighted scoring)
│   │   │   ├── documentation/   # document-generator.ts (markdown output)
│   │   │   ├── providers/       # 5 provider adapters + registry
│   │   │   ├── convex/          # Convex client setup
│   │   │   ├── export/          # PDF/HTML export utilities
│   │   │   └── storage/         # Dexie + Convex adapters, migration, sync
│   │   ├── pages/               # SetupPage, InterviewPage, ResultsPage, ProfilePage, SignInPage, SignUpPage, SharedSessionPage, TemplateEditorPage
│   │   ├── stores/              # Zustand (advisor-store, ui-store, provider-store, sync-store)
│   │   ├── templates/           # 5 agent archetype templates + sections
│   │   ├── styles/              # globals.css (Catppuccin theme tokens)
│   │   └── types/               # TypeScript interfaces
│   ├── e2e/                     # Playwright E2E tests (8 spec files)
│   ├── public/icons/            # PWA icons (192, 512, maskable)
│   ├── vite.config.ts           # Vite + PWA + service worker
│   └── tailwind.config.ts       # Catppuccin colors, Satoshi fonts
├── docs/                        # Planning documentation
│   └── stage-2-docs/            # Stage 2 task documentation
├── AGENTS.md                    # This file
├── HANDOFF.md                   # Session continuation context
└── README.md                    # Project overview
```

---

## KEY FILES

| Task | Location |
|------|----------|
| Interview questions | `src/lib/interview/questions.ts` |
| Classification logic | `src/lib/classification/classifier.ts` |
| Document generation | `src/lib/documentation/document-generator.ts` |
| Agent templates | `src/templates/` |
| Theme colors | `src/styles/globals.css` |
| State management | `src/stores/advisor-store.ts` |
| Local storage | `src/lib/storage/db.ts` (Dexie) |
| Cloud storage | `src/lib/storage/convex-adapter.ts` |
| Sync management | `src/stores/sync-store.ts` |
| Auth guard | `src/components/auth/AuthGuard.tsx` |
| PWA config | `vite.config.ts` |

---

## CONVENTIONS

### Design System (Locked)
- **Theme:** Catppuccin (customized)
  - Light: Warm blush background `hsl(10, 57%, 88%)`, Peach primary `#fe640b`
  - Dark: Frappé Mantle `hsl(231, 19%, 20%)`, Teal primary `#94e2d5`
- **Typography:** Satoshi (display) + General Sans (body)
- **Reference:** https://catppuccin.com/palette/

### Tech Stack
- **Runtime:** Bun (not npm/yarn)
- **Framework:** React 18.3 + TypeScript
- **Build:** Vite 6 + vite-plugin-pwa
- **Styling:** TailwindCSS v3 + shadcn/ui
- **State:** Zustand with persist middleware
- **Local Storage:** IndexedDB via Dexie.js
- **Cloud Storage:** Convex (serverless backend)
- **Auth:** Clerk (with Convex integration)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **A11y:** axe-core (dev mode automated testing)

### Patterns
- 15-question interview (4 stages: discovery → requirements → architecture → output)
- 5 agent archetypes: Solo Coder, Pair Programmer, Dev Team, Autonomous Squad, Human-in-the-Loop
- Weighted classification with confidence scoring
- Client-side document generation (no API required for core flow)
- Provider abstraction layer for API calls
- Storage adapter pattern (Dexie ↔ Convex)
- Real-time sync with optimistic updates

### Accessibility
- Skip-to-content links on all standalone pages
- ARIA labels on icon-only buttons
- Focus-visible ring states
- Keyboard-navigable cards (role="radio", tabIndex, key handlers)
- WCAG AA contrast compliance (6.29:1 on buttons)

---

## ANTI-PATTERNS

| Never | Why |
|-------|-----|
| Use Inter/Roboto fonts | Use Satoshi/General Sans per design system |
| White or gray backgrounds | Use Catppuccin Warm Blush (light) or Frappé Mantle (dark) |
| Purple gradients | Overused AI aesthetic—use Peach/Teal accents |
| npm/yarn commands | Use Bun exclusively |
| Direct localStorage for state | Use Zustand persist → IndexedDB |
| Hardcoded colors | Use CSS custom properties from globals.css |
| White text on Peach buttons | Use dark text (#11111b) for WCAG compliance |

---

## COMMANDS

```bash
cd packages/web

# Development
bun install              # Install dependencies
bun run dev              # Vite dev server (localhost:5173)
bun run typecheck        # TypeScript validation

# Build
bun run build            # Production build with PWA
bun run preview          # Preview production build

# Testing
bun run test             # Vitest unit tests
bun run test:e2e         # Playwright E2E tests

# Convex (from repo root)
bunx convex dev          # Start Convex dev server
npx convex dev --once    # Deploy Convex functions once
```

---

## USER FLOW

```
/ (Landing)
  └─→ "Get Started"
       └─→ /setup (Provider selection - skippable)
            └─→ /interview (15 questions across 4 stages)
                 └─→ /results (Classification + Document export)
```

**Post-interview navigation:**
- /advisor - Main dashboard + session history
- /templates - Browse agent archetypes
- /settings - Manage API providers + cloud sync
- /profile - User profile + preferences (authenticated)

---

## PROVIDERS

| Provider | Models | Status |
|----------|--------|--------|
| Anthropic | Claude Sonnet 4, Claude 3.5 Sonnet/Haiku, Claude 3 Opus | ✅ |
| OpenRouter | Multi-model gateway | ✅ |
| MiniMax | ABAB models | ✅ |
| OpenAI | GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo, o1-preview, o1-mini | ✅ |
| GLM | GLM-4-plus, GLM-4, GLM-4-air, GLM-4-flash, GLM-4-long | ✅ |

---

## CLOUD INFRASTRUCTURE

### Convex
- **Dashboard:** https://dashboard.convex.dev
- **Tables:** sessions, responses, documents, users, shares, templates
- **Auth:** Clerk JWT verification via `auth.config.ts`

### Clerk
- **Dashboard:** https://dashboard.clerk.com
- **Components:** ClerkProvider, SignIn, SignUp, UserButton
- **Integration:** ConvexProviderWithClerk in main.tsx

---

## ROUTES

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/` | LandingPage | Public | Landing page |
| `/setup` | SetupPage | Public | Provider selection (skippable) |
| `/interview` | InterviewPage | Public | 15-question interview |
| `/results` | ResultsPage | Public | Classification + document |
| `/advisor` | AdvisorPage | Public | Dashboard + session history |
| `/templates` | TemplatesPage | Public | Browse agent archetypes |
| `/templates/edit/:id` | TemplateEditorPage | Protected | Template editor |
| `/settings` | SettingsPage | Protected | API keys, cloud sync |
| `/profile` | ProfilePage | Protected | User profile + preferences |
| `/analytics` | AnalyticsPage | Protected | Personal statistics |
| `/share/:code` | SharedSessionPage | Public | View shared session |
| `/sign-in/*` | SignInPage | Public | Clerk sign-in |
| `/sign-up/*` | SignUpPage | Public | Clerk sign-up |

---

## NOTES

- **Local-first:** App works fully offline with IndexedDB. Cloud sync optional.
- **Real-time sync:** Convex subscriptions update UI instantly across devices.
- **Session continuity:** Resume interviews from any device when signed in.
- **Network awareness:** SyncIndicator shows online/offline status with manual refresh.
- **PWA installable:** Add to home screen on mobile/desktop.
- **axe-core in dev:** Console logs a11y violations automatically.
- **Theme toggle:** Available on all pages (header, top-right).
- **Session sharing:** Generate public links to share completed sessions (read-only).
- **Template customization:** Fork built-in templates to create custom versions.
- **Export formats:** Download documents as Markdown, PDF, or HTML.
- **Analytics:** View personal session statistics and usage patterns.
