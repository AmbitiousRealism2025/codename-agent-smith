# Agent Advisor PWA - Master Implementation Plan

**Version**: 1.0
**Date**: 2025-12-31
**Status**: Planning Phase
**Target**: Stage 1 MVP (6-8 weeks)

---

## Executive Summary

**Project Vision**: Build a modern, professional web-based Progressive Web App (PWA) that guides "Vibe Coders" (intermediate+ developers) through creating custom Claude Agent SDK applications. The PWA will feature a sharp, polished UI with multi-provider API support, hybrid deployment options (self-hosted + SaaS subscription), and superior UX compared to the CLI predecessor.

**Core Philosophy**:
- **GUI-First Design**: Professional, intuitive interface that showcases frontend design excellence
- **Fresh Architecture**: Clean slate leveraging modern web patterns (React 18, Convex, Bun)
- **Preserve Core Concepts**: Import proven interview flow, classification logic, and planning document structure
- **Expand & Improve**: Build on foundation with better architecture, more features, superior UX
- **Dual Deployment**: Support both self-hosted (for control) and subscription SaaS (for convenience)

---

## Stage 1 MVP: Solid, Functional, Testable Foundation

**Goal**: Ship a production-ready MVP with locked UI design, core functionality working, and comprehensive test coverage.

**MVP Success Criteria**:
- ✅ User can complete full interview flow in web UI
- ✅ Multi-provider API support working (at least 3 providers: Anthropic, OpenRouter, MiniMax)
- ✅ Classification engine recommends correct agent template
- ✅ Planning document generation produces high-quality Markdown output
- ✅ Download/save functionality works reliably
- ✅ UI is polished, professional, and mobile-responsive
- ✅ Self-hosted mode works without backend (IndexedDB + local API keys)
- ✅ 80%+ test coverage for core business logic
- ✅ PWA installable on desktop and mobile

**Out of Scope for Stage 1**:
- ❌ User authentication / accounts system
- ❌ Subscription billing integration
- ❌ Team collaboration features
- ❌ Advanced analytics dashboard
- ❌ Multi-language support (i18n)
- ❌ Template customization UI
- ❌ AI-powered template suggestions beyond basic classification

---

## Technology Stack

### Frontend Framework
- **React 18.3** with TypeScript ⭐ **(Recommended for stability)**
  - Battle-tested, zero compatibility risks
  - 100% ecosystem compatibility
  - Easy upgrade to React 19 in Stage 2
- **Vite 6** for build tooling (excellent Bun compatibility, faster than Next.js for SPA)
- **React Router v6** for navigation
- **Zustand** for state management (lightweight, 1.2 KB)

### UI & Styling
- **TailwindCSS v3** for utility-first styling *(v4 optional for Stage 2)*
- **shadcn/ui** for accessible, customizable components
- **Framer Motion** for smooth animations and transitions
- **Lucide Icons** for consistent iconography
- **react-markdown** + **remark-gfm** for rendering planning documents

### Backend & Data
- **Convex** for backend-as-a-service (real-time, TypeScript-first)
- **Clerk** for authentication (Stage 2+, prepare in Stage 1)
- **IndexedDB** (via Dexie.js) for local persistence (self-hosted mode)
- **Zod** for schema validation (reuse from existing codebase)

### API Integration
- **Custom Provider Abstraction Layer** supporting:
  - Anthropic API (direct)
  - OpenRouter (proxy to multiple providers)
  - MiniMax API (JWT authentication)
  - OpenAI-compatible APIs (Stage 2)
  - GLM API (Stage 2)
- **Server-Sent Events (SSE)** for streaming responses
- **Convex Actions** for backend API proxy (subscription mode)

### Development Tools
- **Bun** as runtime and package manager
- **Vitest** for unit/integration testing
- **Playwright** for E2E testing
- **TypeScript 5.5+** with strict mode
- **ESLint** + **Prettier** for code quality
- **Biome** (optional alternative to ESLint for speed)

