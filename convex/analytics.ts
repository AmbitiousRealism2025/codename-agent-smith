import { query } from './_generated/server';

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.isComplete).length;
    const abandonedSessions = totalSessions - completedSessions;
    const completionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100) 
      : 0;

    const providerCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      const provider = s.selectedProvider || 'unknown';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });

    const providerUsage = Object.entries(providerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const documents = await ctx.db
      .query('documents')
      .collect();

    const sessionIds = new Set(sessions.map((s) => s.sessionId));
    const userDocuments = documents.filter((d) => sessionIds.has(d.sessionId));

    const archetypeCounts: Record<string, number> = {};
    userDocuments.forEach((d) => {
      const templateId = d.templateId || 'unknown';
      archetypeCounts[templateId] = (archetypeCounts[templateId] || 0) + 1;
    });

    const archetypeUsage = Object.entries(archetypeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const completedSessionData = sessions.filter((s) => s.isComplete);
    let averageCompletionTime = 0;
    if (completedSessionData.length > 0) {
      const totalTime = completedSessionData.reduce((sum, s) => {
        return sum + (s.lastUpdatedAt - s.createdAt);
      }, 0);
      averageCompletionTime = Math.round(totalTime / completedSessionData.length / 1000 / 60);
    }

    const customTemplates = await ctx.db
      .query('templates')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const shares = await ctx.db
      .query('shares')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      completionRate,
      providerUsage,
      archetypeUsage,
      averageCompletionTime,
      customTemplatesCount: customTemplates.length,
      sharedDocumentsCount: shares.length,
    };
  },
});
