# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Advisor is a Progressive Web App that guides developers through a 15-question interview to determine optimal AI agent configurations, then generates ready-to-use planning documents. The app uses client-side classification to match requirements to 5 agent archetypes (Solo Coder, Pair Programmer, Dev Team, Autonomous Squad, Human-in-the-Loop).

**Status**: MVP Complete (v1.0.0-mvp)
**Runtime**: Bun (NOT npm/yarn)
**Package Manager**: Bun 1.2.17+
**Last Updated**: 2026-01-01

---

## Development Commands

**IMPORTANT**: All commands use Bun. Run from repository root.

```bash
# Development server (http://localhost:5173 - strict port)
bun run dev

# Type checking (run before commits)
bun run typecheck

# Linting
bun run lint

# Production build
bun run build
bun run preview

# Testing
bun run test              # Vitest unit tests (implemented)
bun run test:e2e          # Playwright E2E tests (not yet implemented)

# Convex (planned for Stage 2, currently using Dexie/IndexedDB)
bun run convex:dev        # Development mode
bun run convex:deploy     # Production deployment
```

---

## Architecture

### Architectural Style
**Modular Monolith with Feature-Based Organization** - Single SPA (React) with clear domain separation preparing for future microservices evolution.

### Core Data Flow

```
Interview (15 questions) → Requirements Builder → Classifier → Document Generator
                                ↓                      ↓              ↓
                         advisor-store          AgentClassifier   Markdown
                         (Zustand persist)      (scoring logic)    Export
                                ↓
                         IndexedDB (Dexie)
                         (sessions, API keys, settings)
```

### Layered Architecture

**1. Domain Layer** (`/lib`)
- **Interview** (`lib/interview/`) - Question flow, stages, validation logic
- **Classification** (`lib/classification/`) - Scoring algorithm, template matching
- **Documentation** (`lib/documentation/`) - Planning document generation
- **Providers** (`lib/providers/`) - Adapter pattern for API providers
- **Storage** (`lib/storage/`) - IndexedDB abstraction via Dexie

**2. State Management Layer** (`/stores`)
- **advisor-store.ts** - Interview session state, stage progression
- **provider-store.ts** - API provider configuration
- **ui-store.ts** - UI preferences (theme, layout)

**3. Presentation Layer** (`/components`, `/pages`)
- **Pages** - Route-level components (Setup, Interview, Results)
- **Components** - Reusable UI organized by feature (interview/, providers/, export/, layout/)
- **UI** - shadcn/ui primitives + ThemeToggle

**4. Templates Layer** (`/templates`)
- 5 agent archetypes (data-analyst, content-creator, code-assistant, research-agent, automation-agent)
- System prompts + tool configurations + capability tags per archetype

### Dependency Flow

```
Pages → Stores (Zustand) → Domain Logic (lib/) → Storage (Dexie)
     ↓
Components → UI Primitives → Radix UI + Tailwind
     ↓
Templates → Classification Engine → Document Generator
```

### Design Patterns in Use

**Adapter Pattern** (`lib/providers/`)
- `ProviderAdapter` interface with 3 implementations (Anthropic, OpenRouter, MiniMax)
- Registry pattern for provider lookup

**Strategy Pattern** (Classification)
- `AgentClassifier` with pluggable template scoring strategies
- Template selection based on weighted multi-criteria scoring

**Builder Pattern** (Documentation)
- `PlanningDocumentGenerator` constructs markdown docs from requirements + templates
- Phase-based implementation planning

**Repository Pattern** (Storage)
- Dexie wraps IndexedDB with typed entity tables
- Clean separation: `sessions`, `apiKeys`, `settings`

**Factory Pattern** (Templates)
- Standardized template creation
- Central registry via `ALL_TEMPLATES` constant

**State Management: Flux-inspired** (Zustand)
- Immutable state updates
- Persist middleware for session recovery
- Selectors for derived data (`getProgress()`, `getCurrentQuestion()`)

---

## Coding Conventions

### File Naming
- **React Components**: `PascalCase.tsx` (e.g., `QuestionCard.tsx`, `MainLayout.tsx`)
- **Pages**: `PascalCase.tsx` in `/pages` directory (e.g., `SetupPage.tsx`)
- **Utilities/Libraries**: `kebab-case.ts` (e.g., `document-generator.ts`, `advisor-store.ts`)
- **Type Definitions**: `kebab-case.ts` (e.g., `agent.ts`, `interview.ts`)
- **Barrel Exports**: `index.ts` for re-exporting modules

### Naming Conventions
- **Functions**: `camelCase` for regular functions
- **React Components**: `PascalCase` as named exports
- **Constants**: `UPPER_SNAKE_CASE`
- **Variables**: `camelCase`
- **Interfaces/Types**: `PascalCase`
- **Type Unions**: String literals in `kebab-case`

