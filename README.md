# Agent Advisor PWA

**Status**: MVP Complete  
**Version**: [v1.0.0-mvp](https://github.com/AmbitiousRealism2025/codename-agent-smith/releases/tag/v1.0.0-mvp)  
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
- Session persistence via IndexedDB

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
- Secure API key storage in IndexedDB

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
| Storage | Dexie (IndexedDB) — Convex planned for Stage 2 |
| Runtime | Bun |
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
```

---

## Project Structure

```
packages/web/
├── src/
│   ├── components/
│   │   ├── interview/     # QuestionCard, ProgressIndicator
│   │   ├── layout/        # MainLayout, Sidebar, Header, BottomNav
│   │   ├── pages/         # LandingPage, AdvisorPage, TemplatesPage
│   │   ├── providers/     # ProviderSelector
│   │   ├── export/        # DocumentExport
│   │   └── ui/            # shadcn components + ThemeToggle
│   ├── lib/
│   │   ├── interview/     # questions.ts
│   │   ├── classification/# classifier.ts
│   │   ├── documentation/ # document-generator.ts
│   │   ├── providers/     # provider abstraction
│   │   └── storage/       # Dexie IndexedDB layer
│   ├── pages/             # SetupPage, InterviewPage, ResultsPage
│   ├── stores/            # Zustand stores
│   ├── templates/         # Agent archetype templates
│   ├── styles/            # globals.css (Catppuccin theme)
│   └── types/             # TypeScript interfaces
├── public/
│   └── icons/             # PWA icons
└── vite.config.ts         # Vite + PWA configuration
```

---

## User Flow

```
/ (Landing) → /setup (Provider) → /interview (15 questions) → /results (Classification + Export)
```

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
- [x] 3 provider integrations
- [x] PWA installable + offline
- [x] Accessibility audit
- [x] Catppuccin theme

### Future (Stage 2+)
- [ ] Unit tests (Vitest configured)
- [ ] E2E tests (Playwright)
- [ ] Convex backend integration
- [ ] User authentication (Clerk)
- [ ] Cloud sync (Convex)
- [ ] Additional providers (OpenAI, GLM)
- [ ] Multi-language support

---

## License

TBD

---

## Contact

Project Owner: [@AmbitiousRealism2025](https://github.com/AmbitiousRealism2025)
