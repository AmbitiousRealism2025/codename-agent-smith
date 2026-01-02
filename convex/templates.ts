import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Must be authenticated to create templates');
    }

    const now = Date.now();
    const templateId = await ctx.db.insert('templates', {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      basedOn: args.basedOn,
      capabilityTags: args.capabilityTags,
      idealFor: args.idealFor,
      documentSections: args.documentSections,
      planningChecklist: args.planningChecklist,
      architecturePatterns: args.architecturePatterns,
      riskConsiderations: args.riskConsiderations,
      successCriteria: args.successCriteria,
      implementationGuidance: args.implementationGuidance,
      createdAt: now,
      updatedAt: now,
    });

    return templateId;
  },
});

export const update = mutation({
  args: {
    id: v.id('templates'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    capabilityTags: v.optional(v.array(v.string())),
    idealFor: v.optional(v.array(v.string())),
    documentSections: v.optional(v.string()),
    planningChecklist: v.optional(v.array(v.string())),
    architecturePatterns: v.optional(v.array(v.string())),
    riskConsiderations: v.optional(v.array(v.string())),
    successCriteria: v.optional(v.array(v.string())),
    implementationGuidance: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Must be authenticated to update templates');
    }

    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error('Template not found');
    }

    if (template.userId !== identity.subject) {
      throw new Error('Not authorized to update this template');
    }

    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('templates') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Must be authenticated to delete templates');
    }

    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error('Template not found');
    }

    if (template.userId !== identity.subject) {
      throw new Error('Not authorized to delete this template');
    }

    await ctx.db.delete(args.id);
  },
});

export const get = query({
  args: { id: v.id('templates') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== identity.subject) {
      return null;
    }

    return template;
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
      .query('templates')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query('templates')
      .withIndex('by_name', (q) => 
        q.eq('userId', identity.subject).eq('name', args.name)
      )
      .first();
  },
});
