import { createDocumentTemplate } from './template-types';
import { SECTION_TEMPLATES } from './sections/index';
import type { DocumentTemplate } from './template-types';

export const automationAgentDocumentTemplate: DocumentTemplate = createDocumentTemplate({
  id: 'automation-agent',
  name: 'Automation Agent',
  description:
    'Specializes in task scheduling, workflow orchestration, queue management, and process automation. Ideal for repetitive task automation, workflow optimization, and system integration.',
  capabilityTags: ['automation', 'scheduling', 'workflow', 'orchestration', 'integration'],
  idealFor: [
    'Repetitive task automation and elimination',
    'Multi-step workflow orchestration',
    'Task queue management and processing',
    'System integration and data synchronization',
    'Scheduled job execution and monitoring',
  ],

  documentSections: {
    overview: {
      ...SECTION_TEMPLATES.overview,
      examples: [
        'This Automation Agent schedules tasks with cron expressions, orchestrates multi-step workflows with conditional logic, manages task queues with priority handling, and integrates with external systems via webhooks and APIs.',
        'Key capabilities: Cron-based task scheduling, workflow orchestration with DAG (Directed Acyclic Graph) execution, priority queue management with retry logic, webhook handling and API integrations, event-driven automation triggers',
        'Ideal for: DevOps engineers automating deployments, data engineers orchestrating ETL pipelines, business analysts automating reporting workflows, system integrators connecting disparate systems',
        'Prerequisites: Node.js 18+, MiniMax API access, understanding of cron expressions, familiarity with workflow orchestration concepts'
      ]
    },

    architecture: {
      ...SECTION_TEMPLATES.architecture,
      contentGuidance: [
        ...SECTION_TEMPLATES.architecture.contentGuidance,
        'Automation Agent specific: Describe task scheduling engine, workflow execution DAG, queue management strategy, webhook event processing, retry and failure handling'
      ],
      examples: [
        'Components: Scheduler → Workflow Engine → Queue Manager → Integration Hub → Monitor',
        'Uses cron library (node-cron) for time-based task scheduling',
        'Workflow engine executes DAG (Directed Acyclic Graph) with conditional branching and parallel execution',
        'Queue manager built on Bull/BullMQ with Redis backend for distributed task processing',
        'Integration hub handles webhooks (incoming and outgoing), API calls, and event triggers',
        'Monitor tracks execution status, logs, and sends notifications on failures'
      ]
    },

    implementation: {
      ...SECTION_TEMPLATES.implementation,
      subsections: [
        'Project Structure',
        'Task Scheduling Tool',
        'Workflow Orchestration Tool',
        'Queue Management Tool',
        'Integration Tool',
        'Configuration'
      ],
      contentGuidance: [
        'Implement schedule_task tool: accepts cronExpression, taskDefinition (name, parameters), timezone, enabled flag; returns scheduled task ID and next execution time',
        'Implement execute_workflow tool: accepts workflowDefinition (steps array with dependencies), parameters, options (parallel, timeout); returns workflow execution ID and status',
        'Implement manage_queue tool: accepts action (add/remove/pause/resume), queueName, task (optional), priority (optional); returns queue status and task count',
        'Implement integrate_system tool: accepts integrationType (webhook/api/event), configuration (url, method, headers, payload), authConfig; returns integration ID and status',
        'Use Zod schemas for input validation on all tools',
        'Implement DAG validation for workflows (detect cycles, validate dependencies)',
        'Implement retry logic with exponential backoff for failed tasks',
        'Environment variables: MINIMAX_JWT_TOKEN (required), REDIS_URL (required for queues), LOG_LEVEL (optional, default: info), MAX_RETRIES (optional, default: 3)'
      ],
      examples: [
        'src/tools/schedule-task.ts - Cron-based task scheduler with timezone support',
        'src/tools/execute-workflow.ts - DAG workflow executor with parallel execution and conditional logic',
        'src/tools/manage-queue.ts - Queue manager (Bull/BullMQ) with priority and retry handling',
        'src/tools/integrate-system.ts - Webhook and API integration handler',
        'src/workflows/ - Workflow definition schemas and validators',
        'src/queues/ - Queue processors for different task types'
      ]
    },

    testing: {
      ...SECTION_TEMPLATES.testing,
      contentGuidance: [
        'Unit tests: Each tool function with various configurations, Zod validation edge cases, cron expression parsing, DAG cycle detection, queue operations',
        'Integration tests: Complete workflow execution (schedule → execute → queue → integrate), multi-step workflows with dependencies, error recovery and retry logic',
        'E2E tests: Real scheduled tasks (with accelerated time), actual workflow execution scenarios, queue processing with Redis, webhook integrations (with mock servers)',
        'Test data: Include sample workflow definitions (simple, complex, parallel, conditional), cron expressions (various patterns), queue scenarios (priority, retry)',
        'Target 85%+ code coverage on core scheduling, workflow, and queue logic'
      ],
      examples: [
        'tests/unit/tools/schedule-task.test.ts - Test cron parsing, timezone handling, task scheduling',
        'tests/unit/tools/execute-workflow.test.ts - Verify DAG execution, dependency resolution, parallel execution',
        'tests/integration/automation-workflow.test.ts - Full pipeline from schedule through integration',
        'tests/fixtures/workflow-definitions.json - Sample workflows (ETL, deployment, reporting)',
        'tests/fixtures/cron-expressions.txt - Various cron patterns for validation',
        'tests/mocks/webhook-server.ts - Mock webhook server for integration testing'
      ]
    },

    deployment: {
      ...SECTION_TEMPLATES.deployment,
      contentGuidance: [
        'Prerequisites: Node.js 18+, npm/yarn, MiniMax API JWT token, Redis instance (for queues)',
        'Build: npm install && npm run build (TypeScript compilation to dist/)',
        'Environment setup: Copy .env.example to .env, set MINIMAX_JWT_TOKEN and REDIS_URL',
        'Deployment options: Long-running service (PM2, systemd), containerized deployment (Docker, Kubernetes), serverless with state (AWS Step Functions, Google Cloud Workflows)',
        'For production: Use Redis cluster for high availability, implement health checks and graceful shutdown',
        'For Kubernetes: Deploy as StatefulSet with Redis as dependency'
      ],
      examples: [
        'npm install && npm run build',
        'Set environment: MINIMAX_JWT_TOKEN=your_jwt_token, REDIS_URL=redis://localhost:6379',
        'Deploy with PM2: pm2 start dist/index.js --name automation-agent',
        'Deploy to Docker: docker run -e REDIS_URL=redis://redis:6379 automation-agent',
        'Deploy to Kubernetes: StatefulSet with Redis sidecar, ConfigMap for workflows'
      ]
    },

    monitoring: {
      ...SECTION_TEMPLATES.monitoring,
      contentGuidance: [
        'Track: Scheduled task execution count, workflow success/failure rate, queue depth and processing time, integration success rate, retry count',
        'Log: ERROR for task/workflow failures, WARN for retry attempts, INFO for successful executions, DEBUG for detailed workflow steps and queue operations',
        'Alert on: workflow failure rate >5%, queue depth >1000 (backlog building), task retry exhausted, integration failure rate >10%, Redis connection loss',
        'Dashboard: Show scheduled tasks status, workflow execution timeline, queue depth trends, integration health'
      ],
      examples: [
        'Metrics: scheduled_tasks_total, workflow_success_rate, queue_depth, integration_requests_total, retry_count',
        'Logging: logger.error("Workflow failed", { workflowId, step, error }), logger.warn("Task retry", { taskId, attempt })',
        'Grafana/Prometheus dashboards: Workflow execution timeline, queue depth over time, task success rate',
        'Alerts: PagerDuty/Slack on workflow_failure_rate >5%, queue_depth >1000 for 10 minutes, redis_connection_down'
      ]
    },

    troubleshooting: {
      ...SECTION_TEMPLATES.troubleshooting,
      subsections: [
        'Scheduling Issues',
        'Workflow Execution Failures',
        'Queue Management Problems',
        'Integration Errors',
        'Performance Issues'
      ],
      contentGuidance: [
        'Scheduling Issues: Cron expression not triggering, timezone mismatches, task not executing at expected time, schedule conflicts',
        'Workflow Execution Failures: DAG cycle detected, step timeouts, dependency resolution errors, parallel execution deadlocks',
        'Queue Management Problems: Tasks stuck in queue, Redis connection issues, queue not processing, priority not respected',
        'Integration Errors: Webhook delivery failures, API authentication errors, timeout on external systems, payload formatting issues',
        'Performance Issues: Queue backlog building, workflow execution too slow, Redis memory exhaustion, concurrent execution limits'
      ],
      examples: [
        'Issue: "Cron not triggering" → Verify cron expression syntax (use crontab.guru), check timezone configuration, ensure task enabled flag is true',
        'Issue: "Workflow DAG cycle detected" → Review workflow definition, check step dependencies for circular references, visualize DAG with graphviz',
        'Issue: "Queue stuck" → Check Redis connection (PING command), verify queue processor running, check for errors in task processing logic',
        'Issue: "Webhook delivery failed" → Verify endpoint URL accessible, check authentication headers, validate payload format, review response status codes',
        'Issue: "Queue backlog building" → Increase worker count, optimize task processing time, add more Redis memory, implement queue priority',
        'Enable DEBUG logging: LOG_LEVEL=debug for detailed workflow execution steps, queue operations, integration request/response logs'
      ]
    },

    maintenance: {
      ...SECTION_TEMPLATES.maintenance,
      contentGuidance: [
        'Daily: Monitor queue depth and clear stuck tasks, review failed workflows and trigger retries',
        'Weekly: Review scheduled task execution logs, check for missed executions, analyze workflow performance trends',
        'Monthly: Update dependencies (node-cron, Bull/BullMQ, Redis client), review and optimize slow workflows, clean up old task logs',
        'Quarterly: Evaluate new workflow patterns and automation opportunities, benchmark queue throughput, review and update retry policies',
        'Continuous: Monitor Redis memory usage and eviction policy, keep integration endpoints updated, maintain cron expression documentation'
      ],
      examples: [
        'Daily: redis-cli LLEN queue_name → check depth → manual processing if >1000',
        'Weekly: grep "workflow failed" logs → analyze patterns → adjust retry logic or workflow steps',
        'Monthly: npm update node-cron bull ioredis, profile slow workflows with --inspect',
        'Quarterly: Review workflow execution times → identify bottlenecks → optimize or parallelize steps',
        'Backup: Export scheduled tasks and workflow definitions to S3 daily, retain Redis snapshots for 7 days'
      ]
    }
  },

  planningChecklist: [
    'Define task scheduling needs (cron expressions, timezones, one-time vs recurring)',
    'Identify workflow patterns (sequential, parallel, conditional, loops)',
    'Select queue backend (Redis, RabbitMQ, AWS SQS)',
    'Determine integration types (webhooks, REST APIs, GraphQL, gRPC)',
    'Plan retry strategy (max retries, backoff algorithm, failure handling)',
    'Design workflow definition schema (DAG structure, step types, parameters)',
    'Choose monitoring and alerting approach (Prometheus, CloudWatch, Datadog)',
    'Define task priority levels and queue segmentation',
    'Plan state persistence and recovery mechanisms',
    'Determine deployment environment (long-running service, Kubernetes, serverless)',
    'Establish SLA and performance targets (queue latency, workflow completion time)'
  ],

  architecturePatterns: [
    'Event-Driven Architecture: React to events (cron triggers, webhooks, queue messages) and execute workflows',
    'DAG Execution: Represent workflows as Directed Acyclic Graphs for dependency management',
    'Queue-based Processing: Decouple task submission from execution using priority queues',
    'Retry with Exponential Backoff: Automatically retry failed tasks with increasing delays',
    'Circuit Breaker: Prevent cascading failures in integration calls',
    'Idempotency: Ensure task executions are idempotent to handle retries safely',
    'Graceful Degradation: Continue processing other tasks when one task/workflow fails'
  ],

  riskConsiderations: [
    'State Management: Workflow state must be persisted to handle process restarts',
    'Retry Storms: Too aggressive retry policies can overwhelm external systems',
    'Queue Backlog: Slow task processing can lead to unbounded queue growth',
    'Deadlocks: Complex workflow dependencies may create execution deadlocks',
    'Data Loss: Redis eviction or crashes can lose queued tasks without persistence',
    'Integration Fragility: External systems may change APIs or become unavailable',
    'Resource Exhaustion: Unbounded parallel execution can exhaust system resources'
  ],

  successCriteria: [
    'Successfully schedule tasks with various cron expressions and timezones',
    'Execute workflows with complex dependencies (sequential, parallel, conditional) without deadlocks',
    'Process queue tasks with <5s latency (P95) under normal load',
    'Integrate with external systems via webhooks and APIs with >95% success rate',
    'Automatically retry failed tasks up to configured limit with exponential backoff',
    'Handle workflow execution of 100 steps in <60s',
    'Maintain queue depth <100 under normal load, scale to 10,000+ during bursts',
    '85%+ test coverage on scheduling, workflow, and queue logic',
    'Clear error messages for configuration issues (e.g., "Invalid cron expression: 0 0 32 * *")',
    'Documentation includes workflow examples for common automation patterns (ETL, deployment, reporting)'
  ],

  implementationGuidance: [
    '1. Start with task scheduling: Use node-cron for cron-based scheduling, implement timezone support with moment-timezone, persist schedule definitions to database',
    '2. Build workflow engine: Define workflow schema with DAG structure (steps, dependencies, conditions), implement DAG validation (cycle detection), build executor with parallel execution support',
    '3. Implement queue manager: Use Bull/BullMQ with Redis backend, implement priority queues, add retry logic with exponential backoff, implement job progress tracking',
    '4. Create integration hub: Build webhook receiver (Express endpoints), implement outgoing webhook sender, add REST API client with authentication, implement event emitters for workflow triggers',
    '5. Add state persistence: Persist workflow state to database (PostgreSQL, MongoDB), implement checkpoint/resume for long-running workflows, store task execution history',
    '6. Implement monitoring: Expose Prometheus metrics (task count, workflow duration, queue depth), implement health check endpoints, add logging with correlation IDs',
    '7. Add validation layers: Zod schemas on all inputs, validate cron expressions (cron-validator), validate workflow DAG structure, validate integration configurations',
    '8. Write comprehensive tests: Unit test each tool with various configurations, integration test workflows with dependencies, E2E test with real Redis and mock integrations',
    '9. Optimize for performance: Parallelize workflow steps where possible, batch queue processing, implement connection pooling for Redis and databases, use worker threads for CPU-intensive tasks',
    '10. Document thoroughly: Include JSDoc on all functions, provide workflow examples (ETL pipeline, deployment workflow, reporting automation), document cron expression patterns and best practices'
  ]
});

export const automationAgentTemplate = {
  id: automationAgentDocumentTemplate.id,
  name: automationAgentDocumentTemplate.name,
  description: automationAgentDocumentTemplate.description,
  capabilityTags: automationAgentDocumentTemplate.capabilityTags,
  idealFor: automationAgentDocumentTemplate.idealFor,
  systemPrompt: 'You are an automation agent specializing in task scheduling, workflow orchestration, and queue management.',
  defaultTools: [],
  requiredDependencies: ['@anthropic-ai/claude-agent-sdk', 'node-cron', 'bull'],
  recommendedIntegrations: ['Redis', 'PostgreSQL']
};
