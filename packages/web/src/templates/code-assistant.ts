import { createDocumentTemplate } from './template-types';
import { SECTION_TEMPLATES } from './sections/index';
import type { DocumentTemplate } from './template-types';

export const codeAssistantDocumentTemplate: DocumentTemplate = createDocumentTemplate({
  id: 'code-assistant',
  name: 'Code Assistant Agent',
  description:
    'Specializes in code review, refactoring suggestions, test generation, and debugging assistance. Ideal for code quality improvement, technical debt reduction, and development workflows.',
  capabilityTags: ['code-review', 'refactoring', 'testing', 'debugging', 'development'],
  idealFor: [
    'Automated code review and quality checks',
    'Refactoring legacy code and technical debt reduction',
    'Test case generation and coverage improvement',
    'Debugging assistance and root cause analysis',
    'Code documentation and explanation',
  ],

  documentSections: {
    overview: {
      ...SECTION_TEMPLATES.overview,
      examples: [
        'This Code Assistant agent reviews code quality, suggests refactorings, generates unit tests, and assists with debugging complex issues.',
        'Key capabilities: Multi-language code review (TypeScript, Python, JavaScript, Go, Rust), refactoring suggestions with patterns, unit test generation with frameworks, debugging analysis with stack trace interpretation',
        'Ideal for: developers seeking code quality feedback, teams reducing technical debt, QA engineers improving test coverage, engineers debugging production issues',
        'Prerequisites: Node.js 18+, MiniMax API access, familiarity with target programming languages and testing frameworks'
      ]
    },

    architecture: {
      ...SECTION_TEMPLATES.architecture,
      contentGuidance: [
        ...SECTION_TEMPLATES.architecture.contentGuidance,
        'Code Assistant specific: Describe code parsing and AST analysis, pattern matching for code smells, test generation strategy, debugging heuristics'
      ],
      examples: [
        'Components: Code Parser → Quality Analyzer → Refactoring Engine → Test Generator → Documentation Builder',
        'Uses AST (Abstract Syntax Tree) parsing for structural code analysis',
        'Pattern matching engine detects code smells, anti-patterns, and improvement opportunities',
        'Test generator creates framework-specific tests (Jest, Pytest, Go testing, Cargo test)',
        'Debugging analyzer interprets stack traces, identifies error patterns, suggests fixes'
      ]
    },

    implementation: {
      ...SECTION_TEMPLATES.implementation,
      subsections: [
        'Project Structure',
        'Code Review Tool',
        'Refactoring Tool',
        'Test Generation Tool',
        'Debug Analysis Tool',
        'Configuration'
      ],
      contentGuidance: [
        'Implement review_code tool: accepts code, language, reviewType (quality/security/performance/style); returns issues array with severity, line numbers, suggestions',
        'Implement suggest_refactoring tool: accepts code, language, focus (readability/performance/maintainability); returns refactoring suggestions with before/after examples',
        'Implement generate_tests tool: accepts code, language, framework, coverageTargets; returns unit test code with assertions',
        'Implement analyze_debug_info tool: accepts stackTrace, errorMessage, context (logs/code); returns root cause analysis and fix suggestions',
        'Use Zod schemas for input validation on all tools',
        'Implement AST parsing for supported languages (TypeScript, Python, JavaScript, Go, Rust)',
        'Integrate static analysis tools (ESLint, Pylint, clippy) for automated checks',
        'Environment variables: MINIMAX_JWT_TOKEN (required), LOG_LEVEL (optional, default: info), SUPPORTED_LANGUAGES (optional, default: all)'
      ],
      examples: [
        'src/tools/review-code.ts - Code review engine with language-specific analyzers',
        'src/tools/suggest-refactoring.ts - Refactoring pattern matcher and suggestion generator',
        'src/tools/generate-tests.ts - Test case generator for Jest/Pytest/Go/Cargo',
        'src/tools/analyze-debug.ts - Stack trace parser and debugging assistant',
        'src/parsers/ - AST parsers for TypeScript, Python, JavaScript, Go, Rust',
        'src/analyzers/ - Code quality analyzers (complexity, duplication, smell detection)'
      ]
    },

    testing: {
      ...SECTION_TEMPLATES.testing,
      contentGuidance: [
        'Unit tests: Each tool function with various code samples, Zod validation edge cases, AST parsing accuracy, pattern detection precision',
        'Integration tests: Complete workflow (review → refactor → test generation), multi-language support verification, debugging scenario coverage',
        'E2E tests: Real code samples from open source projects, complex refactoring scenarios, test generation for various frameworks',
        'Test data: Include sample code with known issues, edge cases (syntax errors, incomplete code), test generation fixtures',
        'Target 90%+ code coverage on core analysis and generation logic'
      ],
      examples: [
        'tests/unit/tools/review-code.test.ts - Test code review for all languages, verify issue detection accuracy',
        'tests/unit/tools/generate-tests.test.ts - Verify test generation for Jest/Pytest/Go/Cargo, check assertion coverage',
        'tests/integration/code-assistant-workflow.test.ts - Full pipeline from review through test generation',
        'tests/fixtures/sample-code/ - Code samples with known quality issues (complexity, duplication, smells)',
        'tests/fixtures/stack-traces/ - Real stack traces for debugging analysis testing'
      ]
    },

    deployment: {
      ...SECTION_TEMPLATES.deployment,
      contentGuidance: [
        'Prerequisites: Node.js 18+, npm/yarn, MiniMax API JWT token',
        'Build: npm install && npm run build (TypeScript compilation to dist/)',
        'Environment setup: Copy .env.example to .env, set MINIMAX_JWT_TOKEN',
        'Deployment options: CLI tool for local development, CI/CD integration (GitHub Actions, GitLab CI), IDE extension/plugin',
        'For CI/CD: Configure as pre-commit hook or PR review bot',
        'For IDE integration: Package as VS Code extension, JetBrains plugin'
      ],
      examples: [
        'npm install && npm run build',
        'Set environment: MINIMAX_JWT_TOKEN=your_jwt_token',
        'Deploy as CLI: code-assistant review --file src/app.ts',
        'GitHub Action: .github/workflows/code-review.yml with code-assistant',
        'VS Code extension: publish to marketplace with language server integration'
      ]
    },

    monitoring: {
      ...SECTION_TEMPLATES.monitoring,
      contentGuidance: [
        'Track: Code review time per file, refactoring suggestion count, test generation success rate, API request count, error detection accuracy',
        'Log: ERROR for parsing failures, WARN for potential false positives, INFO for successful reviews, DEBUG for detailed AST analysis',
        'Alert on: parsing error rate >5%, review time >60s per file, API quota >90%, test generation failure rate >10%',
        'Dashboard: Show daily review count, issue severity distribution, refactoring acceptance rate, test coverage improvement'
      ],
      examples: [
        'Metrics: code_review_duration_ms, issues_detected_count, refactoring_suggestions_count, test_generation_success_rate',
        'Logging: logger.error("AST parsing failed", { file, language, error }), logger.warn("High complexity detected", { file, metric })',
        'Grafana/Prometheus dashboards: Review time P50/P95, issue severity breakdown, language distribution',
        'Alerts: PagerDuty/Slack on parsing_error_rate >5% for 15 minutes, review_time_p95 >120s'
      ]
    },

    troubleshooting: {
      ...SECTION_TEMPLATES.troubleshooting,
      subsections: [
        'Code Review Issues',
        'Refactoring Problems',
        'Test Generation Failures',
        'Debugging Analysis Errors',
        'Language Support Issues'
      ],
      contentGuidance: [
        'Code Review Issues: Parsing errors for complex syntax, false positives in issue detection, missing language support, incorrect severity ratings',
        'Refactoring Problems: Unsafe refactoring suggestions, breaking changes not detected, context-insensitive recommendations',
        'Test Generation Failures: Framework incompatibility, incorrect assertion generation, missing edge cases, type inference errors',
        'Debugging Analysis Errors: Stack trace parsing failures, incorrect root cause identification, unhelpful fix suggestions',
        'Language Support Issues: Unsupported language version, syntax not recognized, framework-specific patterns missed'
      ],
      examples: [
        'Issue: "Parsing error for TypeScript file" → Check TypeScript version compatibility, verify syntax validity, try simpler code subset',
        'Issue: "False positive code smell" → Review detection heuristics, adjust severity thresholds, add exception patterns',
        'Issue: "Generated tests fail to compile" → Verify framework version, check import paths, validate type annotations',
        'Issue: "Stack trace not parsed" → Check trace format (Node.js, Python, Go, Rust differ), verify error message structure',
        'Enable DEBUG logging: LOG_LEVEL=debug for detailed AST output, pattern matching results, test generation steps'
      ]
    },

    maintenance: {
      ...SECTION_TEMPLATES.maintenance,
      contentGuidance: [
        'Weekly: Review false positive reports and adjust detection rules, check for new language features support',
        'Monthly: Update AST parsers for language version changes, refresh refactoring patterns, update test framework templates',
        'Quarterly: Evaluate new code quality metrics, benchmark against industry standards, add support for new languages/frameworks',
        'Continuous: Monitor language spec changes (TypeScript, Python, Rust), keep static analysis tools updated, maintain IDE extension compatibility'
      ],
      examples: [
        'Weekly: Analyze false positive reports → refine detection heuristics → reduce noise',
        'Monthly: npm update typescript @babel/parser eslint, update Jest/Pytest templates',
        'Quarterly: Add support for new language (e.g., Zig, Gleam), benchmark code review accuracy against SonarQube',
        'Backup: Archive code review history and metrics to data warehouse for trend analysis'
      ]
    }
  },

  planningChecklist: [
    'Define target programming languages (TypeScript, Python, JavaScript, Go, Rust)',
    'Identify review types (quality, security, performance, style)',
    'Select refactoring patterns (extract method, reduce complexity, remove duplication)',
    'Determine test frameworks (Jest, Pytest, Go testing, Cargo test)',
    'Plan AST parsing strategy (babel, typescript compiler API, tree-sitter)',
    'Choose static analysis tools to integrate (ESLint, Pylint, clippy)',
    'Design issue severity classification (error, warning, info, hint)',
    'Define code quality metrics (complexity, duplication, maintainability)',
    'Plan debugging analysis approach (stack trace parsing, error pattern matching)',
    'Determine deployment environment (CLI, CI/CD, IDE extension)',
    'Establish monitoring and accuracy metrics'
  ],

  architecturePatterns: [
    'Pipeline Architecture: Parser → Analyzer → Suggestion Generator → Formatter',
    'Language-agnostic Core: Generic analysis engine with language-specific adapters',
    'AST-based Analysis: Use abstract syntax trees for structural code understanding',
    'Pattern Matching: Detect code smells and anti-patterns using pattern libraries',
    'Framework Adapters: Support multiple test frameworks with adapter pattern',
    'Incremental Analysis: Analyze only changed code in CI/CD contexts',
    'Plugin System: Extensible architecture for adding new languages and rules'
  ],

  riskConsiderations: [
    'False Positives: Code review may flag valid patterns as issues',
    'Breaking Changes: Refactoring suggestions might break code if applied incorrectly',
    'Test Coverage: Generated tests may not cover all edge cases',
    'Language Support: Keeping up with rapid language evolution (TypeScript, Rust)',
    'Performance: AST parsing and analysis may be slow for large codebases',
    'Security: Static analysis may miss runtime security vulnerabilities',
    'API Rate Limits: MiniMax API quota exhaustion during bulk code review'
  ],

  successCriteria: [
    'Successfully parse and analyze code in all supported languages without syntax errors',
    'Detect common code smells with >90% accuracy (verified against known samples)',
    'Generate refactoring suggestions that compile and pass existing tests',
    'Create unit tests achieving minimum 70% code coverage for target functions',
    'Parse and analyze stack traces from all supported languages/runtimes',
    'Review typical file (500 lines) in <15 seconds',
    'False positive rate <10% on code review issues',
    '90%+ test coverage on analysis and generation logic',
    'Clear, actionable issue descriptions with line numbers and fix suggestions',
    'Documentation includes examples for each language and review type'
  ],

  implementationGuidance: [
    '1. Start with code parsing: Implement AST parsers for each language using libraries (typescript compiler API, @babel/parser, tree-sitter), validate parsing accuracy with test suites',
    '2. Build code review engine: Create pattern matchers for code smells (complexity, duplication, god objects), implement severity classification, integrate static analysis tools',
    '3. Implement refactoring suggester: Define refactoring patterns (extract method, rename, inline, move), implement before/after code generation, validate suggestions compile',
    '4. Create test generator: Build test templates for each framework, implement assertion generation based on function signatures, add edge case detection',
    '5. Build debugging analyzer: Parse stack traces for all languages, implement error pattern matching, generate fix suggestions based on common issues',
    '6. Add validation layers: Zod schemas on all inputs, AST validation, code compilation checks for generated code',
    '7. Implement error handling: Graceful degradation for partial code, detailed error messages with context, logging for analysis failures',
    '8. Write comprehensive tests: Unit test each tool with various code samples, integration test full workflows, validate against real open source projects',
    '9. Optimize for performance: Cache AST parsing results, parallelize analysis across files, implement incremental analysis for CI/CD',
    '10. Document thoroughly: Include JSDoc on all functions, provide code examples for each language, document pattern detection heuristics and tuning'
  ]
});

export const codeAssistantTemplate = {
  id: codeAssistantDocumentTemplate.id,
  name: codeAssistantDocumentTemplate.name,
  description: codeAssistantDocumentTemplate.description,
  capabilityTags: codeAssistantDocumentTemplate.capabilityTags,
  idealFor: codeAssistantDocumentTemplate.idealFor,
  systemPrompt: 'You are a code assistant agent specializing in code review, refactoring, test generation, and debugging.',
  defaultTools: [],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk'],
  recommendedIntegrations: ['GitHub API', 'GitLab API']
};
