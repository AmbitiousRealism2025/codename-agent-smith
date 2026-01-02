import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    preferences: v.object({
      theme: v.union(v.literal('light'), v.literal('dark'), v.literal('system')),
      defaultProvider: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId']),

  sessions: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.string(),
    currentStage: v.union(
      v.literal('discovery'),
      v.literal('requirements'),
      v.literal('architecture'),
      v.literal('output'),
      v.literal('complete')
    ),
    currentQuestionIndex: v.number(),
    isComplete: v.boolean(),
    selectedProvider: v.string(),
    selectedModel: v.string(),
    createdAt: v.number(),
    lastUpdatedAt: v.number(),
  })
    .index('by_session_id', ['sessionId'])
    .index('by_last_updated', ['lastUpdatedAt'])
    .index('by_user', ['userId']),

  responses: defineTable({
    sessionId: v.string(),
    questionId: v.string(),
    value: v.union(v.string(), v.boolean(), v.array(v.string())),
    timestamp: v.number(),
  })
    .index('by_session', ['sessionId'])
    .index('by_session_and_question', ['sessionId', 'questionId']),

  documents: defineTable({
    sessionId: v.string(),
    templateId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index('by_session', ['sessionId'])
    .index('by_created', ['createdAt']),

  shares: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    shareCode: v.string(),
    agentName: v.string(),
    templateId: v.string(),
    documentContent: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_code', ['shareCode'])
    .index('by_session', ['sessionId'])
    .index('by_user', ['userId']),

  templates: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.string(),
    basedOn: v.optional(v.string()),
    capabilityTags: v.array(v.string()),
    idealFor: v.array(v.string()),
    documentSections: v.string(),
    planningChecklist: v.array(v.string()),
    architecturePatterns: v.array(v.string()),
    riskConsiderations: v.array(v.string()),
    successCriteria: v.array(v.string()),
    implementationGuidance: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_name', ['userId', 'name']),
});
