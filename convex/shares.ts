import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const create = mutation({
  args: {
    sessionId: v.string(),
    agentName: v.string(),
    templateId: v.string(),
    documentContent: v.string(),
    expirationDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Must be authenticated to create share links');
    }

    const existing = await ctx.db
      .query('shares')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (existing) {
      return { shareCode: existing.shareCode, isNew: false };
    }

    const shareCode = generateShareCode();
    const now = Date.now();
    const expiresAt = args.expirationDays
      ? now + args.expirationDays * 24 * 60 * 60 * 1000
      : undefined;

    await ctx.db.insert('shares', {
      sessionId: args.sessionId,
      userId: identity.subject,
      shareCode,
      agentName: args.agentName,
      templateId: args.templateId,
      documentContent: args.documentContent,
      expiresAt,
      createdAt: now,
    });

    return { shareCode, isNew: true };
  },
});

export const getByCode = query({
  args: { shareCode: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query('shares')
      .withIndex('by_code', (q) => q.eq('shareCode', args.shareCode))
      .first();

    if (!share) {
      return null;
    }

    if (share.expiresAt && share.expiresAt < Date.now()) {
      return { expired: true };
    }

    return {
      agentName: share.agentName,
      templateId: share.templateId,
      documentContent: share.documentContent,
      createdAt: share.createdAt,
      expired: false,
    };
  },
});

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query('shares')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first();
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
      .query('shares')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
  },
});

export const revoke = mutation({
  args: { shareCode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Must be authenticated to revoke share links');
    }

    const share = await ctx.db
      .query('shares')
      .withIndex('by_code', (q) => q.eq('shareCode', args.shareCode))
      .first();

    if (!share) {
      throw new Error('Share not found');
    }

    if (share.userId !== identity.subject) {
      throw new Error('Not authorized to revoke this share');
    }

    await ctx.db.delete(share._id);
  },
});
