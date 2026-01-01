import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  sessions: defineTable({
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
    .index('by_last_updated', ['lastUpdatedAt']),

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
});
