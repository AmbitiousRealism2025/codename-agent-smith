# Clerk + Convex Integration Context Document

**Source:** Context7 + Exa (January 2026)  
**Relevance:** Stage 2 Tasks 013-019, 021-024

---

## Quick Reference

```bash
# Install packages
bun add @clerk/clerk-react convex

# Environment variables (.env.local)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## 1. Clerk Dashboard Setup

### Step 1: Create Clerk Application
1. Sign up at [clerk.com](https://dashboard.clerk.com/sign-up)
2. Create new application
3. Choose sign-in methods (email, Google, GitHub, etc.)

### Step 2: Create JWT Template for Convex
1. Go to **JWT Templates** in Clerk Dashboard
2. Click **New Template** → Select **Convex**
3. **DO NOT rename the template** - must stay "convex"
4. Copy the **Issuer URL** (looks like `https://your-app.clerk.accounts.dev`)

### Step 3: Configure Convex with Clerk Issuer
Create `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: "https://your-app.clerk.accounts.dev",  // From JWT template
      applicationID: "convex",
    },
  ],
};
```

Deploy: `bunx convex dev` or `bunx convex deploy`

---

## 2. React Provider Setup

### File: `src/main.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import App from "./App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
);
```

**Key Points:**
- `ClerkProvider` wraps `ConvexProviderWithClerk`
- Pass `useAuth` hook to `ConvexProviderWithClerk`
- Convex automatically gets JWT token from Clerk

---

## 3. Authentication UI Components

### Basic Auth UI

```typescript
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
}
```

### Custom Sign-In Page

```typescript
import { SignIn } from "@clerk/clerk-react";

export function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn 
        path="/sign-in" 
        routing="path" 
        signUpUrl="/sign-up"
        afterSignInUrl="/advisor"
      />
    </div>
  );
}
```

---

## 4. Client-Side Auth Hooks

### useConvexAuth (Convex + Clerk state)

```typescript
import { useConvexAuth } from "convex/react";

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
```

### useUser (Clerk user data)

```typescript
import { useUser } from "@clerk/clerk-react";

function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <SignInPrompt />;

  return (
    <div>
      <img src={user.imageUrl} alt="Profile" />
      <h1>{user.fullName}</h1>
      <p>{user.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

### useAuth (Auth utilities)

```typescript
import { useAuth } from "@clerk/clerk-react";

function TokenDemo() {
  const { getToken, signOut, userId } = useAuth();

  const fetchWithAuth = async () => {
    const token = await getToken();
    // Use token for external API calls if needed
  };

  return (
    <div>
      <p>User ID: {userId}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

---

## 5. Server-Side Auth (Convex Functions)

### Accessing User Identity

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user identity
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return {
      clerkId: identity.subject,           // Clerk user ID
      email: identity.email,               // Email address
      name: identity.name,                 // Full name
      pictureUrl: identity.pictureUrl,     // Profile image
      emailVerified: identity.emailVerified,
    };
  },
});

// Protected query - throws if not authenticated
export const getMyData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// Protected mutation
export const createSession = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("sessions", {
      userId: identity.subject,  // Use Clerk ID as userId
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
```

### UserIdentity Object Shape

```typescript
interface UserIdentity {
  subject: string;          // Clerk user ID (e.g., "user_2abc123...")
  issuer: string;           // Clerk issuer URL
  email?: string;           // Primary email
  emailVerified?: boolean;  // Email verification status
  name?: string;            // Full name
  nickname?: string;        // Display name
  givenName?: string;       // First name
  familyName?: string;      // Last name
  pictureUrl?: string;      // Profile image URL
  updatedAt?: number;       // Last updated timestamp
}
```

---

## 6. Protected Routes Pattern

### Route Guard Component

```typescript
import { useConvexAuth } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
```

### Router Setup

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 7. User Profile Management

### Syncing Clerk User to Convex

```typescript
// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: identity.name,
        email: identity.email,
        imageUrl: identity.pictureUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: identity.name ?? "Anonymous",
        email: identity.email ?? "",
        imageUrl: identity.pictureUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
```

### Auto-sync on Login

```typescript
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";

function AuthSync({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (isAuthenticated) {
      syncUser().catch(console.error);
    }
  }, [isAuthenticated, syncUser]);

  return <>{children}</>;
}
```

---

## 8. Schema with User References

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),           // Clerk user ID (subject)
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.union(v.literal("light"), v.literal("dark")),
      notifications: v.boolean(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.string(),            // References users.clerkId
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
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
    .index("by_user_status", ["userId", "status"]),
});
```

---

## 9. Error Handling

### Client-side

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function CreateButton() {
  const createSession = useMutation(api.sessions.create);

  const handleCreate = async () => {
    try {
      const id = await createSession({ name: "New Session" });
      console.log("Created:", id);
    } catch (error) {
      if (error.message === "Not authenticated") {
        // Redirect to sign in
      } else {
        // Show error toast
      }
    }
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### Server-side

```typescript
export const sensitiveOperation = mutation({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Authentication check
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Authorization check
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Proceed with operation
    return await ctx.db.insert("sensitive_data", { data: args.data });
  },
});
```

---

## 10. Testing Considerations

### Mock Auth in Tests

```typescript
// test/mocks/convex.ts
export const mockIdentity = {
  subject: "user_test123",
  email: "test@example.com",
  name: "Test User",
  emailVerified: true,
};

// In test setup, mock useConvexAuth
vi.mock("convex/react", async () => {
  const actual = await vi.importActual("convex/react");
  return {
    ...actual,
    useConvexAuth: () => ({
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});
```

---

## 11. Environment Variables Summary

```bash
# .env.local (development)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://your-dev.convex.cloud

# Production
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CONVEX_URL=https://your-prod.convex.cloud
```

**Security Notes:**
- `pk_` keys are safe for client-side
- Never expose `sk_` (secret) keys in frontend code
- Convex handles JWT validation server-side automatically

---

## 12. Migration Checklist

When migrating from local-only auth (IndexedDB) to Clerk + Convex:

1. [ ] Create Clerk application and configure sign-in methods
2. [ ] Create JWT template for Convex in Clerk Dashboard
3. [ ] Add `convex/auth.config.ts` with Clerk issuer
4. [ ] Install `@clerk/clerk-react` and update providers
5. [ ] Replace `ConvexProvider` with `ConvexProviderWithClerk`
6. [ ] Add `ctx.auth.getUserIdentity()` to protected Convex functions
7. [ ] Create users table with `clerkId` index
8. [ ] Add user sync mutation on login
9. [ ] Update routes with `ProtectedRoute` guards
10. [ ] Test auth flow end-to-end
