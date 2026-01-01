# Stage 1 MVP - Detailed Phase Plan

**Version**: 1.0
**Date**: 2025-12-31
**Target Duration**: 6-8 weeks
**Status**: Ready for Implementation

---

## Executive Summary

This document breaks down Stage 1 MVP into granular, actionable phases with specific deliverables, design decisions, and success criteria. Each phase builds on the previous, creating a production-ready PWA that showcases exceptional frontend design while preserving proven business logic from the CLI project.

**Design Philosophy**: This is NOT another generic SaaS app. We're building a **distinctive, memorable experience** that demonstrates what thoughtful AI-assisted development looks like. Every interaction should feel intentional, polished, and slightly unexpected.

---

## Design Direction (Frontend-Design Skill Applied)

### Chosen Aesthetic: **Editorial Minimalism with Kinetic Accents**

A refined, magazine-quality interface with strategic bursts of animation that draw attention without overwhelming. Think: Stripe's clarity meets Linear's motion design.

### Typography
- **Display**: [Satoshi](https://www.fontshare.com/fonts/satoshi) (Variable, 500-900) - Modern geometric sans with personality
- **Body**: [General Sans](https://www.fontshare.com/fonts/general-sans) (400-500) - Highly readable, slightly warmer than Inter
- **Mono**: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (400) - For code blocks

### Color Palette

```css
/* Light Mode - Warm Neutrals + Electric Accents */
--background: hsl(40 20% 98%);           /* Warm off-white */
--foreground: hsl(220 20% 10%);          /* Deep charcoal */
--primary: hsl(255 85% 55%);             /* Electric violet */
--primary-foreground: hsl(0 0% 100%);
--accent: hsl(165 80% 40%);              /* Vibrant teal */
--muted: hsl(40 10% 94%);
--border: hsl(40 15% 88%);
--card: hsl(0 0% 100%);

/* Dark Mode - Deep Space + Neon */
--background: hsl(240 15% 8%);           /* Deep blue-black */
--foreground: hsl(40 20% 95%);           /* Warm cream */
--primary: hsl(270 100% 70%);            /* Bright purple */
--primary-foreground: hsl(0 0% 100%);
--accent: hsl(165 90% 50%);              /* Neon teal */
--muted: hsl(240 10% 15%);
--border: hsl(240 10% 20%);
--card: hsl(240 12% 12%);
```

### Motion Principles
1. **Page Transitions**: Staggered fade-in with subtle Y-axis translation (150-300ms)
2. **Question Cards**: Smooth slide + fade between questions (250ms ease-out)
3. **Progress Ring**: Animated stroke-dasharray progression
4. **Hover States**: Scale 1.02 + shadow depth change
5. **Button Press**: Quick scale 0.98 with haptic-like feedback
6. **Streaming Text**: Character-by-character with variable timing (typewriter effect)

### Spatial Composition
- **Asymmetric Grid**: Main content 65%, sidebar 35% (not 50/50)
- **Generous Whitespace**: 32px minimum between major sections
- **Card Depth**: Layered cards with subtle shadows (box-shadow: 0 4px 20px rgba(0,0,0,0.05))
- **Breaking the Grid**: Progress indicator overlaps sections, CTA buttons "float" with fixed positioning

---

## Phase 1.1: Foundation & Setup (Week 1-2)

**Goal**: Establish a rock-solid development environment with design system tokens baked in from day one.

### Week 1: Project Initialization

#### Task 1.1.1: Repository & Tooling Setup
**Estimated**: 4 hours

**Deliverables**:
- [ ] Initialize Git repository with `.gitignore`
- [ ] Set up Bun as runtime/package manager
- [ ] Create monorepo structure with `packages/web/` and `convex/`
- [ ] Configure TypeScript 5.5+ with strict mode
- [ ] Set up ESLint + Prettier (or Biome)
- [ ] Add Husky for pre-commit hooks
- [ ] Create initial `package.json` with workspace config

**Success Criteria**:
- `bun install` completes without errors
- `bun run typecheck` passes
- `bun run lint` passes

#### Task 1.1.2: Vite + React Configuration
**Estimated**: 3 hours

**Deliverables**:
- [ ] Initialize Vite 6 with React 18.3 template
- [ ] Configure path aliases (`@/` → `src/`)
- [ ] Set up environment variables (`.env.example`, `.env.local`)
- [ ] Configure Vite PWA plugin (service worker scaffolding)
- [ ] Add React Router v6 with basic routes (`/`, `/advisor`, `/settings`)

**Success Criteria**:
- `bun run dev` starts dev server on localhost:5173
- Hot reload works for TSX changes
- Routes navigate correctly

#### Task 1.1.3: TailwindCSS + Design Token Setup
**Estimated**: 4 hours

**Deliverables**:
- [ ] Install TailwindCSS v3 with PostCSS
- [ ] Create `tailwind.config.ts` with custom theme:
  - Custom color palette (warm neutrals + electric accents)
  - Typography scale (Satoshi + General Sans)
  - Spacing scale (4px base)
  - Animation durations
  - Custom shadows
- [ ] Set up CSS custom properties for runtime theming
- [ ] Create `globals.css` with base styles
- [ ] Configure dark mode (`class` strategy)
- [ ] Add font files to `public/fonts/` (self-hosted for performance)

**Files to Create**:
```
packages/web/
├── src/
│   ├── styles/
│   │   ├── globals.css
│   │   ├── fonts.css
│   │   └── animations.css
│   └── lib/
│       └── theme/
│           ├── colors.ts
│           ├── typography.ts
│           └── tokens.ts
├── tailwind.config.ts
└── postcss.config.js
```

**Success Criteria**:
- Custom colors render correctly
- Fonts load without FOUT (Flash of Unstyled Text)
- Dark mode toggle works

### Week 2: shadcn/ui + Base Components

#### Task 1.1.4: shadcn/ui Installation & Customization
**Estimated**: 6 hours

**Deliverables**:
- [ ] Install shadcn/ui with custom theme
- [ ] Override default shadcn colors with our palette
- [ ] Install core components:
  - Button (with our custom variants)
  - Input
  - Textarea
  - RadioGroup
  - Checkbox
  - Switch
  - Card
  - Dialog
  - Dropdown
  - Progress
  - Skeleton
  - Toast
- [ ] Create custom variants for each component
- [ ] Document component usage in Storybook (optional) or README

**Customization Focus**:
- Buttons: Rounded-lg, subtle gradient on primary, hover glow effect
- Cards: Warm background, soft shadows, 2px border on focus
- Inputs: Large touch targets (min 48px height), visible focus rings

**Success Criteria**:
- All components render with custom theme
- Components are accessible (keyboard navigation, ARIA labels)

#### Task 1.1.5: Layout Components
**Estimated**: 5 hours

**Deliverables**:
- [ ] `<Header>`: Logo, provider selector, settings button, theme toggle
- [ ] `<Sidebar>`: Collapsible, session list, quick actions
- [ ] `<MainLayout>`: Wraps header + sidebar + content area
- [ ] `<PageTransition>`: Framer Motion wrapper for route changes
- [ ] `<Container>`: Max-width wrapper with responsive padding

**Layout Specification**:
```
┌─────────────────────────────────────────────────────┐
│ Header (h-16, sticky)                               │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  Sidebar     │  Main Content                        │
│  (w-72,      │  (flex-1, max-w-4xl centered)        │
│  collapsible)│                                      │
│              │                                      │
│              │                                      │
│              │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

**Success Criteria**:
- Layout is responsive (sidebar collapses on mobile)
- Smooth animations on sidebar toggle (200ms ease-out)
- Header stays fixed on scroll

#### Task 1.1.6: Convex Backend Initialization
**Estimated**: 4 hours

**Deliverables**:
- [ ] Create Convex project (`npx convex dev`)
- [ ] Define initial schema (`convex/schema.ts`):
  - `sessions` table
  - `responses` table
  - `documents` table
- [ ] Create basic CRUD functions for sessions
- [ ] Set up Convex client in React (`ConvexProvider`)
- [ ] Test real-time updates work

**Success Criteria**:
- Convex dashboard shows tables
- Creating a session from React updates in real-time
- No TypeScript errors in Convex functions

---

## Phase 1.2: Core Business Logic (Week 3-4)

**Goal**: Port proven CLI logic to web-friendly format, implementing all core interview and classification functionality.

### Week 3: Interview System + State Management

#### Task 1.2.1: Port Interview Questions & Types
**Estimated**: 3 hours

**Deliverables**:
- [ ] Copy `questions.ts` from CLI project
- [ ] Copy all TypeScript types from `src/types/`
- [ ] Copy Zod validation schemas
- [ ] Adapt imports for web project structure

**Files to Create**:
```
packages/web/src/
├── lib/
│   └── interview/
│       ├── questions.ts       # 15 questions
│       ├── types.ts           # InterviewState, Response, etc.
│       └── validation.ts      # Zod schemas
└── types/
    ├── interview.ts
    ├── agent.ts
    └── template.ts
```

**Success Criteria**:
- All 15 questions have correct types
- Zod schemas validate correctly
- No TypeScript errors

#### Task 1.2.2: Zustand Interview Store
**Estimated**: 6 hours

**Deliverables**:
- [ ] Create `advisor-store.ts` with Zustand
- [ ] Implement state shape:
  ```typescript
  interface AdvisorStore {
    // State
    sessionId: string | null;
    currentStage: InterviewStage;
    currentQuestionIndex: number;
    responses: Map<string, ResponseValue>;
    requirements: Partial<AgentRequirements>;
    recommendations: AgentRecommendations | null;
    isComplete: boolean;
    isGenerating: boolean;
    
    // Computed (via selectors)
    currentQuestion: () => InterviewQuestion | null;
    progress: () => { current: number; total: number; percent: number };
    canGoBack: () => boolean;
    canSkip: () => boolean;
    
    // Actions
    initSession: (sessionId?: string) => void;
    recordResponse: (questionId: string, value: ResponseValue) => void;
    skipQuestion: () => void;
    goToPreviousQuestion: () => void;
    setRecommendations: (recs: AgentRecommendations) => void;
    resetInterview: () => void;
  }
  ```
- [ ] Implement auto-advance logic (stage progression)
- [ ] Implement requirements mapping (response → requirements)
- [ ] Add persist middleware (localStorage backup)

**Key Logic to Port**:
- `recordResponse()` → updates responses, maps to requirements, advances question
- `advanceStage()` → triggered when all stage questions answered
- `updateRequirementsFromResponse()` → switch statement mapping

**Success Criteria**:
- Store initializes correctly
- Recording response advances to next question
- Stage automatically advances when complete
- Previous question navigation works

#### Task 1.2.3: IndexedDB Storage Layer
**Estimated**: 4 hours

**Deliverables**:
- [ ] Install Dexie.js (`bun add dexie`)
- [ ] Create `AdvisorDB` class with tables:
  - `sessions`: sessionId, timestamp, state
  - `apiKeys`: providerId, encryptedKey (for self-hosted mode)
- [ ] Create storage adapter interface
- [ ] Implement save/load/delete functions
- [ ] Add auto-save hook (debounced, every 3 seconds)

**Files to Create**:
```
packages/web/src/lib/storage/
├── db.ts              # Dexie database definition
├── sessions.ts        # Session CRUD operations
├── api-keys.ts        # Encrypted key storage
└── adapter.ts         # Storage abstraction interface
```

**Success Criteria**:
- Sessions persist across browser refresh
- API keys are stored (encrypted in production)
- 7-day session cleanup works

### Week 4: Classification + Document Generation

#### Task 1.2.4: Port Classification Engine
**Estimated**: 4 hours

**Deliverables**:
- [ ] Copy `classifier.ts` scoring algorithm
- [ ] Copy template matching logic
- [ ] Adapt for Zustand store integration
- [ ] Add unit tests for scoring

**Files to Create**:
```
packages/web/src/lib/classification/
├── classifier.ts      # Main classification logic
├── scoring.ts         # Template scoring algorithm
└── types.ts           # TemplateScore, AgentRecommendations
```

**Success Criteria**:
- Classification returns correct template for test requirements
- Confidence scores are calculated correctly
- Alternative templates are ranked

#### Task 1.2.5: Port Document Generator
**Estimated**: 4 hours

**Deliverables**:
- [ ] Copy `document-generator.ts`
- [ ] Adapt for streaming output (generator function)
- [ ] Add section-by-section generation
- [ ] Create markdown utilities (TOC extraction, code block detection)

**Files to Create**:
```
packages/web/src/lib/documentation/
├── document-generator.ts   # Main generator
├── sections.ts             # Section templates
├── markdown-utils.ts       # TOC, code blocks, etc.
└── types.ts
```

**Success Criteria**:
- Generator produces valid Markdown
- All 8 sections are included
- Streaming output works (yields section by section)

#### Task 1.2.6: Port Agent Templates
**Estimated**: 3 hours

**Deliverables**:
- [ ] Copy all 5 templates:
  - `data-analyst.ts`
  - `content-creator.ts`
  - `code-assistant.ts`
  - `research-agent.ts`
  - `automation-agent.ts`
- [ ] Copy `sections/index.ts` (8 standard sections)
- [ ] Copy `template-types.ts`
- [ ] Create template registry with lookup functions

**Files to Create**:
```
packages/web/src/templates/
├── data-analyst.ts
├── content-creator.ts
├── code-assistant.ts
├── research-agent.ts
├── automation-agent.ts
├── sections/
│   └── index.ts
├── types.ts
└── registry.ts
```

**Success Criteria**:
- All 5 templates load correctly
- Template lookup by ID works
- Section content is complete

#### Task 1.2.7: Provider Abstraction Layer
**Estimated**: 8 hours

**Deliverables**:
- [ ] Create `ProviderConfig` and `ProviderAdapter` interfaces
- [ ] Implement 3 provider adapters:
  - `anthropic-adapter.ts`
  - `openrouter-adapter.ts`
  - `minimax-adapter.ts`
- [ ] Create provider registry with validation
- [ ] Implement SSE streaming abstraction
- [ ] Add API key validation (connection test)
- [ ] Create `provider-store.ts` (Zustand) for selected provider

**Files to Create**:
```
packages/web/src/lib/providers/
├── types.ts                # ProviderConfig, ProviderAdapter, etc.
├── registry.ts             # Provider lookup and registration
├── anthropic-adapter.ts    # Anthropic API adapter
├── openrouter-adapter.ts   # OpenRouter adapter
├── minimax-adapter.ts      # MiniMax (JWT auth)
└── streaming.ts            # SSE streaming utilities
```

**Provider Interface**:
```typescript
interface ProviderAdapter {
  id: string;
  name: string;
  logo: string;
  supportedModels: ModelInfo[];
  
  validateConfig(config: ProviderConfig): Promise<ValidationResult>;
  createMessage(params: MessageParams): Promise<Response>;
  streamMessage(params: MessageParams): AsyncGenerator<StreamChunk>;
}
```

**Success Criteria**:
- All 3 providers connect successfully with valid API key
- Streaming works (chunks arrive progressively)
- Invalid keys return meaningful errors

---

## Phase 1.3: UI Components (Week 5-6)

**Goal**: Build polished, distinctive UI components that showcase the design system and create a memorable user experience.

### Week 5: Interview Flow Components

#### Task 1.3.1: InterviewPanel Component
**Estimated**: 8 hours

**Deliverables**:
- [ ] `<InterviewPanel>`: Main container with stage-aware layout
- [ ] `<ProgressIndicator>`: Circular progress ring with animated fill
  - Shows "8/15 questions" text
  - Stroke-dasharray animation on progress change
  - Subtle pulse on completion
- [ ] `<StageIndicator>`: Horizontal stepper showing 4 stages
  - Completed stages: filled circle + checkmark
  - Current stage: pulsing ring
  - Future stages: outlined circle
- [ ] `<NavigationButtons>`: Previous / Skip / Next with contextual states

**Design Specifications**:
```
┌────────────────────────────────────────────────┐
│                                                │
│  ┌────────────────┐    Progress Ring           │
│  │  Discovery     │      (8/15)                │
│  │  ● ─ ○ ─ ○ ─ ○ │                           │
│  └────────────────┘                            │
│                                                │
│  ┌────────────────────────────────────────┐    │
│  │                                        │    │
│  │  Question Card (animated entry)        │    │
│  │                                        │    │
│  │  What is the primary outcome or goal   │    │
│  │  this agent should achieve?            │    │
│  │                                        │    │
│  │  ┌──────────────────────────────────┐  │    │
│  │  │ [Text input with validation]     │  │    │
│  │  └──────────────────────────────────┘  │    │
│  │                                        │    │
│  │  ┌──────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │ Back │  │   Skip   │  │ Continue │  │    │
│  │  └──────┘  └──────────┘  └──────────┘  │    │
│  │                                        │    │
│  └────────────────────────────────────────┘    │
│                                                │
└────────────────────────────────────────────────┘
```

**Animation Details**:
- Question card slides in from right (X: 20px → 0) with fade (opacity: 0 → 1), 250ms ease-out
- Going back: slide from left
- Progress ring: animated stroke-dashoffset on each answer

**Success Criteria**:
- Smooth transitions between questions (no jank)
- Progress ring animates correctly
- Keyboard navigation works (Tab, Enter, Escape)

#### Task 1.3.2: QuestionCard Component
**Estimated**: 6 hours

**Deliverables**:
- [ ] `<QuestionCard>`: Wrapper with question-type-aware rendering
- [ ] `<TextQuestion>`: Input or Textarea based on expected length
- [ ] `<ChoiceQuestion>`: RadioGroup with custom styling
- [ ] `<MultiselectQuestion>`: Checkbox group with pill-style options
- [ ] `<BooleanQuestion>`: Toggle switch with yes/no labels

**Design Specifications**:

**Text Input**:
- Large touch target (min-height: 48px)
- Subtle bottom border that animates to primary color on focus
- Character count for long inputs
- Inline validation errors (shake animation + red border)

**Choice/Radio**:
- Card-style options (not small circles)
- Selected state: primary background + checkmark icon
- Hover: subtle lift + shadow

**Multiselect**:
- Pill-style tags
- Selected pills have primary background
- "Other" option opens inline text input

**Boolean**:
- Large toggle switch (48px wide)
- Animated slider with spring physics
- "Yes" / "No" labels on either side

**Success Criteria**:
- All 4 question types render correctly
- Validation errors appear inline
- Accessible (screen reader announces states)

#### Task 1.3.3: Auto-Save & Draft Indicator
**Estimated**: 3 hours

**Deliverables**:
- [ ] Debounced auto-save (3 second delay after typing stops)
- [ ] `<SaveIndicator>`: Small badge showing "Saved" / "Saving..." / "Error"
- [ ] Toast notification on save error with retry button
- [ ] Visual indicator when leaving page with unsaved changes

**Behavior**:
- "Saving..." appears immediately on input change
- After 3 seconds of no changes, save triggers
- "Saved" badge fades in, then fades out after 2 seconds
- Dirty state prevents accidental navigation (beforeunload)

**Success Criteria**:
- Auto-save triggers correctly
- User can close browser and resume later
- No data loss on network errors (retry queue)

### Week 6: Template Gallery + Document Viewer

#### Task 1.3.4: TemplateGallery Component
**Estimated**: 6 hours

**Deliverables**:
- [ ] `<TemplateGallery>`: Grid layout with filter bar
- [ ] `<TemplateCard>`: Individual template preview
  - Template icon (custom per type)
  - Name + short description
  - Capability tags (pills)
  - "View Details" button → opens modal
- [ ] `<TemplateDetailModal>`: Full template info
  - All sections preview
  - "Start with this template" button
- [ ] Filter by capability tags

**Design Specifications**:
```
┌────────────────────────────────────────────────┐
│  Choose Your Agent Template                    │
│                                                │
│  [All] [Data] [Content] [Code] [Research] [Auto]
│                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  │ 📊         │  │ 📝         │  │ 💻         │
│  │ Data       │  │ Content    │  │ Code       │
│  │ Analyst    │  │ Creator    │  │ Assistant  │
│  │            │  │            │  │            │
│  │ [Details]  │  │ [Details]  │  │ [Details]  │
│  └────────────┘  └────────────┘  └────────────┘
│                                                │
│  ┌────────────┐  ┌────────────┐                │
│  │ 🔍         │  │ ⚡         │                │
│  │ Research   │  │ Automation │                │
│  │ Agent      │  │ Agent      │                │
│  │            │  │            │                │
│  │ [Details]  │  │ [Details]  │                │
│  └────────────┘  └────────────┘                │
└────────────────────────────────────────────────┘
```

**Animation Details**:
- Cards stagger in on page load (50ms delay between each)
- Hover: lift (translateY: -4px) + shadow increase
- Filter: fade out non-matching, resize grid smoothly

**Success Criteria**:
- All 5 templates displayed correctly
- Filter works without page jump
- Modal opens/closes smoothly

#### Task 1.3.5: ClassificationResults Component
**Estimated**: 4 hours

**Deliverables**:
- [ ] `<ClassificationResults>`: Shows after interview completion
- [ ] `<RecommendedTemplate>`: Primary recommendation with confidence score
  - Large card with template details
  - Confidence percentage with animated fill bar
  - "Generate Document" CTA button
- [ ] `<AlternativeTemplates>`: Secondary recommendations (smaller cards)
- [ ] Reasoning explanation (why this template was chosen)

**Design Specifications**:
```
┌────────────────────────────────────────────────┐
│  Perfect Match Found!                          │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ 📊 Data Analyst                           │  │
│  │                                          │  │
│  │ Confidence: ████████████░░ 87%           │  │
│  │                                          │  │
│  │ Best for: CSV processing, statistics,    │  │
│  │ visualization, automated reporting       │  │
│  │                                          │  │
│  │ [Generate Planning Document]             │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  Also Consider:                                │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ 🔍 Research │  │ ⚡ Automate │              │
│  │    72%      │  │    65%      │              │
│  └─────────────┘  └─────────────┘              │
│                                                │
│  Why we chose Data Analyst:                    │
│  • You selected data analysis capabilities    │
│  • Target audience includes Data Scientists   │
│  • ...                                         │
└────────────────────────────────────────────────┘
```

**Success Criteria**:
- Correct template is recommended based on responses
- Confidence bar animates from 0 to final value
- Alternative templates are clickable (switch selection)

#### Task 1.3.6: DocumentViewer Component
**Estimated**: 8 hours

**Deliverables**:
- [ ] `<DocumentViewer>`: Main viewer with Markdown rendering
- [ ] `<MarkdownRenderer>`: react-markdown + remark-gfm with custom components
  - Headings: styled with anchor links
  - Code blocks: syntax highlighting (Prism.js)
  - Tables: responsive with horizontal scroll
  - Lists: custom bullet styling
- [ ] `<TableOfContents>`: Sticky sidebar with section links
  - Auto-generated from headings
  - Highlights current section on scroll
- [ ] `<StreamingText>`: Typewriter effect during generation
- [ ] `<DocumentActions>`: Download, Copy, Print buttons

**Design Specifications**:
```
┌──────────────────────────────────────────────────────┐
│  Planning Document                        [⬇️] [📋]  │
├────────────────┬─────────────────────────────────────┤
│  Contents      │                                     │
│                │  # Data Analyst Agent               │
│  • Overview    │                                     │
│  • Requirements│  ## Overview                        │
│  • Architecture│                                     │
│  • Phases      │  This agent specializes in...       │
│  • Security    │                                     │
│  • Metrics     │  ## Requirements                    │
│  • Risks       │                                     │
│  • Deployment  │  - **Memory**: Long-term persistent │
│                │  - **File Access**: Yes             │
│                │  - **Web Access**: No               │
│                │                                     │
│                │  ```python                          │
│                │  def analyze_data(df):             │
│                │      return df.describe()           │
│                │  ```                               │
│                │                                     │
└────────────────┴─────────────────────────────────────┘
```

**Animation Details**:
- Streaming: characters appear with variable timing (30-80ms per char)
- Code blocks fade in when they complete
- TOC highlights smoothly scroll into view

**Success Criteria**:
- Markdown renders all elements correctly
- Code blocks have syntax highlighting
- Download produces valid .md file
- Print view is formatted correctly

#### Task 1.3.7: ProviderSelector Component
**Estimated**: 5 hours

**Deliverables**:
- [ ] `<ProviderSelector>`: Dropdown/modal for choosing provider
- [ ] `<ProviderCard>`: Visual selector with provider logo
- [ ] `<APIKeyInput>`: Secure input with show/hide toggle
- [ ] `<ModelSelector>`: Dropdown for selecting model
- [ ] `<ConnectionTest>`: Button that validates API key
  - Loading spinner during test
  - Success checkmark or error message

**Design Specifications**:
```
┌────────────────────────────────────────────────┐
│  Select AI Provider                            │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ ◉ Anthropic                     [logo]   │  │
│  │   Claude 3.5 Sonnet                      │  │
│  │   API Key: ••••••••••••••••  [👁️]       │  │
│  │   [Test Connection] ✅ Connected         │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ ○ OpenRouter                    [logo]   │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ ○ MiniMax                       [logo]   │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Save & Continue]                             │
└────────────────────────────────────────────────┘
```

**Success Criteria**:
- API keys are masked by default
- Connection test works for all 3 providers
- Selected provider persists to storage

#### Task 1.3.8: Settings Panel
**Estimated**: 4 hours

**Deliverables**:
- [ ] `<SettingsPanel>`: Route at `/settings`
- [ ] `<ThemeToggle>`: Light/Dark/System selector
- [ ] `<ProviderSettings>`: Manage API keys
- [ ] `<DataManagement>`: Export/Import sessions, clear data
- [ ] `<AboutSection>`: Version info, links

**Success Criteria**:
- Theme persists across sessions
- Data export produces valid JSON
- Clear data confirms before deleting

---

## Phase 1.4: Integration & Streaming (Week 7)

**Goal**: Connect all components together, implement real-time streaming, and ensure offline capabilities.

#### Task 1.4.1: Connect UI to Stores
**Estimated**: 6 hours

**Deliverables**:
- [ ] Wire `InterviewPanel` to `advisor-store`
- [ ] Wire `TemplateGallery` to template registry
- [ ] Wire `ClassificationResults` to classifier output
- [ ] Wire `DocumentViewer` to document generator
- [ ] Wire `ProviderSelector` to `provider-store`
- [ ] Add loading states throughout

**Success Criteria**:
- Full flow works: Start → Interview → Classification → Document
- State persists across page refreshes
- Loading skeletons appear appropriately

#### Task 1.4.2: Implement SSE Streaming
**Estimated**: 8 hours

**Deliverables**:
- [ ] Create Convex Action for API proxy (subscription mode)
- [ ] Implement client-side SSE consumer
- [ ] Connect streaming to `<StreamingText>` component
- [ ] Add abort controller for cancellation
- [ ] Handle reconnection on network failure

**Streaming Flow**:
```
Client → Convex Action → Provider API → SSE chunks → Client → UI Update
```

**Error Handling**:
- Network timeout: retry with exponential backoff
- Rate limit: show "Please wait" message with countdown
- Invalid key: prompt to update in settings

**Success Criteria**:
- Text streams character by character
- User can cancel generation
- Network errors show helpful messages

#### Task 1.4.3: PWA Manifest & Service Worker
**Estimated**: 4 hours

**Deliverables**:
- [ ] Create `manifest.json` with:
  - App name, description
  - Icons (192px, 512px, maskable)
  - Theme colors
  - Display: standalone
  - Start URL: /advisor
- [ ] Configure Vite PWA plugin for service worker
- [ ] Implement caching strategy:
  - Static assets: Cache First
  - API calls: Network First with fallback
  - Fonts: Cache First (long expiry)
- [ ] Add install prompt component

**Success Criteria**:
- Lighthouse PWA score: 100
- App installable on Chrome, Safari, Firefox, Edge
- Offline fallback page shows when network unavailable

#### Task 1.4.4: Offline Mode
**Estimated**: 4 hours

**Deliverables**:
- [ ] Detect offline state (navigator.onLine)
- [ ] Queue API calls when offline
- [ ] Sync when connection restored
- [ ] Show offline indicator in header
- [ ] Ensure IndexedDB operations work offline

**Behavior**:
- Interview can continue offline (saved to IndexedDB)
- Document generation requires network (show message)
- Sessions sync automatically when back online

**Success Criteria**:
- User can complete interview fully offline
- No data loss when going offline mid-session
- Clear indication of offline state

---

## Phase 1.5: Testing & Polish (Week 8)

**Goal**: Achieve 80%+ test coverage, fix all bugs, and polish every detail.

#### Task 1.5.1: Unit Tests
**Estimated**: 8 hours

**Deliverables**:
- [ ] Test interview state machine (all transitions)
- [ ] Test classification scoring algorithm
- [ ] Test document generator output
- [ ] Test provider adapters (mocked)
- [ ] Test Zustand stores
- [ ] Test utility functions

**Coverage Targets**:
- `lib/interview/`: 90%+
- `lib/classification/`: 90%+
- `lib/documentation/`: 85%+
- `lib/providers/`: 80%+
- `stores/`: 85%+

**Success Criteria**:
- All tests pass
- Coverage meets targets
- CI runs tests on every PR

#### Task 1.5.2: E2E Tests
**Estimated**: 6 hours

**Deliverables**:
- [ ] Happy path: Start → Complete Interview → Generate Document → Download
- [ ] Provider switching: Change provider mid-session
- [ ] Error recovery: Invalid API key, network failure
- [ ] Navigation: Back button, refresh, close tab
- [ ] PWA: Install, open standalone, offline

**Tools**: Playwright

**Success Criteria**:
- All E2E tests pass in CI
- Tests run on Chrome, Firefox, Safari
- Flaky tests are fixed or quarantined

#### Task 1.5.3: Accessibility Audit
**Estimated**: 4 hours

**Deliverables**:
- [ ] Run axe-core audit (fix all critical/serious)
- [ ] Test keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Test screen reader (VoiceOver, NVDA)
- [ ] Ensure color contrast meets WCAG AA
- [ ] Add skip-to-content link
- [ ] Ensure focus visible on all interactive elements

**Success Criteria**:
- Zero axe-core critical/serious issues
- Full keyboard navigation works
- Screen reader announces all states

#### Task 1.5.4: Performance Optimization
**Estimated**: 4 hours

**Deliverables**:
- [ ] Run Lighthouse performance audit
- [ ] Implement code splitting (React.lazy for routes)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add font-display: swap
- [ ] Minimize bundle size (analyze with vite-bundle-visualizer)
- [ ] Add preconnect hints for API domains

**Targets**:
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Bundle size: < 500KB gzipped

**Success Criteria**:
- Lighthouse performance: 90+
- Core Web Vitals all green
- TTI < 3s on 3G connection

#### Task 1.5.5: Mobile Responsiveness
**Estimated**: 4 hours

**Deliverables**:
- [ ] Test on iPhone SE, iPhone 14, Pixel 7, Galaxy S23
- [ ] Fix any layout issues on small screens
- [ ] Ensure touch targets are 44px minimum
- [ ] Test in landscape orientation
- [ ] Verify PWA works on mobile

**Focus Areas**:
- Interview panel: single column layout on mobile
- Sidebar: becomes bottom sheet or hamburger menu
- Document viewer: TOC becomes collapsible

**Success Criteria**:
- No horizontal scroll on mobile
- All interactions work with touch
- Readable text without zooming

#### Task 1.5.6: Bug Bash & Polish
**Estimated**: 6 hours

**Deliverables**:
- [ ] Fix all P0/P1 bugs discovered during testing
- [ ] Polish animations (no jank, correct timing)
- [ ] Ensure consistent spacing throughout
- [ ] Check typography hierarchy
- [ ] Verify dark mode works everywhere
- [ ] Test cross-browser (Chrome, Firefox, Safari, Edge)

**Polish Checklist**:
- [ ] No console errors
- [ ] All loading states have skeletons
- [ ] Error messages are user-friendly
- [ ] Empty states have illustrations/copy
- [ ] Focus states are visible
- [ ] Hover states are consistent

**Success Criteria**:
- Zero P0 bugs
- Fewer than 5 P1 bugs (documented)
- Visual polish matches design direction

---

## Deliverables Summary

### Phase 1.1 (Week 1-2)
- [ ] Project repository with tooling
- [ ] Vite + React + TypeScript setup
- [ ] Design system tokens
- [ ] shadcn/ui components
- [ ] Layout components
- [ ] Convex backend initialized

### Phase 1.2 (Week 3-4)
- [ ] 15 interview questions ported
- [ ] Zustand interview store
- [ ] IndexedDB storage layer
- [ ] Classification engine
- [ ] Document generator
- [ ] 5 agent templates
- [ ] 3 provider adapters

### Phase 1.3 (Week 5-6)
- [ ] Interview panel with all question types
- [ ] Template gallery
- [ ] Classification results
- [ ] Document viewer with Markdown rendering
- [ ] Provider selector
- [ ] Settings panel

### Phase 1.4 (Week 7)
- [ ] Full UI-to-store integration
- [ ] SSE streaming working
- [ ] PWA manifest + service worker
- [ ] Offline mode

### Phase 1.5 (Week 8)
- [ ] 80%+ unit test coverage
- [ ] E2E tests passing
- [ ] Accessibility audit passed
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] All bugs fixed

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Unit test coverage | 80%+ |
| E2E tests passing | 100% |
| Lighthouse Performance | 90+ |
| Lighthouse Accessibility | 100 |
| Lighthouse PWA | 100 |
| Core Web Vitals | All green |
| Bundle size (gzipped) | < 500KB |
| Mobile responsiveness | iOS + Android |
| Browser support | Chrome, Firefox, Safari, Edge |

---

## Dependencies & Prerequisites

### Before Starting
1. Bun installed (`curl -fsSL https://bun.sh/install | bash`)
2. Node.js 20+ (for some tooling)
3. Convex account (free tier sufficient)
4. Provider API keys for testing (Anthropic, OpenRouter, or MiniMax)

### External Dependencies
- Fonts: Self-hosted (Satoshi, General Sans, JetBrains Mono)
- Icons: Lucide React
- Markdown: react-markdown + remark-gfm
- Syntax highlighting: Prism.js or Shiki
- Animations: Framer Motion
- Storage: Dexie.js (IndexedDB wrapper)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Design scope creep | Lock design in Phase 1.1, defer polish to 1.5 |
| Provider API changes | Abstract behind adapters, mock in tests |
| IndexedDB limitations | Test on Safari early (stricter limits) |
| PWA quirks | Test install on each platform weekly |
| Performance issues | Measure early, optimize continuously |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up project repository** (Task 1.1.1)
3. **Download fonts** and prepare design assets
4. **Create Convex account** and project
5. **Begin Phase 1.1** implementation

---

*This plan is a living document. Update as implementation progresses.*
