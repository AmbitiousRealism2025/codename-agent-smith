# Convex Backend Context Document

**Source:** Context7 + Exa (January 2026)  
**Relevance:** Stage 2 Tasks 011, 012, 021-024

---

## Quick Reference

```bash
# Install
bun add convex

# Initialize (creates convex/ directory)
bunx convex dev
```

```typescript
// Environment variable (Vite)
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## 1. Project Setup (React + Vite)

### Provider Setup (main.tsx)

```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
);
```

---

## 2. Schema Definition

### File: `convex/schema.ts`

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table with all field types
  sessions: defineTable({
    userId: v.string(),
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    responses: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
      timestamp: v.number(),
    })),
    classification: v.optional(v.object({
      archetype: v.string(),
      confidence: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Reference another table with v.id()
  documents: defineTable({
    sessionId: v.id("sessions"),
    content: v.string(),
    format: v.string(),
  })
    .index("by_session", ["sessionId"]),
});
```

### Validator Types

```typescript
import { v } from "convex/values";

v.id("tableName")      // Reference to another document
v.null()               // Null value
v.number()             // Float64
v.int64()              // BigInt for large integers
v.boolean()            // true/false
v.string()             // Text
v.bytes()              // ArrayBuffer
v.array(v.string())    // Array of strings
v.object({ key: v.string() })  // Nested object
v.record(v.string(), v.number())  // Dynamic keys
v.optional(v.string()) // Optional field
v.union(v.literal("a"), v.literal("b"))  // Enum-like
```

---

## 3. Query Functions

### File: `convex/sessions.ts`

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

// Simple query - list all
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sessions").collect();
  },
});

// Query with argument
export const getById = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query with index
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Query with filter and order
export const getActiveByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")  // by _creationTime
      .collect();
  },
});

// Pagination
export const listPaginated = query({
  args: { paginationOpts: v.object({ cursor: v.optional(v.string()), numItems: v.number() }) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

---

## 4. Mutation Functions

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Insert
export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("sessions", {
      userId: args.userId,
      name: args.name,
      status: "active",
      responses: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Update (patch)
export const update = mutation({
  args: {
    id: v.id("sessions"),
    name: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Replace entire document
export const replace = mutation({
  args: { id: v.id("sessions"), data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.replace(args.id, args.data);
  },
});

// Delete
export const remove = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Add to array field
export const addResponse = mutation({
  args: {
    sessionId: v.id("sessions"),
    questionId: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    
    await ctx.db.patch(args.sessionId, {
      responses: [...session.responses, {
        questionId: args.questionId,
        answer: args.answer,
        timestamp: Date.now(),
      }],
      updatedAt: Date.now(),
    });
  },
});
```

---

## 5. React Hooks Usage

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function SessionList() {
  // Queries auto-subscribe to real-time updates
  const sessions = useQuery(api.sessions.getByUser, { userId: "user123" });
  
  // Skip query conditionally
  const session = useQuery(
    api.sessions.getById,
    sessionId ? { id: sessionId } : "skip"
  );

  // Mutations return promises
  const createSession = useMutation(api.sessions.create);
  const updateSession = useMutation(api.sessions.update);

  const handleCreate = async () => {
    const id = await createSession({ userId: "user123", name: "New Session" });
    console.log("Created:", id);
  };

  if (sessions === undefined) return <Loading />;
  
  return (
    <ul>
      {sessions.map(s => <li key={s._id}>{s.name}</li>)}
    </ul>
  );
}
```

---

## 6. Index Best Practices

```typescript
// GOOD: Use withIndex for filtering
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channel", channelId))
  .collect();

// BAD: Full table scan with filter only
const messages = await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("channel"), channelId))
  .collect();

// GOOD: Compound index for multiple fields
.index("by_user_status", ["userId", "status"])

// Query compound index
.withIndex("by_user_status", (q) => 
  q.eq("userId", userId).eq("status", "active")
)

// Range queries on last index field
.withIndex("by_channel", (q) => q
  .eq("channel", channel)
  .gt("_creationTime", Date.now() - 60000)
)
```

---

## 7. File Structure

```
convex/
  _generated/       # Auto-generated (don't edit)
    api.d.ts
    api.js
    dataModel.d.ts
    server.d.ts
    server.js
  schema.ts         # Database schema
  sessions.ts       # Session-related functions
  documents.ts      # Document-related functions
  auth.config.ts    # Auth configuration (with Clerk)
```

---

## 8. Common Patterns

### Optimistic Updates (Client-side)

```typescript
const updateSession = useMutation(api.sessions.update)
  .withOptimisticUpdate((localStore, args) => {
    const session = localStore.getQuery(api.sessions.getById, { id: args.id });
    if (session) {
      localStore.setQuery(api.sessions.getById, { id: args.id }, {
        ...session,
        ...args,
      });
    }
  });
```

### Authenticated Queries

```typescript
import { query } from "./_generated/server";

export const getMyData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
```

---

## 9. Migration from IndexedDB/Dexie

| Dexie Pattern | Convex Equivalent |
|---------------|-------------------|
| `db.sessions.add(data)` | `ctx.db.insert("sessions", data)` |
| `db.sessions.get(id)` | `ctx.db.get(id)` |
| `db.sessions.update(id, changes)` | `ctx.db.patch(id, changes)` |
| `db.sessions.delete(id)` | `ctx.db.delete(id)` |
| `db.sessions.where("userId").equals(id)` | `.withIndex("by_user", q => q.eq("userId", id))` |
| `db.sessions.toArray()` | `.collect()` |
| `db.sessions.first()` | `.first()` |

---

## 10. CLI Commands

```bash
# Start development (creates deployment, watches files)
bunx convex dev

# Deploy to production
bunx convex deploy

# Generate types after schema changes
bunx convex codegen

# View logs
bunx convex logs

# Open dashboard
bunx convex dashboard
```
