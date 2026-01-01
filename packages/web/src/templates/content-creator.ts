import { createDocumentTemplate } from './template-types';
import { SECTION_TEMPLATES } from './sections/index';
import type { DocumentTemplate } from './template-types';

export const contentCreatorDocumentTemplate: DocumentTemplate = createDocumentTemplate({
  id: 'content-creator',
  name: 'Content Creator Agent',
  description:
    'Specializes in blog posts, documentation, marketing copy, and SEO optimization. Ideal for content marketing, technical writing, and multi-platform content generation.',
  capabilityTags: ['content-creation', 'seo', 'writing', 'marketing', 'documentation'],
  idealFor: [
    'Blog post generation and publishing workflows',
    'Technical documentation and API guides',
    'Marketing copy and campaign content',
    'SEO-optimized content production',
    'Multi-platform content formatting',
  ],

  documentSections: {
    overview: {
      ...SECTION_TEMPLATES.overview,
      examples: [
        'This Content Creator agent generates blog posts, technical documentation, marketing copy, and SEO-optimized content for various platforms.',
        'Key capabilities: Structured outline generation, section writing with tone control, SEO optimization with keyword integration, multi-platform formatting (Markdown, HTML, WordPress, Medium)',
        'Ideal for: content marketers creating blog series, technical writers documenting APIs, marketing teams producing campaign content, SEO specialists optimizing web content',
        'Prerequisites: Node.js 18+, MiniMax API access, basic understanding of content marketing and SEO principles'
      ]
    },

    architecture: {
      ...SECTION_TEMPLATES.architecture,
      contentGuidance: [
        ...SECTION_TEMPLATES.architecture.contentGuidance,
        'Content Creator specific: Describe outline generation strategy, section composition approach, SEO optimization algorithms, platform-specific formatting pipeline'
      ],
      examples: [
        'Components: Outline Generator → Section Writer → SEO Optimizer → Platform Formatter',
        'Uses template-based content generation with Claude API for natural language generation',
        'SEO engine analyzes keyword density, readability scores, meta description quality',
        'Formatting layer supports Markdown, HTML, plain text, rich text, JSON outputs',
        'Platform adapters handle WordPress, Medium, GitHub, LinkedIn formatting requirements'
      ]
    },

    implementation: {
      ...SECTION_TEMPLATES.implementation,
      subsections: [
        'Project Structure',
        'Outline Generation Tool',
        'Section Writing Tool',
        'SEO Optimization Tool',
        'Content Formatting Tool',
        'Configuration'
      ],
      contentGuidance: [
        'Implement generate_outline tool: accepts topic, contentType (blog-post/documentation/marketing-copy/tutorial/article/social-media), targetAudience, keyPoints, tone, length; returns structured outline',
        'Implement write_section tool: accepts sectionTitle, outline, context, style (tone/perspective/includeExamples/includeCTA), wordCount; returns written section content',
        'Implement optimize_for_seo tool: accepts content, primaryKeyword, secondaryKeywords, options (targetKeywordDensity/includeMetaDescription/suggestHeadings/checkReadability); returns optimized content and SEO metrics',
        'Implement format_content tool: accepts content, outputFormat (markdown/html/plain-text/rich-text/json), options (addTableOfContents/addCodeBlocks/addImages/platform); returns formatted content',
        'Use Zod schemas for input validation on all tools',
        'Implement readability scoring (Flesch-Kincaid, Gunning Fog)',
        'Implement keyword density analysis and suggestion algorithms',
        'Environment variables: MINIMAX_JWT_TOKEN (required), LOG_LEVEL (optional, default: info), DEFAULT_TONE (optional, default: professional)'
      ],
      examples: [
        'src/tools/generate-outline.ts - Content outline generator with hierarchical structure',
        'src/tools/write-section.ts - Section composer with tone and style controls',
        'src/tools/optimize-for-seo.ts - SEO analyzer (keyword density, meta tags, readability)',
        'src/tools/format-content.ts - Platform-specific formatters (WordPress, Medium, GitHub, LinkedIn)',
        'src/utils/readability.ts - Readability scoring utilities (Flesch-Kincaid, Gunning Fog)',
        'src/utils/seo.ts - SEO analysis utilities (keyword extraction, density calculation)'
      ]
    },

    testing: {
      ...SECTION_TEMPLATES.testing,
      contentGuidance: [
        'Unit tests: Each tool function with various content types, Zod validation edge cases, readability score accuracy, keyword density calculations',
        'Integration tests: Complete workflow (outline → write sections → optimize SEO → format), multi-section content generation, platform-specific formatting',
        'E2E tests: Real content generation scenarios (blog post, documentation page, marketing email), SEO optimization validation, format conversion accuracy',
        'Test data: Include sample outlines, content snippets, SEO test cases with known scores',
        'Target 85%+ code coverage on core content generation and SEO logic'
      ],
      examples: [
        'tests/unit/tools/generate-outline.test.ts - Test outline generation for all content types, verify hierarchical structure',
        'tests/unit/tools/optimize-for-seo.test.ts - Verify keyword density calculations, readability scoring accuracy',
        'tests/integration/content-workflow.test.ts - Full pipeline from outline through formatted output',
        'tests/fixtures/blog-outline.json - Sample blog post outline structure',
        'tests/fixtures/seo-test-content.md - Content with known keyword density for validation',
        'tests/fixtures/multi-platform-content.md - Content for testing platform formatters'
      ]
    },

    deployment: {
      ...SECTION_TEMPLATES.deployment,
      contentGuidance: [
        'Prerequisites: Node.js 18+, npm/yarn, MiniMax API JWT token',
        'Build: npm install && npm run build (TypeScript compilation to dist/)',
        'Environment setup: Copy .env.example to .env, set MINIMAX_JWT_TOKEN',
        'Deployment options: Content API service (Express/Fastify), serverless function (AWS Lambda), content management system plugin',
        'For API service: Add rate limiting, authentication middleware',
        'For CMS plugin: Package as WordPress/Drupal plugin with admin UI'
      ],
      examples: [
        'npm install && npm run build',
        'Set environment: MINIMAX_JWT_TOKEN=your_jwt_token',
        'Deploy as Express API: app.listen(3000), endpoints /generate-outline, /write-section, /optimize-seo',
        'Deploy to Vercel: serverless functions for each tool',
        'WordPress plugin: wp-content/plugins/content-creator-agent/'
      ]
    },

    monitoring: {
      ...SECTION_TEMPLATES.monitoring,
      contentGuidance: [
        'Track: Content generation time, API request count, SEO score distribution, format conversion success rate, error rate by tool',
        'Log: ERROR for generation failures, WARN for low SEO scores (<60), INFO for successful content creation, DEBUG for detailed outline/section structure',
        'Alert on: error rate >3% (generation issues), avg SEO score <70 (quality degradation), API quota >90%, generation time >30s (performance issue)',
        'Dashboard: Show daily content creation count, average SEO scores trend, content type distribution, platform format usage'
      ],
      examples: [
        'Metrics: content_generation_duration_ms, seo_score_avg, api_requests_total, format_conversion_success_rate, error_rate_percent',
        'Logging: logger.error("Outline generation failed", { topic, contentType, error }), logger.warn("Low SEO score", { score, primaryKeyword })',
        'Grafana/Kibana dashboards: Content creation volume, SEO score P50/P90, error breakdown by tool',
        'Alerts: Slack/PagerDuty on error_rate >3% for 15 minutes, avg_seo_score <70 for 1 hour'
      ]
    },

    troubleshooting: {
      ...SECTION_TEMPLATES.troubleshooting,
      subsections: [
        'Outline Generation Issues',
        'Section Writing Errors',
        'SEO Optimization Problems',
        'Format Conversion Failures',
        'Quality Issues'
      ],
      contentGuidance: [
        'Outline Generation Issues: Empty outlines, incorrect structure, missing key points, inappropriate tone selection',
        'Section Writing Errors: Off-topic content, inconsistent tone, word count mismatches, missing CTAs when requested',
        'SEO Optimization Problems: Keyword stuffing (density too high), low readability scores, missing meta descriptions, poor heading structure',
        'Format Conversion Failures: Invalid Markdown/HTML output, platform-specific formatting errors, code block rendering issues',
        'Quality Issues: Grammatical errors, plagiarism concerns, factual inaccuracies, inconsistent style'
      ],
      examples: [
        'Issue: "Empty outline generated" → Check topic clarity, verify contentType is valid, ensure keyPoints provided if needed',
        'Issue: "SEO score too low" → Increase primaryKeyword usage naturally, improve readability (shorter sentences, simpler words), add meta description, optimize headings',
        'Issue: "Keyword stuffing detected" → Reduce targetKeywordDensity (default 0.02, max 0.03), use semantic variations, balance keyword placement',
        'Issue: "Platform formatting broken" → Verify platform parameter (wordpress/medium/github/linkedin), check output format compatibility, test with sample content',
        'Enable DEBUG logging: LOG_LEVEL=debug for detailed outline structure, section composition steps, SEO analysis results'
      ]
    },

    maintenance: {
      ...SECTION_TEMPLATES.maintenance,
      contentGuidance: [
        'Weekly: Review SEO score trends and outliers, check for content quality issues reported by users',
        'Monthly: Update SEO best practices and algorithms, review and refresh content templates, update platform formatters for API changes',
        'Quarterly: Evaluate new content types and formats, benchmark against industry SEO standards, review and update tone/style guidelines',
        'Continuous: Monitor Google algorithm updates, keep MiniMax SDK updated, maintain compatibility with target platforms'
      ],
      examples: [
        'Weekly: Analyze SEO scores < 70 → identify common patterns → adjust keyword integration logic',
        'Monthly: npm update @anthropic-ai/claude-agent-sdk, review WordPress/Medium API changes',
        'Quarterly: Add new content type (e.g., case-study, whitepaper), benchmark readability scores against industry averages',
        'Backup: Archive generated content templates and outlines to cloud storage with 180-day retention'
      ]
    }
  },

  planningChecklist: [
    'Define target content types (blog posts, documentation, marketing copy, tutorials, articles, social media)',
    'Identify supported tones and perspectives (professional, casual, technical, persuasive, educational)',
    'Select SEO optimization features (keyword density, readability scoring, meta descriptions, heading suggestions)',
    'Determine output formats needed (Markdown, HTML, plain text, rich text, JSON)',
    'Plan platform-specific formatting (WordPress, Medium, GitHub, LinkedIn)',
    'Design outline generation structure and hierarchy',
    'Choose readability scoring algorithms (Flesch-Kincaid, Gunning Fog, SMOG)',
    'Define content quality standards and validation rules',
    'Plan test content fixtures for various scenarios',
    'Determine deployment environment (API service, serverless, CMS plugin)',
    'Establish monitoring and quality metrics'
  ],

  architecturePatterns: [
    'Pipeline Architecture: Outline Generator → Section Writer → SEO Optimizer → Platform Formatter',
    'Template-based Generation: Use content templates for consistency across content types',
    'Tool-based Modularity: Each content operation is a separate tool with clear inputs/outputs',
    'Style Control: Configurable tone, perspective, and formatting options per section',
    'SEO-aware Composition: Integrate keyword optimization during writing, not as post-processing',
    'Platform Abstraction: Generic content model with platform-specific adapters',
    'Quality Gates: Validate readability and SEO scores before returning content'
  ],

  riskConsiderations: [
    'Content Quality: Generated content may require human review for accuracy and appropriateness',
    'SEO Over-optimization: Risk of keyword stuffing if density targets too high',
    'Platform Compatibility: Platform APIs and formatting requirements change frequently',
    'Plagiarism Risk: Ensure content is original and not derivative of training data',
    'Tone Consistency: Multiple sections may have inconsistent tone without proper context',
    'API Rate Limits: MiniMax API quota exhaustion if generating high volume of content',
    'Legal Compliance: Generated content must comply with advertising standards and regulations'
  ],

  successCriteria: [
    'Generate structured outlines for all supported content types with appropriate hierarchy',
    'Write sections matching requested tone, perspective, and word count (±10%)',
    'Achieve target SEO scores: readability >60 (Flesch-Kincaid), keyword density 1.5-2.5%',
    'Successfully format content for all platforms without rendering errors',
    'Generate blog post (1500 words) in <45 seconds',
    'SEO optimization improves content scores by minimum 15 points',
    'Platform formatters produce valid output accepted by target platforms (WordPress, Medium, etc.)',
    '85%+ test coverage on content generation and SEO logic',
    'Clear error messages for quality issues (e.g., "Keyword density 4.2% exceeds recommended 3%")',
    'Documentation includes examples for each content type and platform'
  ],

  implementationGuidance: [
    '1. Start with outline generation: Implement hierarchical structure builder, support all content types, integrate tone/audience parameters',
    '2. Build section writer: Use Claude API for natural language generation, implement style controls (tone/perspective), add word count targeting logic',
    '3. Implement SEO optimizer: Calculate keyword density (target 1.5-2.5%), implement readability scoring (Flesch-Kincaid, Gunning Fog), generate meta descriptions, suggest heading improvements',
    '4. Create platform formatters: Implement Markdown parser/generator, build HTML templating system, add platform-specific adapters (WordPress shortcodes, Medium embed codes)',
    '5. Add validation layers: Zod schemas on all inputs, content quality checks (grammar, readability, SEO scores), platform output validation',
    '6. Implement error handling: Graceful degradation for partial content, return detailed error messages with improvement suggestions, log quality issues for review',
    '7. Write comprehensive tests: Unit test each tool with various content scenarios, integration test full workflows, validate SEO calculations with known examples',
    '8. Optimize for performance: Cache content templates, batch API calls when generating multi-section content, implement streaming for long-form content',
    '9. Add quality controls: Implement plagiarism checking (if feasible), add human-in-the-loop review flags for sensitive content, validate against brand guidelines',
    '10. Document thoroughly: Include JSDoc on all functions, provide content examples for each type, document SEO best practices and recommendations'
  ]
});

export const contentCreatorTemplate = {
  id: contentCreatorDocumentTemplate.id,
  name: contentCreatorDocumentTemplate.name,
  description: contentCreatorDocumentTemplate.description,
  capabilityTags: contentCreatorDocumentTemplate.capabilityTags,
  idealFor: contentCreatorDocumentTemplate.idealFor,
  systemPrompt: 'You are a content creator agent specializing in blog posts, SEO optimization, and multi-platform formatting.',
  defaultTools: [],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk'],
  recommendedIntegrations: ['WordPress API', 'Medium API']
};
