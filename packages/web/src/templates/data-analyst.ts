import { createDocumentTemplate } from './template-types';
import { SECTION_TEMPLATES } from './sections/index';
import type { DocumentTemplate } from './template-types';

export const dataAnalystDocumentTemplate: DocumentTemplate = createDocumentTemplate({
  id: 'data-analyst',
  name: 'Data Analyst Agent',
  description:
    'Specializes in CSV data processing, statistical analysis, visualization, and report generation. Ideal for data exploration, business intelligence, and automated reporting workflows.',
  capabilityTags: ['data-processing', 'statistics', 'visualization', 'reporting', 'file-access'],
  idealFor: [
    'Automated data analysis and reporting',
    'CSV file processing and transformation',
    'Statistical analysis and insights generation',
    'Business intelligence dashboards',
    'Data quality assessment and validation',
  ],

  documentSections: {
    overview: {
      ...SECTION_TEMPLATES.overview,
      examples: [
        'This Data Analyst agent processes CSV data files, performs statistical analysis, and generates comprehensive reports with visualizations.',
        'Key capabilities: CSV parsing with custom delimiters and encodings, descriptive statistics, correlation/regression analysis, chart generation (bar, line, scatter, pie, histogram, heatmap), multi-format report export (JSON, CSV, Markdown, HTML)',
        'Ideal for: data scientists analyzing experimental results, business analysts creating automated dashboards, researchers processing survey data, financial analysts generating periodic reports',
        'Prerequisites: Node.js 18+, MiniMax API access, file system read/write permissions, basic understanding of statistical concepts'
      ]
    },

    architecture: {
      ...SECTION_TEMPLATES.architecture,
      contentGuidance: [
        ...SECTION_TEMPLATES.architecture.contentGuidance,
        'Data Analyst specific: Describe CSV parsing strategy, statistical computation modules, visualization rendering approach, report templating system'
      ],
      examples: [
        'Components: CSV Parser → Data Validator → Statistical Analyzer → Visualization Generator → Report Exporter',
        'Uses streaming architecture for large CSV files to avoid memory issues',
        'Integrates with Claude API for natural language data interpretation and insight generation',
        'Statistical engine supports descriptive stats, correlation matrices, regression models, and distribution analysis',
        'Visualization layer generates Chart.js/D3 configurations returned to caller for rendering'
      ]
    },

    implementation: {
      ...SECTION_TEMPLATES.implementation,
      subsections: [
        'Project Structure',
        'CSV Reading Tool',
        'Data Analysis Tool',
        'Visualization Tool',
        'Report Export Tool',
        'Configuration'
      ],
      contentGuidance: [
        'Implement read_csv tool: accepts filePath, delimiter, hasHeaders, encoding; returns parsed data array',
        'Implement analyze_data tool: accepts data array, analysisType (descriptive/correlation/regression/distribution), optional columns, optional groupBy; returns statistical results',
        'Implement generate_visualization tool: accepts data, chartType (bar/line/scatter/pie/histogram/heatmap), xAxis, yAxis, optional title, outputPath; returns chart configuration',
        'Implement export_report tool: accepts data object, format (json/csv/markdown/html), outputPath, includeMetadata flag; returns formatted report content',
        'Use Zod schemas for input validation on all tools',
        'Handle missing values, invalid data types, and encoding errors gracefully',
        'Return data and configurations rather than writing files directly (user-controlled persistence)',
        'Environment variables: MINIMAX_JWT_TOKEN (required), LOG_LEVEL (optional, default: info), MAX_CSV_SIZE_MB (optional, default: 50)'
      ],
      examples: [
        'src/tools/read-csv.ts - CSV parsing with csv-parse library, encoding detection, delimiter inference',
        'src/tools/analyze-data.ts - Statistical functions (mean, median, std dev, correlation, regression)',
        'src/tools/generate-visualization.ts - Chart configuration builder for various chart types',
        'src/tools/export-report.ts - Report formatters for JSON, CSV, Markdown, HTML',
        'src/utils/stats.ts - Reusable statistical computation utilities',
        'src/utils/validation.ts - Data quality checks and type inference'
      ]
    },

    testing: {
      ...SECTION_TEMPLATES.testing,
      contentGuidance: [
        'Unit tests: Each tool function with valid/invalid inputs, Zod validation edge cases, statistical accuracy verification',
        'Integration tests: Complete workflow (read CSV → analyze → visualize → export), multi-step analysis pipelines, error propagation',
        'E2E tests: Real CSV files with various formats (different delimiters, encodings, missing values), complex analysis scenarios, report generation validation',
        'Test data: Include sample CSV files with clean data, messy data (missing values, inconsistent types), large files (performance testing)',
        'Target 90%+ code coverage on core analysis and tool logic'
      ],
      examples: [
        'tests/unit/tools/read-csv.test.ts - Test CSV parsing with comma/tab/semicolon delimiters, UTF-8/UTF-16/Latin-1 encodings, headers/no-headers scenarios',
        'tests/unit/tools/analyze-data.test.ts - Verify statistical calculations match known results, test groupBy aggregations',
        'tests/integration/analysis-workflow.test.ts - Full pipeline from CSV read through report export',
        'tests/fixtures/sample-data.csv - Clean sales data with 1000 rows',
        'tests/fixtures/messy-data.csv - Data with missing values, mixed types, special characters',
        'tests/fixtures/large-data.csv - 100,000+ rows for performance testing'
      ]
    },

    deployment: {
      ...SECTION_TEMPLATES.deployment,
      contentGuidance: [
        'Prerequisites: Node.js 18+, npm/yarn, MiniMax API JWT token',
        'Build: npm install && npm run build (TypeScript compilation to dist/)',
        'Environment setup: Copy .env.example to .env, set MINIMAX_JWT_TOKEN',
        'Deployment options: Standalone CLI tool, serverless function (AWS Lambda, Vercel), container (Docker)',
        'For serverless: Adjust memory/timeout limits for large CSV processing',
        'For containerized: Use multi-stage Dockerfile, optimize image size'
      ],
      examples: [
        'npm install && npm run build',
        'Set environment: MINIMAX_JWT_TOKEN=your_jwt_token',
        'Deploy to AWS Lambda: 512MB memory, 5min timeout for large files',
        'Deploy to Docker: FROM node:18-alpine, WORKDIR /app, COPY dist/ ., CMD ["node", "index.js"]',
        'API Gateway integration for HTTP endpoint access'
      ]
    },

    monitoring: {
      ...SECTION_TEMPLATES.monitoring,
      contentGuidance: [
        'Track: CSV processing time, analysis computation time, API request count, error rate, memory usage during large file processing',
        'Log: ERROR for file read/parse failures, WARN for data quality issues (missing values >20%), INFO for analysis completion, DEBUG for detailed statistical outputs',
        'Alert on: error rate >5% (data format issues), processing time >60s (performance degradation), memory usage >80% (risk of OOM), API quota >90%',
        'Dashboard: Show daily analysis count, average processing time trend, common error types, file size distribution'
      ],
      examples: [
        'Metrics: csv_parse_duration_ms, analysis_computation_duration_ms, api_requests_total, error_rate_percent, memory_usage_mb',
        'Logging: logger.error("CSV parse failed", { file, error }), logger.warn("High missing value rate", { column, missingPct })',
        'CloudWatch/Datadog dashboards: Processing time P50/P95/P99, error breakdown by tool, memory usage over time',
        'Alerts: PagerDuty/Slack on error_rate >5% for 10 minutes, processing_time_p95 >120s'
      ]
    },

    troubleshooting: {
      ...SECTION_TEMPLATES.troubleshooting,
      subsections: [
        'CSV Parsing Issues',
        'Statistical Analysis Errors',
        'Visualization Failures',
        'Report Export Problems',
        'Performance Issues'
      ],
      contentGuidance: [
        'CSV Parsing Issues: Wrong delimiter detected, encoding errors (garbled characters), header detection failures, empty file handling',
        'Statistical Analysis Errors: Non-numeric data in numeric columns, insufficient data for analysis (N<2), division by zero in variance calculation, correlation on non-numeric data',
        'Visualization Failures: Missing required columns, invalid chart type for data structure, too many data points (>10,000), invalid axis configuration',
        'Report Export Problems: Invalid output path, unsupported format, data serialization errors, file write permission issues',
        'Performance Issues: Large file processing timeouts, memory exhaustion, slow statistical computations'
      ],
      examples: [
        'Issue: "Failed to parse CSV" → Check delimiter (try tab \\t or semicolon ;), verify encoding (try utf16le), ensure file is valid CSV format',
        'Issue: "Cannot compute statistics" → Verify columns are numeric, check for missing values (filter or impute), ensure data array not empty',
        'Issue: "Visualization generation failed" → Verify xAxis/yAxis columns exist in data, check chartType matches data structure (pie requires categorical + numeric), reduce data points if >10,000',
        'Issue: "Out of memory error" → Process CSV in chunks/streams, reduce MAX_CSV_SIZE_MB, increase Lambda/container memory allocation',
        'Enable DEBUG logging: LOG_LEVEL=debug for detailed parser output and statistical intermediate results'
      ]
    },

    maintenance: {
      ...SECTION_TEMPLATES.maintenance,
      contentGuidance: [
        'Weekly: Review error logs for recurring parse failures or data quality issues, check API usage against quota',
        'Monthly: Update dependencies (npm update), review and optimize slow statistical computations, analyze memory usage patterns',
        'Quarterly: Evaluate new statistical methods or chart types, performance benchmark against larger datasets, review and update sample test fixtures',
        'Continuous: Monitor for upstream CSV format changes, keep MiniMax SDK updated, maintain compatibility with Node.js LTS versions'
      ],
      examples: [
        'Weekly: grep "parse failed" logs | analyze common patterns → adjust delimiter detection logic',
        'Monthly: npm update @anthropic-ai/claude-agent-sdk csv-parse chart.js',
        'Quarterly: Benchmark against 500MB CSV file, optimize memory usage with streaming parser',
        'Backup: Archive processed analysis results to S3 with 90-day retention policy'
      ]
    }
  },

  planningChecklist: [
    'Define target data formats and delimiters (CSV, TSV, custom)',
    'Identify required statistical analyses (descriptive, correlation, regression, distribution)',
    'Select visualization types needed (bar, line, scatter, pie, histogram, heatmap)',
    'Determine report output formats (JSON, CSV, Markdown, HTML)',
    'Plan data validation and error handling strategy',
    'Design CSV parsing approach (streaming vs in-memory)',
    'Choose statistical libraries or implement custom calculations',
    'Select visualization library (Chart.js, D3, Plotly)',
    'Define memory limits and file size constraints',
    'Plan test data fixtures with various edge cases',
    'Determine deployment environment (CLI, serverless, container)',
    'Establish monitoring and logging requirements'
  ],

  architecturePatterns: [
    'Pipeline Architecture: CSV Reader → Validator → Analyzer → Visualizer → Exporter',
    'Streaming Processing: Use Node.js streams for large CSV files to avoid memory issues',
    'Tool-based Modularity: Each analysis step is a separate tool with clear inputs/outputs',
    'Configuration-based Visualization: Return chart configs rather than rendered images for flexibility',
    'User-controlled Persistence: Tools return data/content, user decides when/where to write files',
    'Error Recovery: Graceful degradation for partial data (skip invalid rows, continue processing)',
    'Stateless Design: Each tool invocation is independent, no shared state between calls'
  ],

  riskConsiderations: [
    'Large File Processing: CSV files >100MB may cause memory exhaustion or timeout errors',
    'Data Quality: Missing values, inconsistent types, encoding issues can break analysis',
    'Statistical Accuracy: Ensure correct implementation of statistical formulas (use tested libraries)',
    'API Rate Limits: MiniMax API quota exhaustion if processing many files',
    'Security: Validate file paths to prevent directory traversal attacks, sanitize user-provided column names',
    'Performance: Complex statistical analyses (regression, correlation on large datasets) may be slow',
    'Dependency Maintenance: Keep CSV parsing and charting libraries updated for security patches'
  ],

  successCriteria: [
    'Successfully parse CSV files with various delimiters (comma, tab, semicolon) and encodings (UTF-8, UTF-16, Latin-1)',
    'Accurately compute descriptive statistics matching reference implementations (±0.01% tolerance)',
    'Generate valid chart configurations for all supported chart types',
    'Export reports in all formats (JSON, CSV, Markdown, HTML) with correct structure',
    'Handle files up to configured size limit (default 50MB) without memory errors',
    'Process typical CSV file (10,000 rows, 20 columns) in <10 seconds',
    'Gracefully handle and report common errors (missing files, invalid formats, corrupt data)',
    '90%+ test coverage on core tool implementations',
    'Clear error messages guide users to resolution (e.g., "Column \'price\' contains non-numeric values")',
    'Documentation includes working examples for each tool'
  ],

  implementationGuidance: [
    '1. Start with CSV reading tool: Use csv-parse library for robust parsing, support common delimiters and encodings, implement streaming for large files',
    '2. Implement statistical analysis: For descriptive stats, use simple-statistics or implement mean/median/stddev/min/max, for correlation/regression use regression-js or ml.js',
    '3. Build visualization tool: Return chart configurations (not rendered images), use Chart.js schema format for broad compatibility',
    '4. Create report exporter: Implement templates for each format, use JSON.stringify for JSON, markdown-table for CSV-to-Markdown, basic HTML template with CSS',
    '5. Add comprehensive validation: Zod schemas on all inputs, runtime type checks on data arrays, validate column existence before analysis',
    '6. Implement error handling: Wrap file operations in try/catch, return structured error objects with actionable messages, log errors with context',
    '7. Write unit tests first: Test each statistical function with known inputs/outputs, test edge cases (empty data, single value, all missing)',
    '8. Add integration tests: Test full workflow with real CSV fixtures, verify end-to-end data flow, test error propagation',
    '9. Optimize performance: Profile with large files, implement streaming where beneficial, cache parsed data if reused',
    '10. Document thoroughly: Include JSDoc on all functions, provide usage examples in README, document assumptions and limitations'
  ]
});

export const dataAnalystTemplate = {
  id: dataAnalystDocumentTemplate.id,
  name: dataAnalystDocumentTemplate.name,
  description: dataAnalystDocumentTemplate.description,
  capabilityTags: dataAnalystDocumentTemplate.capabilityTags,
  idealFor: dataAnalystDocumentTemplate.idealFor,
  systemPrompt: 'You are a data analyst agent specializing in CSV processing and statistical analysis.',
  defaultTools: [],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'csv-parse', 'simple-statistics'],
  recommendedIntegrations: []
};
