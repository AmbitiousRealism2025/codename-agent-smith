# Task 2.6.5: Analytics Dashboard (Basic)

**Task ID**: 2.6.5
**Phase**: 2.6 - Enhanced Features
**Estimated**: 4 hours
**Dependencies**: Task 2.3.4 (Clerk-Convex Connection)
**Status**: Not Started

---

## Overview

Create a basic analytics dashboard showing user's session statistics.

---

## Deliverables

- [ ] Track sessions started, completed, abandoned
- [ ] Track most popular archetypes
- [ ] Track provider usage
- [ ] Simple dashboard in settings

---

## Files to Create

```
convex/
└── analytics.ts           # Analytics aggregation

packages/web/src/
├── pages/
│   └── AnalyticsPage.tsx
└── components/analytics/
    ├── StatsCard.tsx
    └── UsageChart.tsx
```

---

## Success Criteria

- Basic stats displayed
- Data aggregated correctly
- Privacy-respecting (user's own data only)

---

## Notes

Analytics to track (per user):
- Total sessions started
- Sessions completed
- Sessions abandoned (started but not finished)
- Completion rate percentage
- Most used archetypes (pie chart)
- Provider usage distribution
- Average time to complete interview

Privacy considerations:
- All analytics are personal (user sees only their data)
- No tracking across users
- No external analytics services
- Data stored in Convex with user scoping

UI components:
- `StatsCard` - Single metric with icon (e.g., "12 Sessions Completed")
- `UsageChart` - Simple pie/bar chart using Recharts or similar

Keep it simple for Stage 2. Advanced analytics can come in Stage 3.
