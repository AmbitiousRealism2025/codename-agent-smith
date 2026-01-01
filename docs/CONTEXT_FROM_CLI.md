# Context from CLI Project

**Purpose**: This document extracts key concepts, code patterns, and lessons learned from the original CLI-based Agent Advisor project to inform the new PWA implementation.

**Source Project**: `/Users/ambrealismwork/Desktop/Coding-Projects/agent_advisor-minimax-mvp`

---

## Core Concepts to Preserve

### 1. Interview Flow Structure

The CLI project uses a **4-stage interview process** with **15 questions**:

**Stages**:
1. **Discovery** (Q1-Q3): Basic agent info, purpose, target audience
2. **Requirements** (Q4-Q9): Interaction style, capabilities, delivery channels
3. **Architecture** (Q10-Q13): Technical constraints, integrations, success metrics
4. **Output** (Q14-Q15): Preferences and additional notes

**Key Pattern**: Questions are organized by stage, with automatic stage progression when all questions in a stage are answered.

**File Reference**: `src/lib/interview/questions.ts`

---

## Key Files to Reference

### Business Logic (100% Reusable)

1. **Interview Questions** (`src/lib/interview/questions.ts`)
   - 15 well-designed questions covering all aspects of agent creation
   - Question types: `text`, `choice`, `multiselect`, `boolean`
   - Each question has: `id`, `stage`, `text`, `type`, `required`, `hint`, `options`
   - **Action**: Copy entire question structure to PWA

2. **State Manager** (`src/lib/interview/state-manager.ts`)
   - Core state machine managing interview flow
   - Methods: `getCurrentQuestion()`, `recordResponse()`, `skipCurrentQuestion()`, `advanceStage()`
   - Automatically maps responses to requirements object
   - **Action**: Adapt for React/Zustand (replace class with store)

3. **Classification Engine** (`src/lib/classification/classifier.ts`)
   - Scores each template based on requirements
   - Uses weighted scoring algorithm
   - Returns ranked recommendations with confidence scores
   - **Action**: Copy scoring logic verbatim

4. **Document Generator** (`src/lib/documentation/document-generator.ts`)
   - Generates comprehensive planning documents
   - 8 standardized sections: Overview, Requirements, Architecture, Phases, Security, Metrics, Risk, Deployment
   - Markdown output with proper formatting
   - **Action**: Reuse generator, update output for web display

5. **Agent Templates** (`src/templates/`)
   - 5 agent types: Data Analyst, Content Creator, Code Assistant, Research Agent, Automation Agent
   - Each template includes: description, capabilities, tools, dependencies, implementation guidance
   - **Action**: Copy all templates as-is

### Utilities (95% Reusable)

6. **Validation** (`src/utils/validation.ts`)
   - Zod schemas for all data structures
   - Input validators for each question type
   - **Action**: Copy all Zod schemas

7. **Types** (`src/types/`)
   - TypeScript interfaces for Interview, Agent, Requirements, etc.
   - **Action**: Copy all type definitions

### Architecture Patterns (Adapt for Web)

8. **Persistence** (`src/lib/interview/persistence.ts`)
   - File-based session storage (sessions/ directory)
   - JSON serialization with date handling
   - 7-day retention cleanup
   - **Action**: Replace with IndexedDB/Convex (preserve data structure)

9. **MCP Tool Handlers** (`src/lib/*/tool-handler.ts`)
   - Wrapper pattern around core business logic
   - Schema validation with Zod
   - Error handling
   - **Action**: Remove MCP layer, use direct function calls in React

---

## Interview Question Structure

### Complete Question List (15 questions):