### PWA Features
- **Vite PWA Plugin** for service worker generation
- **Workbox** for advanced caching strategies
- **Web App Manifest** for installability
- **IndexedDB** for offline data persistence

---

## Architecture Overview

### Project Structure (Monorepo)

```
agent-advisor-pwa/
├── packages/
│   ├── web/                    # React PWA application
│   │   ├── src/
│   │   │   ├── components/     # React components (UI)
│   │   │   │   ├── interview/  # Interview flow components
│   │   │   │   ├── templates/  # Template gallery & cards
│   │   │   │   ├── document/   # Document viewer & renderer
│   │   │   │   ├── providers/  # Provider selector & config
│   │   │   │   ├── layout/     # Header, sidebar, navigation
│   │   │   │   └── ui/         # shadcn/ui components
│   │   │   ├── lib/            # Business logic (copied from CLI)
│   │   │   │   ├── interview/  # State machine, questions
│   │   │   │   ├── classification/  # Agent type classifier
│   │   │   │   ├── documentation/   # Document generator
│   │   │   │   ├── providers/  # Multi-provider abstraction
│   │   │   │   └── storage/    # IndexedDB & Convex adapters
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── templates/      # Agent templates (5 types)
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   └── utils/          # Utilities, validation
│   │   ├── public/             # Static assets, manifest
│   │   ├── index.html          # HTML entry point
│   │   ├── vite.config.ts      # Vite configuration
│   │   ├── tailwind.config.ts  # Tailwind configuration
│   │   └── package.json
│   │
│   └── core/                   # Shared business logic (optional, Stage 2+)
│       └── src/
│           ├── interview/
│           ├── classification/
│           └── documentation/
│
├── convex/                     # Convex backend
│   ├── schema.ts               # Database schema
│   ├── sessions.ts             # Session CRUD operations
│   ├── responses.ts            # Interview responses
│   ├── documents.ts            # Document storage
│   ├── providers.ts            # API provider proxy actions
│   ├── users.ts                # User management (Stage 2+)
│   └── tsconfig.json
│
├── docs/                       # Documentation
│   ├── MASTER_PLAN.md          # This file
│   ├── CONTEXT_FROM_CLI.md     # Extracted CLI project context
│   ├── ARCHITECTURE.md         # Detailed architecture docs
│   ├── UI_DESIGN_SYSTEM.md     # Design system guide
│   └── API_PROVIDERS.md        # Provider integration guide
│
├── .gitignore
├── package.json                # Root workspace config
├── bun.lockb                   # Bun lock file
└── README.md
```

### Component Architecture

```
App
├── Router
│   ├── / (Home/Landing)
│   │   └── LandingPage
│   │       ├── Hero
│   │       ├── FeatureHighlights
│   │       ├── ProviderLogos
│   │       └── CTASection
│   │
│   ├── /advisor (Main App)
│   │   └── AdvisorInterface
│   │       ├── Header
│   │       │   ├── Logo
│   │       │   ├── ProviderSelector
│   │       │   └── SettingsButton
│   │       │
│   │       ├── Sidebar (collapsible)
│   │       │   ├── SessionList
│   │       │   ├── NewSessionButton
│   │       │   └── QuickActions
│   │       │
│   │       └── MainContent
│   │           ├── InterviewPanel (if interview active)
│   │           │   ├── ProgressIndicator
│   │           │   ├── QuestionCard
│   │           │   ├── AnswerInput
│   │           │   └── NavigationButtons
│   │           │
│   │           ├── ClassificationResults (after interview)
│   │           │   ├── TemplateRecommendation
│   │           │   ├── AlternativeTemplates
│   │           │   └── GenerateButton
│   │           │
│   │           └── DocumentViewer (after generation)
│   │               ├── MarkdownRenderer
│   │               ├── TableOfContents
│   │               ├── DownloadButton
│   │               └── ShareButton (Stage 2+)
│   │
│   ├── /templates (Browse Templates)
│   │   └── TemplateGallery
│   │       └── TemplateCard[] (5 agent types)
│   │
│   └── /settings
│       └── SettingsPanel
│           ├── ProviderConfiguration
│           ├── APIKeyManagement
│           ├── ThemeSelector
│           └── DataManagement
│
└── PWAInstallPrompt (global)
```