### Import Patterns
**Always use absolute imports with `@/` alias** - Never use relative paths

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { useAdvisorStore } from '@/stores/advisor-store';
import type { AgentRequirements } from '@/types/agent';

// ❌ Wrong
import { Button } from '../../../components/ui/button';
```

**Import Order**:
1. External dependencies (React, third-party libraries)
2. Internal absolute imports (using `@/` alias)
3. Type imports (using `import type`)

### Code Style
- **Paradigm**: Functional components, functional utilities, classes for stateful logic only
- **Async**: Prefer async/await over `.then()` chains
- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess`
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Unused Parameters**: Prefix with `_` (e.g., `_template`)

### React Patterns
```typescript
// Component structure:
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const store = useStore();
  const [state, setState] = useState();

  // 2. Event handlers
  const handleClick = () => { };

  // 3. Effects
  useEffect(() => { }, []);

  // 4. Render
  return <div>...</div>;
}
```

### File Organization

```
packages/web/src/
├── components/          # React components organized by domain
│   ├── ui/             # Reusable UI primitives (shadcn/ui)
│   ├── layout/         # Layout components (Header, Sidebar, BottomNav)
│   ├── pages/          # Page-specific components
│   ├── interview/      # Interview-specific components
│   ├── providers/      # Provider-specific components
│   └── export/         # Export functionality components
├── lib/                # Business logic and utilities
│   ├── classification/ # Classification engine
│   ├── documentation/  # Document generation
│   ├── interview/      # Interview logic
│   ├── providers/      # Provider adapters
│   └── storage/        # Database and persistence
├── pages/              # Top-level page components (routing)
├── stores/             # Zustand state management
├── templates/          # Agent archetype templates
│   └── sections/       # Template section definitions
├── types/              # Shared TypeScript types
└── styles/             # Global styles and fonts
```

---

## Key Architectural Patterns

### 1. Template-Based Classification
Requirements → Scoring → Template Selection → Document Generation (all client-side, no backend calls for classification)

### 2. Persist-Everything
Session state, provider config, API keys all persisted locally (IndexedDB + localStorage)

### 3. Provider-Agnostic
Adapter pattern allows swapping AI providers without changing core logic

### 4. Stage-Based Interview
Questions organized by stage (discovery, requirements, architecture, output), progress tracked per-stage and globally

### 5. Responsive PWA
Mobile-first with bottom nav, desktop with sidebar, installable on all platforms

---

## Critical Paths & Key Files

### Application Entry Points
- **Main Entry**: `packages/web/src/main.tsx` → React StrictMode + axe-core (dev) → App router
- **Router Config**: `packages/web/src/App.tsx`
- **User Flow**: `/` (Landing) → `/setup` (Provider) → `/interview` (15Q) → `/results` (Export)

### Core Business Logic
- **Interview Questions**: `packages/web/src/lib/interview/questions.ts` - 15 questions across 4 stages
- **Classification Engine**: `packages/web/src/lib/classification/classifier.ts` - Template scoring algorithm
- **Document Generator**: `packages/web/src/lib/documentation/document-generator.ts` - Markdown planning doc builder
- **State Machine**: `packages/web/src/stores/advisor-store.ts` - Interview flow control

### Provider System
- **Registry**: `packages/web/src/lib/providers/registry.ts`
- **Interface**: `packages/web/src/lib/providers/types.ts`
- **Adapters**: `packages/web/src/lib/providers/*-adapter.ts` (Anthropic, OpenRouter, MiniMax)

### Storage Layer
- **Database**: `packages/web/src/lib/storage/db.ts` - Dexie IndexedDB abstraction
- **Encryption**: `packages/web/src/lib/storage/crypto.ts` - Web Crypto API for API keys

### Templates
- **Registry**: `packages/web/src/templates/index.ts` - 5 agent archetypes
- **Individual Templates**: `packages/web/src/templates/*.ts` - data-analyst, content-creator, code-assistant, research-agent, automation-agent

### Configuration
- **Vite**: `packages/web/vite.config.ts` - PWA setup, chunk splitting, path aliases
- **TypeScript**: `packages/web/tsconfig.json` - Strict mode, ES2022 target
- **Tailwind**: `packages/web/tailwind.config.ts` - Catppuccin theme
- **Convex Schema**: `convex/schema.ts` - Future backend schema (Stage 2)

---

## Storage Architecture

### Current: Dexie (IndexedDB)
```typescript
// Three main tables:
sessions    // Interview sessions, responses, requirements
apiKeys     // Encrypted provider API keys
settings    // User preferences
```

