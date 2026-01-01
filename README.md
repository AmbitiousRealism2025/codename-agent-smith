# Agent Advisor PWA (2026 Project)

**Status**: Planning Phase
**Version**: 1.0.0-alpha
**Target**: Stage 1 MVP (6-8 weeks)

---

## Overview

A modern, professional Progressive Web App (PWA) that guides "Vibe Coders" (intermediate+ developers) through creating custom Claude Agent SDK applications. Features a sharp, polished UI with multi-provider API support and hybrid deployment options.

---

## Quick Links

- **Master Plan**: [docs/MASTER_PLAN.md](./docs/MASTER_PLAN.md)
- **CLI Context**: [docs/CONTEXT_FROM_CLI.md](./docs/CONTEXT_FROM_CLI.md)
- **Original CLI Project**: `/Users/ambrealismwork/Desktop/Coding-Projects/agent_advisor-minimax-mvp`

---

## Tech Stack

### Frontend
- React 18.3 + TypeScript
- Vite 6
- TailwindCSS v3
- shadcn/ui
- Zustand (state management)
- Framer Motion (animations)

### Backend
- Convex (backend-as-a-service)
- IndexedDB (local persistence)
- Dexie.js (IndexedDB wrapper)

### Development
- Bun (runtime & package manager)
- Vitest (testing)
- Playwright (E2E testing)

---

## Project Structure

```
agent-advisor-pwa/
├── packages/web/       # React PWA application
├── convex/             # Convex backend
├── docs/               # Documentation
└── README.md           # This file
```

---

## Development Roadmap

### Stage 1: MVP (6-8 weeks)
- Interview flow (15 questions)
- Classification engine (5 templates)
- Document generation
- 3 provider integrations (Anthropic, OpenRouter, MiniMax)
- Self-hosted mode (IndexedDB + local API keys)
- PWA installable
- 80%+ test coverage

### Stage 2: Features (4-6 weeks)
- User authentication (Clerk)
- Session history
- Template customization
- Additional providers (GLM, OpenAI)
- Export formats (PDF, HTML)

### Stage 3: Polish (4-6 weeks)
- Subscription billing
- Analytics dashboard
- Multi-language support
- Advanced features

---

## Getting Started

**Note**: Project setup in progress. See [docs/MASTER_PLAN.md](./docs/MASTER_PLAN.md) for detailed implementation plan.

---

## Contributing

This project is in active planning/development. Contributions welcome after MVP release.

---

## License

TBD

---

## Contact

Project Owner: [@AmbitiousRealism2025](https://github.com/AmbitiousRealism2025)
