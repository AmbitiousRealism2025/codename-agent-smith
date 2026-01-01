# AGENT ADVISOR PWA - PROJECT KNOWLEDGE BASE

**Updated:** 2026-01-01  
**Version:** v1.0.0-mvp  
**Branch:** dev  
**Status:** MVP Complete

---

## OVERVIEW

Progressive Web App guiding developers through AI agent configuration. 15-question interview → classification into 5 agent archetypes → planning document generation. Pure client-side (no backend required).

---

## STRUCTURE

```
./
├── packages/web/                # React PWA application
│   ├── src/
│   │   ├── components/
│   │   │   ├── interview/       # QuestionCard, ProgressIndicator, StageIndicator
│   │   │   ├── layout/          # MainLayout, Sidebar, Header, BottomNav
│   │   │   ├── pages/           # LandingPage, AdvisorPage, TemplatesPage, SettingsPage
│   │   │   ├── providers/       # ProviderSelector
│   │   │   ├── export/          # DocumentExport
│   │   │   └── ui/              # shadcn components + ThemeToggle
│   │   ├── lib/
│   │   │   ├── interview/       # questions.ts (15 questions, 4 stages)
│   │   │   ├── classification/  # classifier.ts (weighted scoring)
│   │   │   ├── documentation/   # document-generator.ts (markdown output)
│   │   │   ├── providers/       # provider abstraction layer
│   │   │   └── storage/         # Dexie IndexedDB wrapper
│   │   ├── pages/               # SetupPage, InterviewPage, ResultsPage
│   │   ├── stores/              # Zustand (advisor-store, ui-store, provider-store)
│   │   ├── templates/           # 5 agent archetype templates + sections
│   │   ├── styles/              # globals.css (Catppuccin theme tokens)
│   │   └── types/               # TypeScript interfaces
│   ├── public/icons/            # PWA icons (192, 512, maskable)
│   ├── vite.config.ts           # Vite + PWA + service worker
│   └── tailwind.config.ts       # Catppuccin colors, Satoshi fonts
├── docs/                        # Planning documentation (historical)
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
| IndexedDB schema | `src/lib/storage/db.ts` |
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
- **Storage:** IndexedDB via Dexie.js
- **A11y:** axe-core (dev mode automated testing)

### Patterns
- 15-question interview (4 stages: discovery → requirements → architecture → output)
- 5 agent archetypes: Solo Coder, Pair Programmer, Dev Team, Autonomous Squad, Human-in-the-Loop
- Weighted classification with confidence scoring
- Client-side document generation (no API required for core flow)
- Provider abstraction layer for API calls

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

# Future (configured but not implemented)
bun run test             # Vitest unit tests
bun run test:e2e         # Playwright E2E
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
- /advisor - Main dashboard
- /templates - Browse agent archetypes
- /settings - Manage API providers

---

## PROVIDERS

| Provider | Status | Notes |
|----------|--------|-------|
| Anthropic | ✅ MVP | Direct Claude API |
| OpenRouter | ✅ MVP | Multi-model gateway |
| MiniMax | ✅ MVP | Alternative provider |
| OpenAI | 🔮 Future | Stage 2 |
| GLM | 🔮 Future | Stage 2 |

---

## NOTES

- **Pure client-side:** No backend server required. All data in IndexedDB.
- **Offline capable:** Core interview flow works without network.
- **PWA installable:** Add to home screen on mobile/desktop.
- **axe-core in dev:** Console logs a11y violations automatically.
- **Theme toggle:** Available on all pages (floating button, top-right).
