# Helora

Helora is a multi-tenant AI customer-support platform. The pnpm monorepo contains
the Clerk-authenticated dashboard (`apps/web`), the embeddable customer widget
(`apps/widget`), shared UI (`packages/ui`), and the Convex backend
(`packages/backend`).

## Requirements

- Node.js 20 or newer
- Corepack
- pnpm 10.4.1 (declared by `packageManager`; do not use another pnpm version)
- A Convex deployment, Clerk application, OpenAI account, and Cloudflare
  Turnstile site

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

The dashboard listens on port 3000 and the widget on port 3001. Secrets must
never be committed. Frontend/deployment variables belong in the hosting
platform; backend variables belong in the Convex deployment environment.
`.env.example` is the authoritative variable inventory.

## Production topology

1. Vercel serves the dashboard and widget as separate deployments.
2. The widget's same-origin `/api/contact-sessions` endpoint obtains the trusted
   client address, validates Turnstile, and signs the request to Convex.
3. Convex stores tenant data, runs AI actions, and performs daily retention.
4. Clerk signs billing/auth webhooks with Svix.
5. Vapi signs the exact raw webhook body using HMAC-SHA256.
6. AWS Secrets Manager stores tenant plugin credentials; OpenAI, Resend, and
   Twilio are outbound processors.

## Webhook configuration

### Clerk

Configure `/clerk-webhook`, subscribe to `subscription.created`,
`subscription.updated`, and `subscription.deleted`, and store the Svix signing
secret as `CLERK_WEBHOOK_SECRET` in Convex. Missing subscription data is an
explicit free-tier entitlement. Active subscriptions receive paid limits;
canceled, expired, deleted, missing, and payment-failed subscriptions receive
free limits. Provider timestamps prevent older events from overwriting newer
state.

### Vapi

Create an HMAC Custom Credential and attach its `credentialId` to every
assistant server configuration. Use:

- Algorithm: SHA-256
- Signature header: `x-vapi-signature`
- Timestamp header: `x-vapi-timestamp` (Unix seconds)
- Signed payload: `<timestamp>.<exact raw JSON body>`
- Secret: the same value as Convex `VAPI_WEBHOOK_SECRET`

The endpoint rejects missing/old signatures. Tenant identity is never accepted
from URLs or payload metadata; `call.assistantId` is resolved through the
server-side widget-settings mapping. Each assistant ID may belong to only one
organization.

Webhook records move through `received`, `processing`, `succeeded`, and `failed`.
Only succeeded events are suppressed. Failed events can be replayed with the
same provider event ID; active processing uses a ten-minute lease.

## Entitlements and abuse controls

| Limit                           | Free or missing subscription | Active paid subscription |
| ------------------------------- | ---------------------------: | -----------------------: |
| AI messages per UTC month       |                          100 |                    5,000 |
| Prompt characters per UTC month |                      500,000 |               25,000,000 |
| Model tokens per UTC month      |                      250,000 |               10,000,000 |
| Concurrent AI requests          |                            1 |                        5 |
| File storage                    |                       100 MB |                     1 GB |

All tiers also enforce 4,000 characters per prompt, 10 messages per session per
minute, 30 messages per organization per minute, 10 conversations per session
per hour, 10 MB per file, 200 files, and 50,000 estimated extracted tokens per
file. Session creation is limited by trusted address and organization after
Turnstile validation. Usage at 80% emits a structured warning; route production
logs and Convex logs to the alerting platform.

## Retention and privacy

- Contact sessions: 30-day active lifetime, deleted seven days after expiry.
- Successful webhook delivery metadata: 30 days.
- Rate-limit records: two days.
- AI concurrency leases: ten minutes and removed daily if abandoned.
- Files and conversations: retained until the organization or authorized user
  deletes them. Production launch requires a documented support runbook for a
  complete organization export/deletion, including Convex component data and
  backups; do not claim completion until that runbook has been exercised.

Convex scheduled cleanup runs daily at 03:15 UTC in batches. Monitor cleanup
counts and increase frequency if a batch repeatedly reaches 500.

## CI and deployment gates

The `CI` workflow performs a frozen install, formatting check, lint, all
workspace type checks, backend tests, and both production builds. Configure the
`CI_CONVEX_URL`, `CI_CLERK_PUBLISHABLE_KEY`, `CI_CLERK_SECRET_KEY`, and
`CI_TURNSTILE_SITE_KEY` repository secrets.

In GitHub branch protection, require the `CI / validate` status check and block
direct pushes to `main`. In Vercel, enable "Require checks to pass before
deployment" for the same check, disable production deployments from unprotected
branches, and keep preview deployments isolated from production Convex/Clerk
projects.

## Secret rotation

1. Create the replacement credential without deleting the old one.
2. Update the receiving service first (Convex or Vercel).
3. Update Clerk/Vapi/Turnstile/outbound provider configuration.
4. Verify a signed request and monitor errors.
5. Revoke the old credential and record the rotation date.

Rotating `WIDGET_PROXY_SECRET` requires a coordinated widget and Convex deploy.
Use a maintenance window unless dual-secret verification is temporarily added.

## Rollback and recovery

- Promote the last known-good immutable Vercel deployment for each app.
- Roll back backend code with the matching Git revision. Schema changes must use
  expand-then-contract; never deploy code that removes fields before old code is
  gone.
- Use Convex backups according to the paid-plan backup schedule. Test restore to
  an isolated deployment at least quarterly; never restore over production as
  the first recovery step.
- After recovery, replay only failed webhook IDs. Succeeded IDs are idempotently
  suppressed. Compare subscription state with Clerk before reopening traffic.

## Incident response

1. Contain: disable the affected webhook/assistant, rotate credentials, or
   reduce tenant limits.
2. Preserve: retain provider delivery IDs, Convex function logs, Vercel request
   IDs, and Sentry events without copying secrets or message content.
3. Assess tenant scope using organization IDs derived from server-side records.
4. Recover from a known-good deployment and replay failed events.
5. Notify affected customers and regulators according to the data-processing
   agreement and applicable timelines.
6. Write a post-incident review with corrective owners and dates.

## Validation commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @workspace/backend test
pnpm --filter web build
pnpm --filter widget build
```
