# EchoAi Development Guide

## Architecture Overview

This is a **pnpm monorepo** managing an AI-powered customer support platform with two Next.js apps sharing a Convex backend:

- **apps/web**: Admin dashboard (Clerk auth, organization management, conversations, plugins)
- **apps/widget**: Customer-facing widget (embedded via iframe with organizationId query param)
- **packages/backend**: Convex backend (BaaS) with AI agents, RAG search, and real-time updates
- **packages/ui**: Shared shadcn/ui component library with Tailwind CSS
- **packages/math, eslint-config, typescript-config**: Utility packages

## Critical Patterns

### Backend: Convex Function Organization

Convex functions in `packages/backend/convex/` follow a **visibility-based directory structure**:

- **`public/`**: Client-accessible queries/actions (require `@clerk/backend` auth validation)
- **`private/`**: Authenticated dashboard queries/mutations (use `ctx.auth.getUserIdentity()`)
- **`system/`**: Internal functions only callable via `internal.*` API (no direct client access)

Example import pattern:

```typescript
// In apps/web or apps/widget
import { api } from "@workspace/backend/_generated/api";
const data = useQuery(api.public.conversations.getMany, { ... });
```

**Never** expose system functions directly - wrap them in public/private endpoints with proper auth checks.

### Module-Based Feature Organization

Both apps use **feature modules** under `apps/{web|widget}/modules/`:

```
modules/
  feature-name/
    ui/
      views/          # Page-level components
      components/     # Feature-specific components
      layouts/        # Feature layouts
    hooks/            # Feature hooks
    atoms.ts          # Jotai state (if needed)
    constants.ts      # Feature constants
    types.ts          # Feature types
```

Page components in `app/` are minimal and import from modules:

```tsx
// apps/web/app/(dashboard)/customization/page.tsx
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";
export default function Page() {
  return <CustomizationView />;
}
```

Use `@/modules/*` imports (defined in tsconfig paths) for cross-module dependencies.

### Workspace Package Imports

Import shared packages using `@workspace/*` namespace:

```typescript
// UI components
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

// Backend (Convex)
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";

// Add UI components from root:
// pnpm dlx shadcn@latest add button -c apps/web
```

Components are **added to `packages/ui/`** but referenced via `@workspace/ui/*`.

### Convex + Clerk Integration

The web app uses **ConvexProviderWithClerk** for authenticated real-time queries:

```tsx
// apps/web/components/providers.tsx
<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
```

**Middleware pattern** (apps/web/middleware.ts):

- Protects routes with `clerkMiddleware`
- Redirects to `/org-selection` if user lacks organization context
- Public routes: `/sign-in`, `/sign-up`

Backend auth:

```typescript
// In private/ functions
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new ConvexError({ code: "UNAUTHORIZED", ... });
const orgId = identity.orgId as string;
```

Widget uses **contactSessions** (time-limited tokens) instead of Clerk for public access.

### AI Agents (@convex-dev/agent)

Convex AI agents live in `packages/backend/convex/system/ai/`:

```typescript
// system/ai/agents/supportAgent.ts
import { Agent } from "@convex-dev/agent";

export const supportAgent = new Agent(components.agent, {
  name: "Support Agent",
  instructions: SUPPORT_AGENT_PROMPT,
  tools: [escalateConversation, resolveConversation, search],
});

// Usage in actions
const result = await supportAgent.run({ ... });
```

Tools are defined with `createTool` from `@convex-dev/agent` and imported from `system/ai/tools/`.

## Development Workflows

### Starting the Monorepo

```bash
pnpm install               # Install all dependencies
pnpm dev                   # Start all apps (turbo dev)
# Runs:
# - apps/web on localhost:3000
# - apps/widget on localhost:3001 (--turbopack enabled)
# - packages/backend convex dev
```

Individual app commands:

```bash
cd apps/web && pnpm dev    # Start web only
cd packages/backend && pnpm dev  # Convex dev mode
```

### Adding Dependencies

```bash
# Add to specific workspace
pnpm --filter web add <package>
pnpm --filter @workspace/backend add <package>

# Add to root (dev tools)
pnpm add -D -w <package>
```

### TypeScript & Linting

```bash
pnpm build                 # Build all packages (respects turbo dependencies)
pnpm lint                  # ESLint across all workspaces
pnpm format                # Prettier format
cd apps/web && pnpm typecheck  # Type-check specific app
```

### Convex Schema Changes

After modifying `packages/backend/convex/schema.ts`:

1. Convex dev will auto-regenerate types in `_generated/`
2. No manual type generation needed - hot reload happens automatically
3. Clear browser cache if types appear stale in frontend

## Key Conventions

### State Management

- **Jotai** for client state (see `apps/web/modules/dashboard/atoms.ts`)
- Use `atomWithStorage` for persisted state (localStorage)
- Convex queries provide server state (no Redux/Zustand needed)

### Form Handling

- **react-hook-form** + **zod** for validation
- shadcn/ui Form components with `@hookform/resolvers/zod`
- See `apps/web/modules/customization/ui/components/customization-form.tsx` for pattern

### Data Fetching Hooks

```typescript
import {
  useQuery,
  useMutation,
  useAction,
  usePaginatedQuery,
} from "convex/react";

// Query (real-time)
const conversations = useQuery(api.public.conversations.getMany, { orgId });

// Mutation (optimistic updates)
const updateSettings = useMutation(api.private.widgetSettings.update);

// Action (async, no reactivity)
const sendMessage = useAction(api.public.messages.create);

// Pagination
const { results, status, loadMore } = usePaginatedQuery(
  api.private.files.list,
  {},
  { initialNumItems: 20 }
);
```

### Error Monitoring

**Sentry** is configured for apps/web:

- `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`
- `global-error.tsx` for error boundaries
- Test: visit `/sentry-example-page`

## Plugin System

VAPI integration example (`packages/backend/convex/private/vapi.ts`):

- Secrets stored in AWS Secrets Manager via `system/secrets.ts`
- Plugin metadata in `plugins` table with `organizationId` + `service` index
- UI configuration in `apps/web/modules/plugins/`

To add new plugins:

1. Define schema in `packages/backend/convex/schema.ts`
2. Add system functions in `system/` for secret management
3. Create private mutations/queries for CRUD
4. Build UI in `modules/plugins/ui/components/`

## Troubleshooting

**"Cannot find module '@workspace/\*'"**: Run `pnpm install` at root to link workspaces

**Convex auth errors**: Check `CLERK_JWT_ISSUER_DOMAIN` in Convex dashboard matches Clerk JWT template

**Type mismatches with Convex**: Restart dev server to regenerate `_generated/` types

**Widget not loading**: Verify `organizationId` query param and valid contactSession token

## Environment Variables

Required for apps/web:

```
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Required for packages/backend (Convex dashboard):

```
CLERK_JWT_ISSUER_DOMAIN=<your-clerk-domain>
```
