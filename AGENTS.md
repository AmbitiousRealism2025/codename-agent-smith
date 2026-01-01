# AGENT ADVISOR PWA - PROJECT KNOWLEDGE BASE

**Generated:** 2025-12-31
**Commit:** 197e857
**Branch:** main
**Status:** Scaffolded (Ready for Implementation)

---

## OVERVIEW

PWA guiding developers through Claude Agent SDK application creation. React 18 + TypeScript + Vite + Convex + shadcn/ui stack. Currently documentation-only; no code implemented yet.

---

## STRUCTURE

```
./
├── docs/                    # Planning documentation
│   ├── MASTER_PLAN.md       # Full project vision, architecture, tech decisions
│   ├── MVP_PHASE_PLAN.md    # Detailed 8-week implementation phases
│   └── CONTEXT_FROM_CLI.md  # Business logic to port from CLI predecessor
├── packages/web/            # React PWA application
│   ├── src/
│   │   ├── components/      # React UI (layout/, pages/, interview/, templates/)
│   │   ├── lib/             # Business logic (interview/, classification/, providers/)
│   │   ├── stores/          # Zustand state (advisor-store, ui-store, provider-store)
│   │   ├── types/           # TypeScript interfaces
│   │   └── styles/          # globals.css with design tokens
│   ├── vite.config.ts       # Vite + PWA configuration
│   └── tailwind.config.ts   # Custom theme (Satoshi, colors, animations)
├── convex/                  # Backend-as-a-service
│   ├── schema.ts            # sessions, responses, documents tables
│   └── sessions.ts          # CRUD operations
├── package.json             # Bun workspace root
└── AGENTS.md                # This file
```

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Understand full scope | `docs/MASTER_PLAN.md` | Tech stack, architecture, success criteria |
| Implementation tasks | `docs/MVP_PHASE_PLAN.md` | Granular tasks with deliverables + design specs |
| Business logic to reuse | `docs/CONTEXT_FROM_CLI.md` | Interview questions, classification, templates |
| CLI source to port | `/Users/.../agent_advisor-minimax-mvp` | Referenced but external |

---

## CONVENTIONS

### Design Direction (Locked)
- **Aesthetic:** Editorial Minimalism with Kinetic Accents
- **Typography:** Satoshi (display) + General Sans (body) + JetBrains Mono (code)
- **Colors:** Warm neutrals + electric violet/teal accents (NOT generic purple gradients)
- **Motion:** Strategic animations on high-impact moments only

### Tech Stack (Decided)
- **Runtime:** Bun (not npm/yarn)
- **Framework:** React 18.3 (not 19 yet—stability)
- **Backend:** Convex (real-time, TypeScript-first)
- **Styling:** TailwindCSS v3 + shadcn/ui
- **State:** Zustand (not Redux/Context)
- **Storage:** IndexedDB via Dexie.js (self-hosted mode)

### Patterns to Follow
- 15-question interview flow (4 stages: discovery → requirements → architecture → output)
- 5 agent templates (data-analyst, content-creator, code-assistant, research-agent, automation-agent)
- Template-based classification with weighted scoring
- Markdown document generation (8 standardized sections)

---

## ANTI-PATTERNS (THIS PROJECT)

| Never | Why |
|-------|-----|
| Use Inter/Roboto/Arial fonts | Generic AI aesthetics—use Satoshi/General Sans |
| Purple gradients on white | Overused SaaS cliché |
| Direct Anthropic SDK usage | Use provider abstraction layer |
| File-based persistence | Use IndexedDB (self-hosted) or Convex (subscription) |
| MCP tool handlers | CLI pattern—use direct function calls in React |
| Hardcoded API keys | Encrypt in localStorage or Convex secure storage |

---

## COMMANDS

```bash
# Development
bun install                  # Install dependencies
bun run dev                  # Start Vite dev server
npx convex dev               # Start Convex backend

# Testing
bun run test                 # Vitest unit tests
bun run test:e2e             # Playwright E2E

# Build
bun run build                # Production build
bun run preview              # Preview production build
```

---

## NOTES

- **CLI Predecessor:** `/Users/ambrealismwork/Desktop/Coding-Projects/agent_advisor-minimax-mvp` contains proven business logic to port
- **3 Providers MVP:** Anthropic, OpenRouter, MiniMax (OpenAI/GLM in Stage 2)
- **PWA Required:** Must be installable, work offline for interview flow
- **Test Coverage Target:** 80%+ for business logic
- **Timeline:** 6-8 weeks for Stage 1 MVP