```typescript
// Discovery Stage (3 questions)
q1_agent_name: "What is the name of your agent?"
  - Type: text, Required: true

q2_primary_outcome: "What is the primary outcome or goal this agent should achieve?"
  - Type: text, Required: true

q3_target_audience: "Who are the target users or audience for this agent?"
  - Type: multiselect, Required: true
  - Options: Developers, End Users, Business Analysts, Data Scientists, Product Managers, Customer Support, Other

// Requirements Stage (6 questions)
q4_interaction_style: "What interaction style should the agent use?"
  - Type: choice, Required: true
  - Options: conversational, task-focused, collaborative

q5_memory_requirements: "What level of memory/context retention is needed?"
  - Type: choice, Required: true
  - Options: none, short-term (single session), long-term (persistent across sessions)

q6_file_access: "Does the agent need to access or create files?"
  - Type: boolean, Required: true

q7_web_access: "Does the agent need web search or browsing capabilities?"
  - Type: boolean, Required: true

q8_code_execution: "Does the agent need to execute code or run commands?"
  - Type: boolean, Required: true

q9_data_analysis: "Will the agent perform data analysis or visualization?"
  - Type: boolean, Required: true

// Architecture Stage (4 questions)
q10_delivery_channels: "What delivery channels will the agent use?"
  - Type: multiselect, Required: true
  - Options: CLI, Web Interface, API, Chat Platform, Mobile App, Email, Webhook

q11_tool_integrations: "What external tools or APIs will the agent integrate with?"
  - Type: multiselect, Required: false
  - Options: GitHub, Slack, Google Drive, Notion, Airtable, Stripe, Custom APIs, None

q12_environment_preference: "Where will the agent primarily run?"
  - Type: choice, Required: true
  - Options: cloud (hosted service), local (user's machine), hybrid (both)

q13_success_metrics: "What metrics will define success for this agent?"
  - Type: multiselect, Required: false
  - Options: Task completion rate, Response time, User satisfaction, Cost efficiency, Accuracy, Custom metrics

// Output Stage (2 questions)
q14_constraints: "Are there any specific constraints or limitations?"
  - Type: text, Required: false

q15_additional_notes: "Any additional context or requirements?"
  - Type: text, Required: false
```

### Question Type Implementations

**For PWA**: Each question type maps to specific React components:

- `text` → `<Input>` or `<Textarea>` (shadcn/ui)
- `choice` → `<RadioGroup>` (shadcn/ui)
- `multiselect` → `<Checkbox>` group (shadcn/ui)
- `boolean` → `<Switch>` or `<Checkbox>` (shadcn/ui)

---

## State Management Pattern

### CLI Approach (Class-based):

```typescript
class InterviewStateManager {
  private state: InterviewState;

  constructor(sessionId?: string) {
    this.state = {
      sessionId: sessionId || randomUUID(),
      currentStage: 'discovery',
      currentQuestionIndex: 0,
      responses: [],
      requirements: {},
      recommendations: null,
      isComplete: false
    };
  }

  getCurrentQuestion(): InterviewQuestion | null {
    // Returns current question based on stage and index
  }

  recordResponse(questionId: string, value: any): void {
    // Records response, updates requirements, advances to next question
  }

  skipCurrentQuestion(): void {
    // Advances without recording response
  }

  advanceStage(): void {
    // Moves to next stage, resets question index
  }
}
```

### PWA Approach (Zustand Store):

```typescript
// Recommended conversion to Zustand

interface InterviewStore {
  // State
  sessionId: string;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  responses: Response[];
  requirements: Partial<AgentRequirements>;
  recommendations: AgentRecommendations | null;
  isComplete: boolean;

  // Computed
  currentQuestion: InterviewQuestion | null;
  progress: { current: number; total: number; percentage: number };

  // Actions
  initializeSession: (sessionId?: string) => void;
  recordResponse: (questionId: string, value: any) => void;
  skipQuestion: () => void;
  goToPreviousQuestion: () => void;
  setRecommendations: (recs: AgentRecommendations) => void;
  resetInterview: () => void;
}
```