---

## Business Logic to Preserve (from CLI project)

### Copy & Adapt These Files:

1. **Interview System** (`src/lib/interview/`)
   - ✅ `state-manager.ts` - Core state machine (95% reusable)
   - ✅ `questions.ts` - 15 interview questions (100% reusable)
   - ✅ `validation.ts` - Input validators (100% reusable)
   - ⚠️ `persistence.ts` - Replace file I/O with IndexedDB/Convex
   - ⚠️ `tool-handler.ts` - Remove MCP wrapper, use direct function calls

2. **Classification Engine** (`src/lib/classification/`)
   - ✅ `classifier.ts` - Scoring algorithm (100% reusable)
   - ✅ `scoring.ts` - Template matching logic (100% reusable)
   - ⚠️ `tool-handler.ts` - Remove MCP wrapper

3. **Document Generation** (`src/lib/documentation/`)
   - ✅ `document-generator.ts` - Planning doc generator (95% reusable)
   - ✅ All logic, just update output format for web display
   - ⚠️ `planning-tool.ts` - Remove MCP wrapper

4. **Templates** (`src/templates/`)
   - ✅ All 5 agent templates (data-analyst, content-creator, code-assistant, research-agent, automation-agent)
   - ✅ `sections/index.ts` - 8 standardized sections
   - ✅ `template-types.ts` - TypeScript interfaces
   - ✅ `index.ts` - Template registry functions

5. **Utilities** (`src/utils/`)
   - ✅ `validation.ts` - Zod schemas and validators (100% reusable)
   - ⚠️ `minimax-config.ts` - Refactor to generic provider abstraction
   - ✅ All TypeScript types from `src/types/`

### Architectural Changes:

| CLI Pattern | Web Pattern |
|-------------|-------------|
| MCP Tool Handlers | Direct function calls in React components |
| File-based persistence (`fs`) | IndexedDB (self-hosted) or Convex (subscription) |
| `readline` interface | React form components with validation |
| `process.stdout.write` | React state updates + UI rendering |
| Command routing (`/save`, `/load`) | React Router navigation + UI buttons |
| Environment variables (`.env`) | Encrypted localStorage (API keys) + Convex env |
| Streaming via `process.stdout` | Server-Sent Events (SSE) from Convex Actions |

---

## Multi-Provider API Strategy

### Provider Abstraction Layer

Create a clean abstraction that supports all 5 providers:

```typescript
// packages/web/src/lib/providers/provider-interface.ts

export interface ProviderConfig {
  id: string;                    // 'anthropic' | 'openrouter' | 'minimax' | 'openai' | 'glm'
  name: string;                  // Display name
  baseUrl: string;               // API endpoint
  apiKey: string;                // User's API key
  model: string;                 // Selected model
  authentication: 'apiKey' | 'jwt' | 'bearer';
  headers?: Record<string, string>;
  rateLimit?: { requestsPerMinute: number };
}

export interface ProviderAdapter {
  id: string;
  name: string;
  logo: string;                  // Logo URL for UI
  supportedModels: ModelInfo[];

  validateConfig(config: ProviderConfig): ValidationResult;
  createStreamingRequest(prompt: string, config: ProviderConfig): StreamingRequest;
  parseStreamingResponse(chunk: string): StreamingEvent;
}
```

### Supported Providers (Stage 1 MVP):

1. **Anthropic (Direct)** ⭐ Primary
2. **OpenRouter** ⭐ Multi-model proxy
3. **MiniMax** ⭐ Original provider
4. **OpenAI-compatible** (Stage 2)
5. **GLM** (Stage 2)

