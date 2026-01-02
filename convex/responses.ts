import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const record = mutation({
  args: {
    sessionId: v.string(),
    questionId: v.string(),
    value: v.union(v.string(), v.boolean(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('responses')
      .withIndex('by_session_and_question', (q) =>
        q.eq('sessionId', args.sessionId).eq('questionId', args.questionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        timestamp: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert('responses', {
      sessionId: args.sessionId,
      questionId: args.questionId,
      value: args.value,
      timestamp: Date.now(),
    });
  },
});

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('responses')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .collect();
  },
});

export const get = query({
  args: {
    sessionId: v.string(),
    questionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('responses')
      .withIndex('by_session_and_question', (q) =>
        q.eq('sessionId', args.sessionId).eq('questionId', args.questionId)
      )
      .first();
  },
});

export const removeBySession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query('responses')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .collect();

    await Promise.all(responses.map((r) => ctx.db.delete(r._id)));
  },
});
