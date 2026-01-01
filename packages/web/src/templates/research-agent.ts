import { createDocumentTemplate } from './template-types';
import { SECTION_TEMPLATES } from './sections/index';
import type { DocumentTemplate } from './template-types';

export const researchAgentDocumentTemplate: DocumentTemplate = createDocumentTemplate({
  id: 'research-agent',
  name: 'Research Agent',
  description:
    'Specializes in web search, content extraction, fact-checking, and source verification. Ideal for information gathering, competitive research, and knowledge synthesis.',
  capabilityTags: ['web-search', 'data-extraction', 'fact-checking', 'research', 'synthesis'],
  idealFor: [
    'Competitive research and market analysis',
    'Automated fact-checking and source verification',
    'Content aggregation and knowledge synthesis',
    'Due diligence and background research',
    'Literature review and citation gathering',
  ],

  documentSections: {
    overview: {
      ...SECTION_TEMPLATES.overview,
      examples: [
        'This Research Agent performs web searches, extracts content from web pages, verifies facts against multiple sources, and synthesizes findings into structured reports.',
        'Key capabilities: Multi-engine web search (Google, Bing, DuckDuckGo), HTML content extraction with readability parsing, fact verification with source credibility scoring, citation management and bibliography generation',
        'Ideal for: researchers gathering literature, analysts conducting competitive intelligence, journalists fact-checking claims, students compiling research papers',
        'Prerequisites: Node.js 18+, MiniMax API access, web search API keys (optional), familiarity with research methodologies'
      ]
    },

    architecture: {
      ...SECTION_TEMPLATES.architecture,
      contentGuidance: [
        ...SECTION_TEMPLATES.architecture.contentGuidance,
        'Research Agent specific: Describe web search orchestration, content extraction pipeline, fact verification algorithm, source credibility scoring system'
      ],
      examples: [
        'Components: Search Orchestrator → Content Extractor → Fact Verifier → Synthesis Engine → Report Generator',
        'Uses multiple search engines for comprehensive coverage (Google Custom Search, Bing Search API, DuckDuckGo)',
        'Content extraction with readability parsing (Readability.js, Mozilla Readability)',
        'Fact verification through multi-source cross-referencing and credibility scoring',
        'Synthesis engine uses Claude API for summarization and insight generation'
      ]
    },

    implementation: {
      ...SECTION_TEMPLATES.implementation,
      subsections: [
        'Project Structure',
        'Web Search Tool',
        'Content Extraction Tool',
        'Fact Verification Tool',
        'Synthesis Tool',
        'Configuration'
      ],
      contentGuidance: [
        'Implement search_web tool: accepts query, searchEngines (array), maxResults, dateRange, domain filters; returns search results with URLs, titles, snippets',
        'Implement extract_content tool: accepts url, extractionMode (full/main/summary), includeMetadata; returns cleaned text, metadata (author, date, domain)',
        'Implement verify_facts tool: accepts claim, sources (array of URLs), minSources; returns verification result (true/false/uncertain), confidence score, supporting/contradicting evidence',
        'Implement synthesize_research tool: accepts findings (array), synthesisType (summary/analysis/report), includesCitations; returns synthesized content with citations',
        'Use Zod schemas for input validation on all tools',
        'Implement rate limiting for web requests (respect robots.txt, API quotas)',
        'Implement caching layer for search results and extracted content (reduce redundant requests)',
        'Environment variables: MINIMAX_JWT_TOKEN (required), GOOGLE_SEARCH_API_KEY (optional), BING_SEARCH_API_KEY (optional), LOG_LEVEL (optional, default: info)'
      ],
      examples: [
        'src/tools/search-web.ts - Multi-engine search orchestrator with result deduplication',
        'src/tools/extract-content.ts - Web scraper with readability parsing and metadata extraction',
        'src/tools/verify-facts.ts - Fact checker with cross-referencing and credibility scoring',
        'src/tools/synthesize-research.ts - Research synthesizer with citation management',
        'src/utils/credibility.ts - Source credibility scoring (domain authority, bias detection)',
        'src/utils/cache.ts - Response caching with TTL and invalidation strategies'
      ]
    },

    testing: {
      ...SECTION_TEMPLATES.testing,
      contentGuidance: [
        'Unit tests: Each tool function with mocked HTTP responses, Zod validation edge cases, credibility scoring accuracy, synthesis quality',
        'Integration tests: Complete workflow (search → extract → verify → synthesize), multi-source fact verification, citation formatting',
        'E2E tests: Real web searches (with recorded responses), actual content extraction from sample URLs, fact verification scenarios',
        'Test data: Include sample search results, HTML pages with various structures, fact-checking test cases with known outcomes',
        'Target 85%+ code coverage on core search, extraction, and verification logic'
      ],
      examples: [
        'tests/unit/tools/search-web.test.ts - Test search with mocked API responses, verify result deduplication',
        'tests/unit/tools/verify-facts.test.ts - Verify fact-checking logic with known true/false claims',
        'tests/integration/research-workflow.test.ts - Full pipeline from search through synthesized report',
        'tests/fixtures/search-results.json - Sample search results from Google/Bing/DuckDuckGo',
        'tests/fixtures/sample-pages/ - HTML pages with various content structures for extraction testing',
        'tests/fixtures/fact-check-cases.json - Known fact-checking scenarios with expected outcomes'
      ]
    },

    deployment: {
      ...SECTION_TEMPLATES.deployment,
      contentGuidance: [
        'Prerequisites: Node.js 18+, npm/yarn, MiniMax API JWT token, optional search API keys',
        'Build: npm install && npm run build (TypeScript compilation to dist/)',
        'Environment setup: Copy .env.example to .env, set MINIMAX_JWT_TOKEN and search API keys',
        'Deployment options: Research API service (Express/Fastify), serverless function (AWS Lambda), scheduled research jobs (cron)',
        'For API service: Implement rate limiting, request queuing for large research tasks',
        'For scheduled jobs: Use job queue (Bull, BullMQ) for background research tasks'
      ],
      examples: [
        'npm install && npm run build',
        'Set environment: MINIMAX_JWT_TOKEN=your_jwt_token, GOOGLE_SEARCH_API_KEY=your_key',
        'Deploy as Express API: app.listen(3000), endpoints /search, /extract, /verify, /synthesize',
        'Deploy to AWS Lambda: 1GB memory, 5min timeout for comprehensive research tasks',
        'Scheduled research: cron job running research-agent daily for competitor monitoring'
      ]
    },

    monitoring: {
      ...SECTION_TEMPLATES.monitoring,
      contentGuidance: [
        'Track: Search request count, content extraction time, fact verification accuracy, API quota usage (Google/Bing), cache hit rate',
        'Log: ERROR for network failures or extraction errors, WARN for low credibility sources (<0.5), INFO for successful research tasks, DEBUG for detailed search results and extraction steps',
        'Alert on: API quota >90%, extraction failure rate >10%, fact verification timeout rate >5%, cache miss rate >30%',
        'Dashboard: Show daily search volume, fact verification accuracy trends, source credibility distribution, synthesis report count'
      ],
      examples: [
        'Metrics: search_requests_total, content_extraction_duration_ms, fact_verification_accuracy, api_quota_usage_percent, cache_hit_rate',
        'Logging: logger.error("Content extraction failed", { url, error }), logger.warn("Low credibility source", { domain, score })',
        'Datadog/New Relic dashboards: Search volume, extraction time P50/P95, credibility score distribution',
        'Alerts: PagerDuty/Slack on api_quota >90%, extraction_failure_rate >10% for 15 minutes'
      ]
    },

    troubleshooting: {
      ...SECTION_TEMPLATES.troubleshooting,
      subsections: [
        'Search Issues',
        'Content Extraction Failures',
        'Fact Verification Problems',
        'Synthesis Errors',
        'Rate Limiting and Quota Issues'
      ],
      contentGuidance: [
        'Search Issues: No results returned, API key errors, rate limiting, search engine blocking, irrelevant results',
        'Content Extraction Failures: Paywall detection, JavaScript-rendered content not accessible, malformed HTML, robots.txt blocking',
        'Fact Verification Problems: Insufficient sources found, contradicting evidence with no clear verdict, low credibility sources, biased sources',
        'Synthesis Errors: Poor quality summaries, missing citations, factual errors in synthesis, inconsistent formatting',
        'Rate Limiting and Quota Issues: API quota exhaustion, IP blocking from excessive requests, cache not effective'
      ],
      examples: [
        'Issue: "No search results" → Check API key validity, verify quota not exhausted, try alternative search engine, simplify query',
        'Issue: "Content extraction failed" → Check if site requires JavaScript rendering (use Playwright), verify URL accessible, check for paywalls',
        'Issue: "Fact verification uncertain" → Increase minSources parameter, use higher credibility sources, check for source bias',
        'Issue: "API quota exhausted" → Implement caching layer, reduce redundant searches, use free search engines (DuckDuckGo), upgrade API plan',
        'Enable DEBUG logging: LOG_LEVEL=debug for detailed search results, HTML extraction steps, credibility scoring details'
      ]
    },

    maintenance: {
      ...SECTION_TEMPLATES.maintenance,
      contentGuidance: [
        'Weekly: Review fact verification accuracy and adjust credibility scoring, check API quota usage trends',
        'Monthly: Update content extraction patterns for common websites, refresh search engine integrations, clean cache of stale entries',
        'Quarterly: Evaluate new search APIs and data sources, benchmark fact verification against human reviewers, update credibility scoring algorithms',
        'Continuous: Monitor search engine API changes, keep web scraping libraries updated (Playwright, Cheerio), maintain robots.txt compliance'
      ],
      examples: [
        'Weekly: Analyze fact verification mismatches → adjust credibility thresholds → improve accuracy',
        'Monthly: npm update playwright cheerio @mozilla/readability, update Google/Bing API clients',
        'Quarterly: Add new search engine (e.g., Brave Search API), benchmark credibility scoring against MediaBias/FactCheck',
        'Backup: Archive research reports and cache to S3 with 90-day retention policy'
      ]
    }
  },

  planningChecklist: [
    'Define target search engines (Google Custom Search, Bing Search API, DuckDuckGo)',
    'Identify content extraction needs (full text, main content, summary, metadata)',
    'Select fact verification approach (multi-source cross-referencing, credibility scoring)',
    'Determine synthesis types (summary, analysis, report, literature review)',
    'Plan source credibility scoring system (domain authority, bias detection, publication reputation)',
    'Design caching strategy (search results, extracted content, TTL policies)',
    'Choose web scraping approach (HTTP requests vs browser automation)',
    'Define citation management format (APA, MLA, Chicago, BibTeX)',
    'Plan rate limiting and quota management',
    'Determine deployment environment (API service, serverless, scheduled jobs)',
    'Establish monitoring and accuracy metrics'
  ],

  architecturePatterns: [
    'Pipeline Architecture: Search → Extract → Verify → Synthesize → Report',
    'Multi-source Aggregation: Query multiple search engines and aggregate results',
    'Caching Layer: Cache search results and extracted content to reduce redundant requests',
    'Credibility Scoring: Score sources based on domain authority, bias, publication reputation',
    'Content Normalization: Extract and normalize content from various HTML structures',
    'Citation Management: Track sources and generate properly formatted citations',
    'Rate Limiting: Respect API quotas and robots.txt, implement backoff strategies'
  ],

  riskConsiderations: [
    'Data Freshness: Cached results may become stale, requiring invalidation strategies',
    'Source Credibility: Credibility scoring is heuristic-based and may have biases',
    'Content Access: Paywalls, authentication requirements, and JavaScript rendering limit accessibility',
    'Fact Verification Accuracy: Multi-source verification may still miss nuanced truths',
    'API Costs: Google/Bing search APIs can be expensive at scale',
    'Legal Compliance: Web scraping must respect robots.txt and terms of service',
    'Bias Propagation: Synthesis may inherit biases from source material'
  ],

  successCriteria: [
    'Successfully search across multiple engines and deduplicate results',
    'Extract main content from >95% of standard HTML pages',
    'Verify facts with >80% accuracy (validated against known fact-check databases)',
    'Generate synthesized reports with properly formatted citations (APA/MLA/Chicago)',
    'Achieve >60% cache hit rate for repeated searches and extractions',
    'Complete typical research task (10 searches, 20 extractions, 5 verifications) in <2 minutes',
    'Credibility scoring correlates >0.75 with MediaBias/FactCheck ratings',
    '85%+ test coverage on search, extraction, and verification logic',
    'Clear error messages guide users to resolution (e.g., "Paywall detected at URL, unable to extract content")',
    'Documentation includes examples for each research workflow'
  ],

  implementationGuidance: [
    '1. Start with web search: Integrate Google Custom Search API, Bing Search API, and DuckDuckGo (HTML scraping), implement result deduplication and ranking',
    '2. Build content extractor: Use @mozilla/readability for main content extraction, Cheerio for HTML parsing, Playwright for JavaScript-rendered sites, extract metadata (author, date, domain)',
    '3. Implement fact verifier: Cross-reference claims across multiple sources, implement credibility scoring (domain authority via Moz/Ahrefs API, bias detection via MediaBias/FactCheck), calculate confidence scores',
    '4. Create synthesis engine: Use Claude API for summarization and analysis, implement citation management (citation-js library), support multiple citation formats (APA, MLA, Chicago, BibTeX)',
    '5. Add caching layer: Implement Redis or in-memory cache for search results and extracted content, use TTL policies (search: 1 hour, content: 24 hours), implement cache invalidation',
    '6. Implement rate limiting: Respect API quotas (track usage, implement exponential backoff), respect robots.txt (use robots-parser library), implement request queuing',
    '7. Add validation layers: Zod schemas on all inputs, URL validation and sanitization, credibility score validation (0-1 range)',
    '8. Write comprehensive tests: Unit test each tool with mocked HTTP responses, integration test full workflows, validate against known fact-check cases',
    '9. Optimize for performance: Parallelize search across engines, batch content extraction, cache aggressively, implement incremental synthesis',
    '10. Document thoroughly: Include JSDoc on all functions, provide research workflow examples, document credibility scoring methodology and tuning'
  ]
});

export const researchAgentTemplate = {
  id: researchAgentDocumentTemplate.id,
  name: researchAgentDocumentTemplate.name,
  description: researchAgentDocumentTemplate.description,
  capabilityTags: researchAgentDocumentTemplate.capabilityTags,
  idealFor: researchAgentDocumentTemplate.idealFor,
  systemPrompt: 'You are a research agent specializing in web search, content extraction, fact-checking, and source verification.',
  defaultTools: [],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'axios', 'cheerio'],
  recommendedIntegrations: ['Google Search API', 'Bing Search API']
};