**Important**: API keys are encrypted via Web Crypto API before storage. Never stored in plaintext.

### Future: Convex Backend (Stage 2)
Schema defined in `convex/schema.ts` but not yet active. Migration path preserved in codebase.

---

## Styling & Theme

### Framework
- **Tailwind CSS** with custom Catppuccin palette
- **Components**: shadcn/ui (Radix UI primitives)
- **Typography**: Satoshi (display), General Sans (body)

### Theme System
**Light Mode**:
- Background: Warm blush `hsl(10, 57%, 88%)`
- Primary: Peach `#fe640b`

**Dark Mode**:
- Background: Frappé Mantle `hsl(231, 19%, 20%)`
- Primary: Teal `#94e2d5`

**Theme Persistence**: next-themes with localStorage

### Styling Conventions
- **Utility-First**: Use Tailwind utilities directly
- **Component Variants**: CVA (Class Variance Authority) for variant management
- **Class Merging**: `cn()` helper from `lib/utils.ts`

```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-classes", variant && "variant-classes")} />
```

---

## Testing

### Current State
**Unit Tests**: Vitest 2.1.0 - **Implemented** ✅
**E2E Tests**: Playwright 1.48.0 configured - **Not yet implemented**
**A11y Tests**: axe-core 4.11.0 active in dev mode

### Implemented Test Suites
Located in `packages/web/src/lib/`:

| Test File | Coverage Area |
|-----------|---------------|
| `interview/__tests__/questions.test.ts` | All 15 interview questions - data integrity, structure, stages |
| `interview/__tests__/advisor-store.test.ts` | Interview state machine, stage progression, responses |
| `classification/__tests__/classifier.test.ts` | Scoring logic for 5 agent archetypes |
| `classification/__tests__/scoring.test.ts` | Scoring utilities and weighting algorithms |

### Manual Testing
Comprehensive manual E2E testing documented in `/docs`:
- `full-interview-test-results.md`
- `e2e-test-results.md`
- `claude-agent-browser-test.md`

### Testing Commands
```bash
bun run test              # Vitest unit tests
bun run test:e2e          # Playwright (not yet implemented)
bun run typecheck         # TypeScript validation
bun run lint              # ESLint
```

### Roadmap
E2E tests planned for Stage 2+. Infrastructure ready, just needs implementation.

---

## Build & Deployment

### Build Configuration
- **Target**: ES2022 (modern browsers only)
- **Code Splitting**: Manual chunks (vendor, ui, markdown)
- **PWA**: vite-plugin-pwa + Workbox for offline capability
- **Port**: 5173 (strict mode - must use this port)

### Build Process
```bash
bun run build

# Pipeline:
# 1. TypeScript compilation (tsc -b)
# 2. Vite production build
#    - Bundle optimization
#    - PWA service worker generation
#    - Asset optimization
# 3. Output → packages/web/dist/
```

### Deployment
**Status**: Not deployed (local development only)

**Recommended Platforms**:
- **Vercel** (optimal for Vite + React)
- **Netlify**
- **Cloudflare Pages**

**Build Settings**:
- Build command: `bun run build`
- Output directory: `packages/web/dist`
- Install command: `bun install`

---

## Important Gotchas

### Critical ⚠️

1. **Use Bun, NOT npm/yarn**
   - Commands will fail with npm/yarn
   - Package manager: `bun@1.1.0` minimum

2. **Run commands from repository root**
   - Scripts delegate to `packages/web`
   - Working in `packages/web` directly may cause issues

3. **Absolute imports required**
   - MUST use `@/` alias, not relative paths
   - Vite path alias configured in `vite.config.ts`

4. **No backend exists**
   - Classification + document generation entirely client-side
   - API keys stored encrypted in IndexedDB, never sent anywhere

5. **Convex references exist but unused**
   - Schema defined in `convex/schema.ts`
   - Migration path preserved for Stage 2
   - Currently uses Dexie (IndexedDB) only

6. **Strict port 5173**
   - Dev server MUST run on port 5173
   - `strictPort: true` in Vite config

7. **ES2022 target only**
   - No legacy browser support
   - Assumes modern browser features

### Workflow Notes

8. **Unit tests implemented, E2E tests pending**
   - Vitest unit tests cover interview questions, advisor store, classifier, and scoring
   - Playwright E2E tests not yet implemented
   - Manual E2E testing documented in `/docs`

9. **API keys are sensitive**
   - Stored encrypted in IndexedDB
   - Use Web Crypto API for encryption/decryption
   - Never commit API keys

10. **Theme system uses CSS variables**
    - HSL color system
    - Reference via Tailwind utilities
    - Custom Catppuccin palette

---

## Common Development Tasks

### Adding a New Interview Question