**Key Changes**:
- Class → Zustand store (flat structure, reactive)
- Methods → Actions (pure functions)
- Add computed properties for UI (progress, current question)
- Add navigation helpers (previous question, reset)

---

## Template Structure

### 5 Agent Templates

Each template includes:

1. **Metadata**:
   - `id`: Unique identifier (e.g., "data-analyst")
   - `name`: Display name
   - `description`: One-line summary
   - `category`: Template category
   - `capabilityTags`: Searchable tags

2. **Documentation Sections** (8 sections):
   - Overview
   - Requirements
   - Architecture
   - Implementation
   - Testing
   - Deployment
   - Monitoring
   - Troubleshooting

3. **Implementation Guidance**:
   - Planning checklist
   - Architecture patterns
   - Risk considerations
   - Success criteria

**Templates**:
1. **Data Analyst** (`data-analyst.ts`)
   - CSV processing, statistics, visualization, reporting

2. **Content Creator** (`content-creator.ts`)
   - Blog posts, SEO optimization, multi-platform formatting

3. **Code Assistant** (`code-assistant.ts`)
   - Code review, refactoring, test generation, debugging

4. **Research Agent** (`research-agent.ts`)
   - Web search, content extraction, fact-checking, source verification

5. **Automation Agent** (`automation-agent.ts`)
   - Task scheduling, workflow orchestration, queue management

---

## Classification Algorithm

### Scoring Logic

```typescript
// Simplified scoring approach from classifier.ts

export function classifyAgentType(requirements: AgentRequirements): AgentRecommendations {
  const templates = getAllDocumentTemplates();
  const scores: TemplateScore[] = [];

  for (const template of templates) {
    let score = 0;

    // Match based on capabilities
    if (requirements.capabilities?.dataAnalysis && template.id === 'data-analyst') {
      score += 30;
    }

    // Match based on target audience
    if (requirements.targetAudience?.includes('Developers') && template.id === 'code-assistant') {
      score += 20;
    }

    // Match based on interaction style
    if (requirements.interactionStyle === 'conversational' && template.id === 'content-creator') {
      score += 15;
    }

    // ... more matching logic

    scores.push({ templateId: template.id, score, confidence: score / 100 });
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return {
    primary: scores[0],
    alternatives: scores.slice(1, 3),
    reasoning: generateReasoning(scores[0], requirements)
  };
}
```

**Key Insight**: Scoring is additive based on requirement matches. Higher score = better fit.

---

## Persistence Strategy

### CLI Approach (File-based):

```typescript
// src/lib/interview/persistence.ts

export async function saveSession(state: InterviewState): Promise<void> {
  const persistedState = {
    sessionId: state.sessionId,
    timestamp: new Date(),
    interviewState: state,
    partialRequirements: state.requirements,
    conversationMetadata: state.conversationMetadata
  };

  const filePath = `sessions/${state.sessionId}.json`;
  await fs.writeFile(filePath, JSON.stringify(persistedState, null, 2));
}

export async function loadSession(sessionId: string): Promise<InterviewState | null> {
  const filePath = `sessions/${sessionId}.json`;
  const data = await fs.readFile(filePath, 'utf-8');
  const persistedState = JSON.parse(data);
  return persistedState.interviewState;
}
```

### PWA Approach (IndexedDB):

```typescript
// Recommended IndexedDB approach using Dexie.js

class AdvisorDB extends Dexie {
  sessions: Dexie.Table<PersistedSession, string>;

  constructor() {
    super('AdvisorDB');
    this.version(1).stores({
      sessions: 'sessionId, timestamp'
    });
  }
}

const db = new AdvisorDB();

export async function saveSession(state: InterviewState): Promise<void> {
  await db.sessions.put({
    sessionId: state.sessionId,
    timestamp: Date.now(),
    interviewState: state,
    partialRequirements: state.requirements,
    conversationMetadata: state.conversationMetadata
  });
}

export async function loadSession(sessionId: string): Promise<InterviewState | null> {
  const session = await db.sessions.get(sessionId);
  return session?.interviewState || null;
}
```

