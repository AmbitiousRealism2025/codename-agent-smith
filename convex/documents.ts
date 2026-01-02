import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const save = mutation({
  args: {
    sessionId: v.string(),
    templateId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        templateId: args.templateId,
        content: args.content,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert('documents', {
      sessionId: args.sessionId,
      templateId: args.templateId,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_created')
      .order('desc')
      .take(50);
  },
});

export const remove = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query('documents')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (doc) {
      await ctx.db.delete(doc._id);
    }
  },
});