1. **Add question to array** (`src/lib/interview/questions.ts`):
```typescript
{
  id: 'q16_new_question',
  stage: 'requirements',
  type: 'single-choice',
  question: 'Your question text?',
  options: ['Option 1', 'Option 2'],
  required: true,
  helpText: 'Additional context'
}
```

2. **Update response mapping** (`src/stores/advisor-store.ts`):
```typescript
case 'q16_new_question':
  updated.fieldName = value as FieldType;
  break;
```

3. **Update types if needed** (`src/types/interview.ts`)

### Adding a New Agent Template

1. **Create template file** (`src/templates/new-template.ts`):
```typescript
import { createTemplate } from './template-types';

export const newTemplate = createTemplate({
  id: 'new-template',
  name: 'Template Name',
  category: 'category',
  description: 'Description',
  capabilityTags: ['tag1', 'tag2'],
  // ... rest of template structure
});
```

2. **Register in index** (`src/templates/index.ts`):
```typescript
import { newTemplate } from './new-template';
export const ALL_TEMPLATES = [..., newTemplate];
```

3. **Update classification weights** (`src/lib/classification/classifier.ts`) if needed

### Adding a New Provider

1. **Create adapter** (`src/lib/providers/new-adapter.ts`):
```typescript
export class NewProviderAdapter implements ProviderAdapter {
  // Implement interface methods
}
```

2. **Register provider** (`src/lib/providers/registry.ts`):
```typescript
export const PROVIDERS = [..., newProvider];
```

3. **Add to UI** (`src/components/providers/ProviderSelector.tsx`)

---

## Documentation

### Available Documentation
- **README.md** - Project overview, features, quick start
- **AGENTS.md** - Project knowledge base for session continuity
- **HANDOFF.md** - Session continuation context
- **docs/MASTER_PLAN.md** - Stage 1-3 architecture plan
- **docs/MVP_PHASE_PLAN.md** - Detailed implementation plan
- **docs/*.md** - Manual E2E test results

### Documentation Quality
- ⭐⭐⭐⭐⭐ Planning/Architecture (excellent)
- ⭐⭐⭐⭐ User-facing (very good)
- ⭐⭐⭐ Developer onboarding (good)
- ⭐⭐ API documentation (code only)

### Missing Documentation
- CONTRIBUTING.md (developer workflows)
- DEPLOYMENT.md (production deployment guide)
- TESTING.md (unit/E2E testing guide)
- API.md (provider integration reference)

---

## Stage 2 Roadmap (Future)

### Planned Features
- [x] Unit tests (Vitest) ✅
- [ ] E2E tests (Playwright)
- [ ] Convex backend migration
- [ ] User authentication (Clerk)
- [ ] Cloud sync (Convex)
- [ ] Additional providers (OpenAI, GLM)
- [ ] Multi-language support

### Technical Debt
- Update planning docs status to "MVP Complete"
- Implement E2E testing (Playwright)
- Create deployment pipeline
- Add monitoring/logging
- Performance optimization
- Security audit

---

## Quick Reference

### Essential Files to Know
```
packages/web/src/
├── lib/classification/classifier.ts    # Core classification logic
├── lib/interview/questions.ts          # 15 interview questions
├── stores/advisor-store.ts             # Interview state machine
├── templates/index.ts                  # 5 agent archetypes
├── App.tsx                             # Route configuration
└── main.tsx                            # Application entry

vite.config.ts                          # Build + PWA config
package.json                            # Dependencies + scripts
convex/schema.ts                        # Future backend schema
```

### Pre-Commit Checklist
```bash
bun run typecheck           # Must pass (strict mode)
bun run lint                # Must pass (no warnings)
bun run build               # Must succeed
```

### Common Issues

**Dev server won't start**:
- Check port 5173 is not in use
- Ensure using Bun, not npm/yarn

**Import errors**:
- Use `@/` alias, not relative paths
- Check `tsconfig.json` path mapping

**Build fails**:
- Run `bun run typecheck` first
- Check for TypeScript errors

**Tests failing**:
- Run `bun run test` to see test output
- Check test files in `lib/**/__tests__/` directories

---

## Accessibility

- **WCAG AA compliant** - Color contrast verified
- **Skip-to-content links** on all pages
- **ARIA labels** on icon-only buttons
- **Focus-visible states** on all interactive elements
- **Keyboard navigation** fully supported
- **axe-core testing** in dev mode

---

## Project Status

**Version**: 1.0.0-mvp
**Status**: MVP Complete ✅
**Last Updated**: 2026-01-01
**Next Phase**: Stage 2 (Testing + Backend Migration)

---

**Questions or issues?** See `/docs/MASTER_PLAN.md` for architectural decisions, or check `AGENTS.md` for project context.
