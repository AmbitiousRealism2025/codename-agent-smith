import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    sessionId: v.string(),
    selectedProvider: v.string(),
    selectedModel: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();
    return await ctx.db.insert('sessions', {
      userId: identity?.subject,
      sessionId: args.sessionId,
      currentStage: 'discovery',
      currentQuestionIndex: 0,
      isComplete: false,
      selectedProvider: args.selectedProvider,
      selectedModel: args.selectedModel,
      createdAt: now,
      lastUpdatedAt: now,
    });
  },
});

export const get = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessions')
      .withIndex('by_session_id', (q) => q.eq('sessionId', args.sessionId))
      .first();
  },
});

export const update = mutation({
  args: {
    sessionId: v.string(),
    currentStage: v.optional(
      v.union(
        v.literal('discovery'),
        v.literal('requirements'),
        v.literal('architecture'),
        v.literal('output'),
        v.literal('complete')
      )
    ),
    currentQuestionIndex: v.optional(v.number()),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_session_id', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!session) throw new Error('Session not found');

    await ctx.db.patch(session._id, {
      ...(args.currentStage && { currentStage: args.currentStage }),
      ...(args.currentQuestionIndex !== undefined && { currentQuestionIndex: args.currentQuestionIndex }),
      ...(args.isComplete !== undefined && { isComplete: args.isComplete }),
      lastUpdatedAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('sessions')
      .withIndex('by_last_updated')
      .order('desc')
      .take(20);
  },
});

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query('sessions')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(20);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      clerkId: identity.subject,
      email: identity.email,
      name: identity.name,
      pictureUrl: identity.pictureUrl,
    };
  },
});

export const remove = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_session_id', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!session) throw new Error('Session not found');

    await ctx.db.delete(session._id);
  },
});
