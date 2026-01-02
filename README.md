# Agent Advisor PWA

**Status**: Stage 2 In Progress  
**Version**: v1.1.0-dev  
**Last Updated**: 2026-01-01

---

## Overview

A Progressive Web App that guides developers through an interactive interview to determine the optimal AI agent configuration for their projects, then generates ready-to-use planning documents.

---

## Features

### Interview System
- 15-question adaptive interview covering project type, team size, timeline, and constraints
- 4 question types: text, single-choice, multi-select, boolean
- Progress tracking with animated indicators
- Session persistence via IndexedDB (local) or Convex (cloud)

### Agent Classification
- 5 agent archetypes: Solo Coder, Pair Programmer, Dev Team, Autonomous Squad, Human-in-the-Loop
- Weighted scoring based on 8 dimensions
- Confidence scoring with match percentages

### Document Generation
- Planning documents generated client-side
- Markdown export with copy/download
- Template-based output customized to archetype

### Provider Support
- Anthropic Claude (direct API)
- OpenRouter (multi-model gateway)
- MiniMax (alternative provider)
- OpenAI (GPT-4o, o1 models) — *New in Stage 2*
- GLM/Zhipu AI (GLM-4 models) — *New in Stage 2*
- Secure API key storage in IndexedDB

### Cloud Sync (Stage 2)
- Convex backend for real-time data sync
- Clerk authentication (sign-in/sign-up)
- Cross-device session continuity
- User preferences sync (theme, default provider)

### PWA
- Installable on desktop and mobile
- Offline-capable with service worker
- Responsive design (mobile bottom nav, desktop sidebar)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18.3 + TypeScript |
| Build | Vite + vite-plugin-pwa |
| Styling | Tailwind CSS + shadcn/ui |
| Theme | Catppuccin (custom warm blush light / Frappé dark) |
| State | Zustand with persist middleware |
| Storage | Dexie (IndexedDB) + Convex (cloud) |
| Auth | Clerk |
| Backend | Convex (serverless) |
| Runtime | Bun |
| Testing | Vitest + Playwright |
| A11y | axe-core (dev mode) |

---

## Quick Start

```bash
cd packages/web

# Install dependencies
bun install

# Development server
bun run dev          # http://localhost:5173

# Type checking
bun run typecheck

# Production build
bun run build
bun run preview

# Run Convex dev server (from repo root)
bunx convex dev
```

### Environment Variables

Create `packages/web/.env.local`:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Project Structure

```
├── convex/                      # Convex backend
│   ├── schema.ts                # Database schema
│   ├── sessions.ts              # Session CRUD
│   ├── responses.ts             # Interview responses
│   ├── documents.ts             # Generated documents
│   └── users.ts                 # User preferences
│
├── packages/web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # AuthGuard, SaveToCloudButton
│   │   │   ├── interview/       # QuestionCard, ProgressIndicator
│   │   │   ├── layout/          # MainLayout, Header, SyncIndicator
│   │   │   ├── pages/           # LandingPage, AdvisorPage
│   │   │   ├── providers/       # ProviderSelector
│   │   │   ├── sessions/        # SessionCard, SessionList
│   │   │   ├── settings/        # UserPreferences
│   │   │   ├── export/          # DocumentExport
│   │   │   └── ui/              # shadcn components
│   │   ├── hooks/               # useNetworkStatus
│   │   ├── lib/
│   │   │   ├── interview/       # questions.ts
│   │   │   ├── classification/  # classifier.ts
│   │   │   ├── documentation/   # document-generator.ts
│   │   │   ├── providers/       # 5 provider adapters
│   │   │   └── storage/         # Dexie + Convex adapters
│   │   ├── pages/               # SetupPage, InterviewPage, ResultsPage, ProfilePage
│   │   ├── stores/              # Zustand stores (advisor, ui, provider, sync)
│   │   ├── templates/           # Agent archetype templates
│   │   └── types/               # TypeScript interfaces
│   ├── e2e/                     # Playwright E2E tests
│   └── public/icons/            # PWA icons
```

---

## User Flow

```
/ (Landing) → /setup (Provider) → /interview (15 questions) → /results (Classification + Export)
```

**Authenticated users:**
- `/profile` — User profile and preferences
- `/advisor` — Session history with resume/delete
- `/settings` — API key management, cloud sync

---

## Providers

| Provider | Models | Status |
|----------|--------|--------|
| Anthropic | Claude Sonnet 4, Claude 3.5 Sonnet/Haiku, Claude 3 Opus | ✅ |
| OpenRouter | Multi-model gateway | ✅ |
| MiniMax | ABAB models | ✅ |
| OpenAI | GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo, o1-preview, o1-mini | ✅ New |
| GLM | GLM-4-plus, GLM-4, GLM-4-air, GLM-4-flash, GLM-4-long | ✅ New |

---

## Accessibility

- Skip-to-content links on all pages
- ARIA labels on icon-only buttons
- Focus-visible states on all interactive elements
- Keyboard-navigable provider cards
- WCAG AA color contrast compliance
- axe-core automated testing in dev mode

---

## Theme

Uses a customized Catppuccin palette:

| Mode | Background | Primary |
|------|------------|---------|
| Light | Warm blush `hsl(10, 57%, 88%)` | Peach `#fe640b` |
| Dark | Frappé Mantle `hsl(231, 19%, 20%)` | Teal `#94e2d5` |

Typography: Satoshi (display) + General Sans (body)

---

## Roadmap

### Completed (MVP)
- [x] Interview flow (15 questions)
- [x] Classification engine (5 archetypes)
- [x] Document generation
- [x] 3 provider integrations (Anthropic, OpenRouter, MiniMax)
- [x] PWA installable + offline
- [x] Accessibility audit
- [x] Catppuccin theme

### Completed (Stage 2)
- [x] Convex backend integration
- [x] User authentication (Clerk)
- [x] Cloud sync with real-time updates
- [x] Session history UI
- [x] User profile and preferences
- [x] Sync status indicators
- [x] OpenAI provider adapter
- [x] GLM provider adapter
- [x] E2E test infrastructure (Playwright)

### In Progress
- [ ] Cross-device sync testing
- [ ] Export formats (PDF, HTML)
- [ ] Interview enhancements
- [ ] Multi-language support

---

## License

TBD

---

## Contact

Project Owner: [@AmbitiousRealism2025](https://github.com/AmbitiousRealism2025)
