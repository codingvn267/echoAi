# Deploying echoAi to production

This guide walks you (a first-time SaaS founder) from a fresh git clone to a live
production site at `https://echoai.app` with sign-in, billing, and the embeddable widget.

It assumes you can use a terminal and you have a credit card to register the providers below
(most have free tiers).

---

## What you'll need (free accounts)

| Service                                             | What it does                                  | Cost |
|-----------------------------------------------------|-----------------------------------------------|------|
| [Vercel](https://vercel.com)                        | Hosts `apps/web` and `apps/widget`            | Free |
| [Convex](https://convex.dev)                        | Database + serverless functions for the app   | Free |
| [Clerk](https://clerk.com)                          | Auth + organizations + **billing**            | Free |
| [Vapi](https://vapi.ai)                             | Voice AI (only if you want voice calls)       | Pay-as-you-go |
| [Sentry](https://sentry.io)                         | Error monitoring (optional but recommended)   | Free |
| A domain (e.g. echoai.app)                          | Custom domain                                 | ~$10/yr |

---

## 0. Local setup

```bash
git clone https://github.com/tbot6677028-beep/echoAi.git
cd echoAi

# Use Node 20+ and pnpm 10+
corepack enable
pnpm install
```

---

## 1. Set up Convex (your database)

Convex stores conversations, widget settings, plugins, and subscription status.

```bash
cd packages/backend
pnpm setup           # runs `convex dev --until-success`
```

This will:
- Open a browser to log into Convex
- Create a new project (call it `echoai-prod` or similar)
- Generate types in `_generated/`
- Print your **Convex URL** — copy it (looks like `https://xxx-yyy.convex.cloud`)

Set the URL in `apps/web/.env.local` (see step 3).

---

## 2. Set up Clerk (auth + billing)

1. Go to https://dashboard.clerk.com → create an application.
2. **Enable Organizations**: Settings → Organizations → toggle ON.
   - Force users to belong to an organization (echoAi multi-tenants by org).
3. **Enable Billing**: Settings → Billing → enable Clerk Billing.
   - Create your **Pro** plan (e.g. $29/mo) — give it the **slug `pro`**
     (the dashboard's `<Protect plan="pro">` checks this exact slug).
4. **Get your API keys**: API Keys → copy `Publishable Key` and `Secret Key`.
5. **Set up the subscription webhook so Convex can react to upgrades/downgrades**:
   - Webhooks → Add endpoint
   - Endpoint URL: `https://<your-convex-deployment>.convex.site/clerk-webhook`
     (replace `.cloud` with `.site` for the HTTP actions endpoint)
   - Subscribe to: `subscription.updated`
   - Copy the **Signing secret** (starts with `whsec_`)
   - In your terminal:
     ```bash
     cd packages/backend
     npx convex env set CLERK_WEBHOOK_SECRET whsec_xxxxx
     npx convex env set CLERK_SECRET_KEY sk_test_xxxxx
     ```

---

## 3. Configure `apps/web/.env.local`

```bash
cp apps/web/.env.example apps/web/.env.local
# fill in the values from steps 1 & 2
```

---

## 4. Run it locally

```bash
# from the repo root
pnpm dev
```

Open:
- http://localhost:3000 — marketing landing
- http://localhost:3000/sign-up — create your first account
- After sign-up you'll be sent through `/org-selection` → create an org → land on `/dashboard`
- http://localhost:3001 — embeddable widget

---

## 5. Deploy to Vercel

### a) Push to GitHub (already done)

```bash
git push origin main
```

### b) Import the repo into Vercel

1. https://vercel.com/new → import `tbot6677028-beep/echoAi`
2. **Root directory**: leave as repo root (Turborepo handles it)
3. **Build & Output Settings**:
   - Framework Preset: **Next.js**
   - Build command: `cd apps/web && pnpm build` (Vercel usually auto-detects via Turborepo)
4. **Environment variables** — paste everything from `apps/web/.env.example`
   with the real values, **for all environments** (Production, Preview, Development)
5. Click **Deploy**

Repeat for `apps/widget` as a **separate Vercel project** (or leave it for later).

### c) Connect your domain

1. Vercel → Settings → Domains → add `echoai.app` and `www.echoai.app`
2. Update DNS records as Vercel instructs.
3. Update `NEXT_PUBLIC_SITE_URL` env var in Vercel to `https://echoai.app`.
4. In Clerk dashboard → Domains → add `echoai.app` to the allowed list.

### d) Re-point your Clerk webhook

Edit the webhook from step 2 to use the **production** Convex URL
(it might be the same if you only have one Convex deployment — verify in the Convex dashboard).

---

## 6. Test the full flow

1. Open `https://echoai.app` (incognito) → see landing page ✓
2. Click **Start free** → Clerk sign-up form ✓
3. Create account → org-selection → create your first org → `/dashboard` ✓
4. `/conversations` shows the (empty) inbox ✓
5. `/billing` shows the Clerk pricing table ✓
6. Click **Upgrade to Pro** → Clerk handles checkout → returns to `/billing` ✓
7. Convex receives the `subscription.updated` webhook → `subscriptions` table updated ✓
8. `/customization` and `/files` (Pro-only) become accessible ✓

---

## 7. Optional polish

- **Custom domain for the widget**: deploy `apps/widget` to `widget.echoai.app`.
- **Sentry**: add `NEXT_PUBLIC_SENTRY_DSN` env var to start receiving error reports.
- **OG image**: already auto-generated at `/opengraph-image` — preview by visiting that URL.
- **Sitemap**: live at `/sitemap.xml` — submit it in Google Search Console.
- **Analytics**: add `@vercel/analytics` and `@vercel/speed-insights` (no code change needed
  beyond the package install if you use Vercel).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Sign-in spins forever | Clerk publishable key wrong env var name (`NEXT_PUBLIC_…`) or middleware excluded `/sign-in` |
| Always redirected to `/org-selection` | You need to create an organization for the signed-in user |
| Webhook fails | Convex env var `CLERK_WEBHOOK_SECRET` doesn't match Clerk dashboard |
| `/billing` empty | Enable Billing in Clerk dashboard and create a `pro` plan |
| Build fails on Vercel | Make sure Vercel Project's `Install Command` is `pnpm install` and Node version is 20 |

---

## Repo layout (quick reference)

```
echoAi/
├── apps/
│   ├── web/        ← marketing + dashboard (this app)
│   │   └── app/
│   │       ├── (marketing)/   ← /, /pricing, /about, /legal/*
│   │       ├── (auth)/        ← /sign-in, /sign-up, /org-selection
│   │       └── (dashboard)/   ← /dashboard, /conversations, /billing, ...
│   └── widget/     ← embeddable customer-facing widget
└── packages/
    ├── backend/    ← Convex schema + functions (shared by web + widget)
    └── ui/         ← shadcn/ui components (shared)
```