### Provider Selection UI:

```
┌─────────────────────────────────────┐
│  Select AI Provider                 │
├─────────────────────────────────────┤
│  ○ Anthropic                        │
│    claude-3-5-sonnet-20241022      │
│    [API Key: ••••••••••••]          │
│                                     │
│  ○ OpenRouter                       │
│    anthropic/claude-3.5-sonnet     │
│    [API Key: ••••••••••••]          │
│                                     │
│  ○ MiniMax                          │
│    MiniMax-M2                       │
│    [JWT Token: ••••••••••••]        │
│                                     │
│  [Save & Continue]                  │
└─────────────────────────────────────┘
```

---

## Data Architecture with Convex

### Convex Schema (Subscription Mode)

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User sessions
  sessions: defineTable({
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    currentStage: v.union(
      v.literal("discovery"),
      v.literal("requirements"),
      v.literal("architecture"),
      v.literal("output"),
      v.literal("complete")
    ),
    currentQuestionIndex: v.number(),
    isComplete: v.boolean(),
    createdAt: v.number(),
    lastUpdatedAt: v.number(),

    // Provider info
    selectedProvider: v.string(),
    selectedModel: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_session_id", ["sessionId"])
    .index("by_last_updated", ["lastUpdatedAt"]),

  // Interview responses
  responses: defineTable({
    sessionId: v.id("sessions"),
    questionId: v.string(),
    value: v.union(v.string(), v.boolean(), v.array(v.string())),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_question", ["sessionId", "questionId"]),

  // Generated documents
  documents: defineTable({
    sessionId: v.id("sessions"),
    userId: v.optional(v.id("users")),
    templateId: v.string(),
    content: v.string(),  // Markdown content
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),
});
```

### Local Storage (Self-Hosted Mode)

```typescript
// IndexedDB schema using Dexie.js

class AdvisorDB extends Dexie {
  sessions: Dexie.Table<SessionLocal, string>;
  responses: Dexie.Table<ResponseLocal, number>;
  documents: Dexie.Table<DocumentLocal, number>;
  apiKeys: Dexie.Table<EncryptedKey, string>;

  constructor() {
    super('AdvisorAgentDB');
    this.version(1).stores({
      sessions: 'sessionId, lastUpdatedAt',
      responses: '++id, sessionId, questionId',
      documents: '++id, sessionId, createdAt',
      apiKeys: 'providerId',  // Encrypted API keys
    });
  }
}
```

---

## UI/UX Design Principles

### Design Philosophy

**Target Aesthetic**: Modern SaaS application with professional polish
- **Clean & Minimal**: Generous whitespace, clear hierarchy
- **Professional**: Subtle animations, consistent spacing, thoughtful typography
- **Accessible**: WCAG 2.1 AA compliance, keyboard navigation
- **Responsive**: Mobile-first design, works 320px - 4K displays
- **Fast**: Optimistic UI updates, skeleton loaders, instant feedback

### Visual Design System

**Color Palette**:
```css
/* Light Mode */
--background: 0 0% 100%;        /* Pure white */
--foreground: 222 47% 11%;      /* Near black */
--primary: 221 83% 53%;         /* Blue primary */
--accent: 142 76% 36%;          /* Green accent */
--muted: 210 40% 96%;           /* Light gray */
--border: 214 32% 91%;          /* Subtle border */

/* Dark Mode */
--background: 222 47% 11%;      /* Dark blue-gray */
--foreground: 210 40% 98%;      /* Off-white */
--primary: 217 91% 60%;         /* Brighter blue */
--accent: 142 76% 36%;          /* Same green */
--muted: 217 33% 17%;           /* Darker gray */
--border: 217 33% 17%;          /* Subtle border */
```

**Typography**:
- **Headings**: Inter Variable (700-900 weight)
- **Body**: Inter Variable (400-500 weight)
- **Code**: JetBrains Mono (400 weight)
- **Scale**: 12px, 14px, 16px, 18px, 24px, 32px, 48px

**Spacing System**:
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

**Component Library**:
- Extend shadcn/ui with custom theming
- Custom components for:
  - `<InterviewCard>` - Question presentation
  - `<TemplateCard>` - Template selection
  - `<ProviderBadge>` - API provider indicator
  - `<ProgressRing>` - Circular progress (interview completion)
  - `<MarkdownViewer>` - Planning document renderer
  - `<StreamingText>` - Animated text streaming effect

### Key UI Interactions

1. **Interview Flow**:
   - Smooth page transitions between questions
   - Progress ring showing completion (e.g., "8/15 questions")
   - Smart form validation with inline errors
   - "Skip" button for optional questions
   - Auto-save draft answers every 3 seconds

2. **Template Selection**:
   - Card-based gallery with hover effects
   - Filter by capability tags
   - Preview modal with detailed information
   - Smooth fade-in animations on load

3. **Document Generation**:
   - Skeleton loader during generation
   - Streaming text animation as document generates
   - Automatic table of contents sidebar
   - One-click download as Markdown
   - Copy code blocks with syntax highlighting

4. **Provider Configuration**:
   - Visual provider selector with logos
   - Secure API key input with show/hide toggle
   - Connection test button (validates API key)
   - Model dropdown with descriptions

---

## Implementation Phases (High-Level)

### Stage 1: MVP (6-8 weeks)

**Phase 1.1: Foundation & Setup (Week 1-2)**
- Initialize project with Vite + React 18 + TypeScript + Bun
- Set up Convex backend with schema
- Configure TailwindCSS v3 + shadcn/ui
- Create basic routing structure (React Router)
- Implement design system tokens
- Set up ESLint, Prettier, TypeScript strict mode
- Create base folder structure

**Phase 1.2: Core Business Logic (Week 3-4)**
- Port interview state manager from CLI project
- Implement Zustand stores for state management
- Create provider abstraction layer (3 providers: Anthropic, OpenRouter, MiniMax)
- Port classification engine with scoring algorithm
- Port document generator
- Port all 5 agent templates (data-analyst, content-creator, code-assistant, research-agent, automation-agent)
- Implement IndexedDB storage layer with Dexie.js

**Phase 1.3: UI Components (Week 5-6)**
- Build InterviewPanel with all 15 questions
- Create TemplateGallery with 5 agent cards
- Implement DocumentViewer with Markdown rendering
- Add ProviderSelector with API key management
- Create SessionList sidebar
- Build settings panel
- Implement Header and navigation
- Add dark mode toggle

**Phase 1.4: Integration & Streaming (Week 7)**
- Implement SSE streaming from Convex Actions
- Connect UI to business logic
- Add real-time state persistence (IndexedDB + Convex sync)
- Implement offline support with service worker
- Add PWA manifest and installability
- Test cross-device session sync

**Phase 1.5: Testing & Polish (Week 8)**
- Write unit tests (80% coverage target)
- E2E tests with Playwright (happy path + error cases)
- PWA installability testing (Chrome, Safari, Firefox, Edge)
- Mobile responsiveness fixes (iOS and Android)
- Performance optimization (code splitting, lazy loading)
- Accessibility audit (WCAG 2.1 AA)
- Bug fixes and UX polish

**Stage 1 Deliverables**:
- ✅ Fully functional PWA with professional UI
- ✅ Interview flow (15 questions)
- ✅ Classification engine (5 templates)
- ✅ Document generation
- ✅ 3 provider integrations
- ✅ Self-hosted mode (no backend required)
- ✅ PWA installable
- ✅ 80%+ test coverage
- ✅ Mobile responsive

---

### Stage 2: Features & Enhancement (4-6 weeks)

**Features to Add**:
- User authentication (Clerk integration)
- Session history with search and filtering
- Template customization UI
- Export formats (PDF, HTML)
- Syntax highlighting for code blocks
- Session sharing (public links)
- Add GLM and OpenAI providers
- Team collaboration (multi-user sessions)
- Analytics dashboard
- Upgrade to React 19 (if ecosystem stable)

---

### Stage 3: Polish & Scale (4-6 weeks)

**Features to Add**:
- Subscription billing (Stripe)
- Usage analytics and metrics
- Admin dashboard
- Multi-language support (i18n)
- Advanced template editor
- AI-powered suggestions for improving generated docs
- Integration marketplace (third-party tools)
- Performance monitoring and error tracking
- SEO optimization for landing pages

---

## Critical Files & Components

### Files to Create (Stage 1):

**Core App Structure**:
- `packages/web/src/main.tsx` - App entry point
- `packages/web/src/App.tsx` - Root component with router
- `packages/web/src/routes/` - Route components
- `packages/web/vite.config.ts` - Build configuration

**Business Logic** (copied/adapted from CLI):
- `packages/web/src/lib/interview/state-manager.ts`
- `packages/web/src/lib/interview/questions.ts`
- `packages/web/src/lib/interview/validation.ts`
- `packages/web/src/lib/classification/classifier.ts`
- `packages/web/src/lib/classification/scoring.ts`
- `packages/web/src/lib/documentation/document-generator.ts`
- `packages/web/src/templates/` (all 5 templates)

**Provider System** (new):
- `packages/web/src/lib/providers/provider-interface.ts`
- `packages/web/src/lib/providers/anthropic-adapter.ts`
- `packages/web/src/lib/providers/openrouter-adapter.ts`
- `packages/web/src/lib/providers/minimax-adapter.ts`
- `packages/web/src/lib/providers/provider-registry.ts`

**UI Components**:
- `packages/web/src/components/interview/InterviewPanel.tsx`
- `packages/web/src/components/interview/QuestionCard.tsx`
- `packages/web/src/components/interview/ProgressIndicator.tsx`
- `packages/web/src/components/templates/TemplateGallery.tsx`
- `packages/web/src/components/templates/TemplateCard.tsx`
- `packages/web/src/components/document/DocumentViewer.tsx`
- `packages/web/src/components/document/MarkdownRenderer.tsx`
- `packages/web/src/components/providers/ProviderSelector.tsx`
- `packages/web/src/components/layout/Header.tsx`
- `packages/web/src/components/layout/Sidebar.tsx`

**State Management**:
- `packages/web/src/stores/advisor-store.ts`
- `packages/web/src/stores/ui-store.ts`
- `packages/web/src/stores/provider-store.ts`

**Data Layer**:
- `packages/web/src/lib/storage/indexeddb.ts`
- `packages/web/src/lib/storage/convex-client.ts`
- `packages/web/src/lib/storage/storage-adapter.ts`

**Convex Backend**:
- `convex/schema.ts`
- `convex/sessions.ts`
- `convex/responses.ts`
- `convex/documents.ts`
- `convex/providers.ts` (SSE streaming actions)

**Configuration**:
- `packages/web/.env.example`
- `packages/web/vite.config.ts`
- `packages/web/tailwind.config.ts`
- `packages/web/tsconfig.json`
- `convex/tsconfig.json`
- `.gitignore`

---

## Success Criteria

### Stage 1 MVP Complete When:

**Functionality**:
- ✅ User can complete 15-question interview without errors
- ✅ All 5 agent templates are selectable and generate valid output
- ✅ At least 3 API providers work (Anthropic, OpenRouter, MiniMax)
- ✅ Self-hosted mode works fully offline
- ✅ Planning documents download correctly as Markdown
- ✅ Session persistence works (resume after browser close)

**Quality**:
- ✅ Zero critical bugs in core interview flow
- ✅ 80%+ unit test coverage for business logic
- ✅ 100% E2E test pass rate for happy path
- ✅ Lighthouse score: 90+ performance, 100 accessibility, 100 PWA
- ✅ Works on Chrome, Firefox, Safari, Edge (latest versions)
- ✅ Mobile responsive (tested on iOS and Android)

**Design**:
- ✅ UI matches design system consistently
- ✅ All animations are smooth (60fps)
- ✅ Typography hierarchy is clear and readable
- ✅ Color contrast meets WCAG AA standards
- ✅ Dark mode fully implemented
- ✅ No layout shifts (CLS < 0.1)

**Documentation**:
- ✅ README with setup instructions
- ✅ Architecture documentation
- ✅ API provider setup guide
- ✅ Deployment guide (self-hosted)

---

## Risk Assessment

### High-Risk Areas:

1. **Streaming Complexity**: SSE from Convex Actions to React UI
   - **Mitigation**: Fallback to polling, extensive testing, clear error handling

2. **Multi-Provider Authentication**: Different auth patterns per provider
   - **Mitigation**: Provider abstraction layer, comprehensive validation

3. **Offline Sync**: IndexedDB ↔ Convex synchronization
   - **Mitigation**: Queue-based sync, conflict resolution strategy

4. **UI Performance**: Large Markdown documents with syntax highlighting
   - **Mitigation**: Virtual scrolling, code splitting, lazy loading

5. **API Key Security**: Storing user credentials safely
   - **Mitigation**: Encryption in localStorage, Convex secure storage, clear security docs

### Medium-Risk Areas:

6. **Cross-Browser PWA Support**: Service worker quirks
   - **Mitigation**: Test on all major browsers, progressive enhancement

7. **Mobile UX**: Complex interview on small screens
   - **Mitigation**: Mobile-first design, extensive mobile testing

8. **Test Coverage**: Achieving 80% in 8 weeks
   - **Mitigation**: Write tests alongside features, prioritize critical paths

---

## Open Questions for Iteration

1. **Branding**: Project name, logo, tagline?
2. **Monetization**: Exact subscription tiers and pricing?
3. **Template Expansion**: Should Stage 1 include template editor, or wait for Stage 2?
4. **Analytics**: What metrics to track in MVP?
5. **Collaboration**: Stage 2 or Stage 3 for team features?
6. **Export Formats**: Just Markdown in Stage 1, or add PDF?
7. **AI Suggestions**: Use AI to improve generated docs, or keep it template-based?
8. **Mobile App**: Consider React Native version in future, or web-only?

---

## Next Steps

### Immediate Actions:

1. ✅ **Review & Iterate on Master Plan** - User feedback on scope, technology choices
2. ⏳ **Create Detailed Phase Plan for Stage 1** - Break down 8-week timeline into weekly sprints
3. ⏳ **Set Up Development Environment** - Initialize Git repository, configure Bun + Vite + React
4. ⏳ **Design System First** - Create mockups for key screens, define visual language

---

## Conclusion

This master plan outlines a **fresh, modern PWA** that preserves the proven concepts from the CLI advisor while delivering a **professional, GUI-first experience** for Vibe Coders. The architecture is clean, scalable, and supports both self-hosted and subscription deployment models.

**Stage 1 focuses on**: Solid foundation, locked UI, core functionality, and comprehensive testing.
**Stages 2-3 add**: Advanced features, polish, and scale-ready infrastructure.

**Technology Decision**: Using **React 18.3** for Stage 1 MVP ensures maximum stability and zero compatibility risks. Upgrade to React 19 in Stage 2 when ecosystem has fully stabilized.

Ready for detailed phase planning breakdown.

---

## References

- [shadcn/ui React 19 Support](https://ui.shadcn.com/docs/react-19)
- [Resolving React 19 Dependency Conflicts](https://medium.com/@zachshallbetter/resolving-react-19-dependency-conflicts-without-downgrading-ee0a808af2eb)
- [Updating Shadcn UI Components to React 19](https://makerkit.dev/blog/tutorials/update-shadcn-react-19)