**Key Changes**:
- File I/O → IndexedDB (asynchronous, unlimited storage)
- JSON serialization → Direct object storage
- Timestamp stored as number (not Date object)

---

## Document Generation Pattern

### CLI Output (Markdown string):

```typescript
export function generatePlanningDocument(
  requirements: AgentRequirements,
  template: DocumentTemplate
): string {
  let markdown = `# ${template.name} - Planning Document\n\n`;

  // Add each section
  for (const [key, section] of Object.entries(template.documentSections)) {
    markdown += `## ${section.title}\n\n`;
    markdown += `${section.content}\n\n`;
  }

  return markdown;
}
```

### PWA Approach (Markdown + React Component):

**Backend** (same logic):
```typescript
// Generate Markdown string (reuse CLI logic)
const markdownContent = generatePlanningDocument(requirements, template);
```

**Frontend** (render with react-markdown):
```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function DocumentViewer({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**Additional Features for Web**:
- Table of contents (extract headings from Markdown)
- Copy code blocks (syntax highlighting with Prism.js)
- Download as file (Blob + trigger download)
- Print view (CSS print styles)

---

## Lessons Learned from CLI Project

### What Worked Well ✅

1. **15-Question Interview Flow**: Perfect balance of comprehensive vs. not overwhelming
2. **4-Stage Organization**: Clear progression through discovery → requirements → architecture → output
3. **Automatic Stage Advancement**: Smooth UX, no manual stage selection needed
4. **Template-Based Classification**: Scoring algorithm is simple but effective
5. **Document Generator**: 8-section structure provides comprehensive guidance
6. **Zod Validation**: Type-safe validation caught many errors early

### What to Improve 🔄

1. **Session Management**: File-based storage is fragile, use database (IndexedDB/Convex)
2. **Error Handling**: More user-friendly error messages in UI
3. **Progress Indicators**: Add visual progress (ring/bar) showing completion percentage
4. **Question Navigation**: Allow going back to previous questions (currently one-way)
5. **Draft Auto-Save**: Save answers as user types (every 3 seconds)
6. **Skip Functionality**: Make it more obvious which questions are optional
7. **Template Preview**: Show template details before starting interview
8. **Multi-Provider Support**: Generalize from MiniMax-only to multi-provider

### Architectural Decisions to Keep

1. **Separation of Concerns**: Interview logic separate from UI
2. **Template Registry Pattern**: Easy to add new templates
3. **Markdown Output**: Universal format, easy to copy/share
4. **Stateless Functions**: Business logic functions are pure (testable)

### Architectural Decisions to Change

1. **CLI-Specific Code**: Remove readline, process.stdout, MCP wrappers
2. **File System**: Replace with IndexedDB for local, Convex for cloud
3. **Single Provider**: Add provider abstraction layer
4. **Linear Flow**: Add ability to navigate backwards
5. **No Collaboration**: Add session sharing (Stage 2+)

---

## Code Snippets Worth Preserving

### 1. Auto-Advancing Stage Logic

```typescript
// From state-manager.ts
recordResponse(questionId: string, value: any): void {
  // Record response
  this.state.responses.push({ questionId, value, timestamp: new Date() });

  // Update requirements from response
  this.updateRequirementsFromResponse(questionId, value);

  // Advance to next question
  this.state.currentQuestionIndex++;

  // Check if stage is complete
  const currentStageQuestions = this.getQuestionsForStage(this.state.currentStage);
  if (this.state.currentQuestionIndex >= currentStageQuestions.length) {
    this.advanceStage();  // Auto-advance to next stage
  }
}
```

**Why preserve**: This pattern ensures smooth progression without manual stage selection.

### 2. Requirements Mapping Logic

```typescript
// Maps question responses to requirements object
private updateRequirementsFromResponse(questionId: string, value: any): void {
  switch (questionId) {
    case 'q1_agent_name':
      this.state.requirements.name = value as string;
      break;
    case 'q4_interaction_style':
      this.state.requirements.interactionStyle = value as 'conversational' | 'task-focused' | 'collaborative';
      break;
    case 'q6_file_access':
      if (!this.state.requirements.capabilities) {
        this.state.requirements.capabilities = {};
      }
      this.state.requirements.capabilities.fileAccess = value as boolean;
      break;
    // ... more mappings
  }
}
```

**Why preserve**: Direct mapping from responses to typed requirements ensures data consistency.

### 3. Template Scoring

```typescript
// Simplified scoring logic
function scoreTemplate(requirements: AgentRequirements, template: DocumentTemplate): number {
  let score = 0;

  // Capability matches
  if (requirements.capabilities?.dataAnalysis && template.capabilityTags.includes('data-analysis')) {
    score += 30;
  }

  // Audience matches
  if (requirements.targetAudience?.includes('Developers') && template.capabilityTags.includes('development')) {
    score += 20;
  }

  return score;
}
```

**Why preserve**: Simple additive scoring is transparent and easy to debug.

---

## Directory Structure to Reference

```
agent_advisor-minimax-mvp/
├── src/
│   ├── lib/
│   │   ├── interview/
│   │   │   ├── state-manager.ts        ⭐ Core logic
│   │   │   ├── questions.ts             ⭐ 15 questions
│   │   │   ├── validation.ts            ⭐ Validators
│   │   │   ├── persistence.ts           ⚠️ Replace with IndexedDB
│   │   │   └── tool-handler.ts          ⚠️ Remove MCP wrapper
│   │   ├── classification/
│   │   │   ├── classifier.ts            ⭐ Scoring algorithm
│   │   │   ├── scoring.ts               ⭐ Template matching
│   │   │   └── tool-handler.ts          ⚠️ Remove MCP wrapper
│   │   ├── documentation/
│   │   │   ├── document-generator.ts    ⭐ Planning doc generator
│   │   │   └── planning-tool.ts         ⚠️ Remove MCP wrapper
│   │   └── export/                      ❌ Not needed (web downloads)
│   ├── templates/
│   │   ├── data-analyst.ts              ⭐ Copy all 5 templates
│   │   ├── content-creator.ts
│   │   ├── code-assistant.ts
│   │   ├── research-agent.ts
│   │   ├── automation-agent.ts
│   │   ├── sections/index.ts            ⭐ 8 standard sections
│   │   ├── template-types.ts            ⭐ TypeScript types
│   │   └── index.ts                     ⭐ Template registry
│   ├── types/
│   │   ├── interview.ts                 ⭐ Copy all types
│   │   ├── agent.ts
│   │   └── template.ts
│   ├── utils/
│   │   ├── validation.ts                ⭐ Zod schemas
│   │   └── minimax-config.ts            ⚠️ Refactor to provider abstraction
│   ├── advisor-agent.ts                 ⚠️ Streaming logic (adapt for web)
│   └── cli.ts                           ❌ CLI-specific (don't copy)
└── sessions/                            ❌ File storage (replace with IndexedDB)
```

**Legend**:
- ⭐ Copy/adapt for PWA
- ⚠️ Needs modification
- ❌ Don't copy (CLI-specific)

---

## Next Steps

When building the PWA, reference this document for:

1. **Interview Questions**: Copy exact question text, types, and options
2. **State Logic**: Adapt state machine pattern to Zustand
3. **Classification**: Reuse scoring algorithm verbatim
4. **Templates**: Copy all 5 templates without changes
5. **Validation**: Copy all Zod schemas
6. **Types**: Copy all TypeScript interfaces

**Key Principle**: Preserve the **business logic** (what the app does), replace the **infrastructure** (how it works under the hood).
