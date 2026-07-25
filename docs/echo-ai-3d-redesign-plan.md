# Helora "Aurora Signal" Redesign — Phase Plan & Checklist

Brand name: **Helora** (not "echoAi" — standardized in Phase 0; see notes below).
Design identity: **Aurora Signal** — bright, colorful, light-forward chromatic
palette with a neon cyan→emerald `neo` accent, built on top of the existing
shadcn/Tailwind v4 token system rather than replacing it.

Tracking doc for the multi-phase UI/motion redesign of `apps/web` (marketing +
dashboard) and `apps/widget`. Each phase must pass its validation before the
next begins. Do not skip ahead.

---

## Phase 0 — Baseline, brand, and content audit ✅ DONE

- [x] Baseline validation: `pnpm format:check`, `pnpm typecheck`, `pnpm build`,
      `pnpm --filter @workspace/backend test` all pass before any redesign work.
      (`pnpm lint` fails only on 3 pre-existing warnings unrelated to this work —
      see Known limitations.)
- [x] Brand audit: standardized all public-facing "echoAi"/"echoai.app" strings
      to "Helora"/"helora.ai" across hero, header, footer, pricing, about,
      legal pages, OG image, sitemap/robots, dashboard empty state.
  - Left untouched: the real external GitHub repo URL
    (`github.com/tbot6677028-beep/echoAi`), `.github/copilot-instructions.md`
    title, `apps/web/DEPLOY.md` (docs-only, not rendered to users).
  - Confirmed "Lumière" / "Lumière Med Spa" in the marketing mocks is an
    intentional fictional example customer, not a brand error — left as-is.
- [x] Content audit: flagged that hero/features/testimonials copy is generic
      "customer support" language that doesn't fully match the med-spa/booking
      positioning already established in `marketing/constants.ts`; flagged
      existing testimonials/stats as illustrative, not verified.

**Files changed:** `apps/web/app/layout.tsx`, `apps/web/app/opengraph-image.tsx`,
`apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`,
`apps/web/modules/marketing/ui/components/marketing-header.tsx`,
`apps/web/modules/marketing/ui/components/marketing-footer.tsx`,
`apps/web/modules/marketing/ui/sections/{hero,final-cta,faq,features,testimonials,pricing-preview,how-it-works}.tsx`,
`apps/web/app/(marketing)/{pricing,about,legal/privacy,legal/terms}/page.tsx`,
`apps/web/modules/dashboard/ui/views/conversations-view.tsx`.

---

## Phase 1 — Aurora Signal design system ✅ DONE

- [x] Installed `motion`, `lenis`, `three`, `@react-three/fiber`,
      `@react-three/drei` in `apps/web`; `motion` in `apps/widget`. Verified
      React 19.1.1 satisfies all peer ranges before installing.
- [x] Extended `packages/ui/src/styles/globals.css` with Aurora Signal tokens
      (`--neo-blue`, `--neo-green`, `--aurora-{cyan,sky,emerald,violet,coral,navy}`,
      `--gradient-neo`, `--gradient-aurora`, `--glow-neo`, `--duration-*`,
      `--ease-signal`, `--text-{display,section,body-lg}`) for both `:root`
      and `.dark`, registered in `@theme inline` — did **not** replace the
      existing neutral shadcn tokens.
- [x] Added scoped surface classes `.marketing-aurora`, `.auth-aurora`,
      `.dashboard-aurora`, `.widget-aurora` that only override
      background/card/popover/muted/border/ring per surface.
- [x] Added `variant="neo"` to `buttonVariants` in
      `packages/ui/src/components/button.tsx`: cyan→emerald gradient, deep
      navy text (not white) for contrast, restrained hover-only glow,
      transform-only hover lift, visible `focus-visible` ring, no layout shift.
      Applied it to the hero and final-CTA primary buttons only.
- [x] Created `packages/ui/src/components/aurora-background.tsx` — pure CSS,
      no Motion dependency, `absolute inset-0` (never `fixed`), configurable
      intensity, cyan/emerald/violet/coral blobs, optional dot-grid variant,
      reuses the existing reduced-motion-safe `animate-helora-aurora` keyframe.
- [x] Updated Clerk `colorPrimary` to `#06b6d4` and `viewport.themeColor` to
      the new light/dark Aurora backgrounds in `apps/web/app/layout.tsx`.
- [x] Removed the forced `.dark` class from the marketing layout in favor of
      `.marketing-aurora` (light-forward); applied `.auth-aurora` to the
      shared auth layout.
- [x] Visually verified via local dev server + browser screenshots: Aurora
      tokens, `neo` button, Helora branding, and `.auth-aurora` background all
      render correctly; auth route protection (redirect to `/sign-in`) and the
      widget's default loading flow are unaffected.

**Files changed:** `packages/ui/src/styles/globals.css`,
`packages/ui/src/components/button.tsx`, `apps/web/app/layout.tsx`,
`apps/web/app/(marketing)/layout.tsx`,
`apps/web/modules/auth/ui/layouts/auth-layouts.tsx`,
`apps/web/modules/marketing/ui/sections/{hero,final-cta}.tsx`.

**Files created:** `packages/ui/src/components/aurora-background.tsx`,
`docs/echo-ai-3d-redesign-plan.md` (this file).

**Dependencies installed:** `apps/web`: `motion`, `lenis`, `three`,
`@react-three/fiber`, `@react-three/drei`. `apps/widget`: `motion`.

**Known limitations / flagged, not fixed here:**
- Clerk's sign-in/sign-up card still literally reads "Sign in to EchoAi" — this
  text comes from Clerk's own Dashboard "Application name" setting tied to the
  API keys, not from this repo. Requires a manual update in the Clerk
  Dashboard; cannot be changed from code.
- Marketing hero gradient text, `mesh-background.tsx` blob colors, and the
  dashboard/widget hero mocks are still visually tuned for the old dark theme
  — this is expected and explicitly deferred to Phase 2 (2.1–2.2 rework the
  hero visual and copy for the new light-forward palette).
- `.dashboard-aurora` / `.widget-aurora` classes exist but are **not yet
  applied** anywhere — that is correctly deferred to Phase 3 and Phase 4.

---

## Phase 2 — 2026 marketing experience ✅ DONE (scoped)

- [x] Replaced the old dark-tuned violet/pink gradient headline with a shared
      `.text-gradient-aurora` utility (cyan→emerald→violet), applied across
      hero, features, how-it-works, pricing, pricing-preview, testimonials,
      final-cta, about.
- [x] Re-tinted `mesh-background.tsx` blobs to cyan/violet/emerald.
- [x] Built the proprietary **Echo Signal** WebGL visual: translucent
      core, 3 orbiting knowledge/response nodes, 2 response rings, 1 pulsing
      escalation node — split across 3 files
      (`echo-signal-scene.tsx`/`echo-signal-canvas.tsx`/`echo-signal-hero.tsx`)
      so `three`/`@react-three/fiber`/`@react-three/drei` code-split away from
      the main bundle via `next/dynamic(..., { ssr: false })`. Full fallback
      chain: WebGL feature detection, reduced-motion check, small-viewport /
      low-core-count check, a class-based error boundary, `webglcontextlost`
      handling, and an IntersectionObserver + `visibilitychange` pause
      (`frameloop="never"` when off-screen/tab hidden). Pointer parallax is
      tracked via a plain ref, never React state, inside `useFrame`.
      `MeshBackground` always renders underneath first — zero layout shift,
      and a fully working page even if WebGL is unavailable.
- [x] Added `SmoothScrollProvider` (Lenis) — marketing layout only, skipped
      for reduced motion, destroyed on unmount.
- [x] Added `HeroHeadlineEmphasis` (per-word entrance via Motion, real
      crawlable DOM text, reduced-motion-safe) and `MagneticWrapper` (subtle,
      mouse-only, hero CTA only, never affects keyboard focus).
- [x] Added `TldrStrip` — reuses only facts already stated elsewhere on the
      page (no new numbers/claims).
- [x] Applied `.auth-aurora`/`.marketing-aurora` scopes already cover
      pricing/about/legal pages (same route group/layout) — updated their
      gradient headings to match.
- [x] Fixed a real, previously-latent TypeScript issue surfaced by adding
      `@react-three/fiber`: its global `JSX.IntrinsicElements` augmentation
      broke two unrelated polymorphic-component patterns
      (`Reveal`'s `as` prop, `Features`' dynamic icon prop). Fixed by
      narrowing both to concrete types instead of `React.ElementType` — see
      `/memories/repo/validation.md` for the full explanation. No lint/type
      rules were weakened.
- [x] Installed `@types/three` (the installed `three@0.185.1` has no `types`
      condition in its package exports).
- [x] Verified live in-browser: gradient headline, neo CTA, TL;DR strip,
      product mock, full accessible heading text, no console errors, no
      horizontal overflow.

**Deliberately scoped down / deferred (documented, not silently dropped):**
- Did **not** literally reorder `page.tsx`'s sections into the full 10-stage
  IA from the original brief. The existing order (Hero+TL;DR → LogosMarquee →
  Features → HowItWorks → PricingPreview → Testimonials → Faq → FinalCta)
  already satisfies the same intent (capabilities → setup/guided-story →
  proof → pricing → FAQ → CTA) without the churn/risk of a full reshuffle.
- Did **not** rewrite `marketing-shell.tsx` — confirmed there is no `/guides`
  route using it anywhere in the app; it's currently dead code, not a live
  page, so it was left alone rather than reskinning unreachable code.
- Did **not** touch `marketing/constants.ts` or `landing-view.tsx` — both are
  unused/unwired alternate drafts of the marketing copy (a med-spa-specific
  narrative) that were never connected to the live `page.tsx`. Repositioning
  the live site's narrative to match them is a product/content decision, not
  a visual-redesign decision, so it's flagged here rather than auto-merged.
- Testimonials/stats content itself was not altered (still flagged from
  Phase 0 as needing owner verification) — only their visual styling changed.
- Did not add GSAP, SplitType, or a global custom cursor (per the original
  scope decision).

**Files created:** `apps/web/modules/marketing/ui/components/{echo-signal-scene,echo-signal-canvas,echo-signal-hero,smooth-scroll-provider,tldr-strip,hero-headline-emphasis,magnetic-wrapper}.tsx`

**Files modified:** `packages/ui/src/styles/globals.css` (`.text-gradient-aurora`),
`apps/web/modules/marketing/ui/components/mesh-background.tsx`,
`apps/web/modules/marketing/ui/components/reveal.tsx` (typing fix only, same public API),
`apps/web/modules/marketing/ui/sections/{hero,features,how-it-works,final-cta,pricing-preview,testimonials}.tsx`,
`apps/web/app/(marketing)/{layout,pricing/page,about/page}.tsx`.

**Dependencies installed:** `apps/web`: `@types/three` (dev).

## Phase 3 — Dashboard polish ✅ DONE

- [x] Applied `.dashboard-aurora` to the `<main>` root in `dashboard_layout.tsx`
      (still an `async` Server Component — not converted to a Client
      Component) plus a low-intensity (`0.05`) shared `AuroraBackground`
      layer behind all dashboard content.
- [x] Added `DashboardPageTransition` — a small pathname-keyed Client wrapper
      with a short (220ms) enter-only opacity+translate animation. No
      `AnimatePresence`/`mode="wait"`, no assumption of reliable exit
      animation from persistent layouts, reduced-motion renders immediately.
- [x] Replaced the sidebar's hard-coded legacy cyan hex active-nav gradient
      (`#7dd3e4`→`#c4eef5`) with the Aurora token gradient
      (`from-aurora-cyan to-aurora-emerald`); inactive hover now uses the
      scoped `--accent` token instead of another hard-coded hex.
- [x] Applied `neo` only to genuinely primary actions: "Save Settings"
      (customization), "Connect" (Vapi plugin dialog), "Add New" and "Upload"
      (knowledge base), "View Plans" (premium-feature upgrade prompt). Left
      every other button (including all Cancel/Disconnect/destructive
      actions) untouched.
- [x] Deliberately preserved `ConversationStatusButton`'s existing semantic
      variants (`tertiary`=resolved, `warning`=escalated,
      `destructive`=unresolved) — these are exactly the "preserve destructive
      red / warning amber semantics" the plan calls out, so they were left
      alone rather than reskinned.
- [x] No WebGL, Lenis, grain, or global pointer effects added to the
      dashboard; resizable panels, Jotai/Convex/Clerk providers, sidebar
      collapse behavior, and organization switching all verified unaffected
      (auth redirect to `/sign-in?redirect_url=...` still works correctly).

**Known benign warning:** `THREE.Clock: This module has been deprecated...`
appears in the console — this comes from `@react-three/fiber`'s internal use
of `useFrame(({ clock }) => ...)`, not from application code; it is
non-blocking and does not affect functionality.

**Files created:** `apps/web/modules/dashboard/ui/components/dashboard-page-transition.tsx`

**Files modified:** `apps/web/modules/dashboard/ui/layouts/dashboard_layout.tsx`,
`apps/web/modules/dashboard/ui/components/dashboard-sidebar.tsx`,
`apps/web/modules/customization/ui/components/customization-form.tsx`,
`apps/web/modules/plugins/ui/views/vapi-view.tsx`,
`apps/web/modules/files/ui/views/files-view.tsx`,
`apps/web/modules/files/ui/components/upload_dialog.tsx`,
`apps/web/modules/billing/ui/components/premium-feature-overlay.tsx`.

## Phase 4 — Widget redesign ✅ DONE

- [x] Applied `.widget-aurora` scope to the `<main>` root in `widget-view.tsx`.
- [x] Added Motion-based screen transitions: a `motion.div` keyed by `screen`,
      160ms opacity+translate, no `AnimatePresence`/exit animation (so there's
      no blank frame while waiting for an exit to finish), reduced-motion
      renders immediately. Component height/input focus unaffected since
      content mounts immediately, only its opacity/position animates in.
- [x] Message animation: new `useNewMessageIds` hook distinguishes a
      genuine real-time tail-append from an infinite-scroll pagination
      prepend (by comparing the previous vs. current first message id) so
      **only newly received messages animate in** — the initial batch and
      any older messages loaded via "load more" never replay the animation.
      Scroll anchoring (`topElementRef`) and stable `key={message.id}` were
      left untouched.
- [x] Message surfaces: added **scoped** `className` overrides directly at
      the widget's `<AIMessageContent>` call site (assistant = pale
      cyan-mint glass, user = violet→cyan gradient) — the shared
      `packages/ui` `AIMessage`/`AIMessageContent` component defaults used by
      the dashboard's `ConversationIdView` were **not** touched.
- [x] `widget-header.tsx`: replaced the hard-coded legacy cyan hex gradient
      with the Aurora token gradient (cyan→emerald). There was no existing
      per-organization color customization in this component to preserve —
      confirmed via search — so this is a pure default-brand refresh.
- [x] `widget-footer.tsx`: selected nav icon now uses `text-aurora-cyan`
      instead of the generic `text-primary`; added `.pb-safe` (safe-area
      bottom padding) for devices with a home indicator.
- [x] Applied `neo` selectively, explicitly at each call site (never by
      changing shared component defaults): the "Start chat" launcher button,
      the chat "Send" button (`AIInputSubmit`), and the voice screen's
      "Start" call button.
- [x] **Preserved** `destructive` on "End call" and the semantic
      green/red speaking-state dot indicators in `widget-voice-screen.tsx` —
      left untouched per "preserve destructive styling for ending a call and
      semantic colors for connection errors."
- [x] `.h-dvh-safe` utility (100vh, then 100dvh — guaranteed cascade
      fallback via two declarations in one rule, not two separate Tailwind
      utility classes) replaces the old `h-screen` on the widget root.
- [x] Verified live: no new console errors, header renders with the new
      gradient, loading/selection flow unaffected, same pre-existing
      `Permissions-Policy` warning as Phase 0 baseline (unrelated).
- [x] No WebGL, Lenis, global grain, or custom cursor added to the widget.

**Files created:** `apps/widget/modules/widget/hooks/use-new-message-ids.ts`

**Files modified:** `packages/ui/src/styles/globals.css` (`.h-dvh-safe`, `.pb-safe`),
`apps/widget/modules/widget/ui/views/widget-view.tsx`,
`apps/widget/modules/widget/ui/components/{widget-header,widget-footer}.tsx`,
`apps/widget/modules/widget/ui/screens/{widget-selection-screen,widget-voice-screen,widget-chat-screen}.tsx`.

## Phase 5 — Verification & quality gates ✅ DONE

### Full validation sequence

| Check | Result |
|---|---|
| `pnpm format:check` | ✅ Pass |
| `pnpm typecheck` | ✅ Pass, all workspaces |
| `pnpm --filter web lint` / `pnpm --filter widget lint` | ✅ Pass — only the same 3 pre-existing `packages/ui` warnings from Phase 0 baseline (unrelated files, never touched) |
| `pnpm --filter @workspace/backend test` | ✅ 11/11 |
| `pnpm build` (web + widget) | ✅ Pass |
| `pnpm --filter e2e test` (16 tests, Chromium + WebKit) | 9 passed / 7 failed — **all 7 failures are pre-existing, unrelated to this redesign** (see below) |

### Accessibility audit — two real bugs found and fixed

Computed exact WCAG contrast ratios (OKLCH→sRGB→relative-luminance, not visual estimation) for every new color pair introduced by this redesign:

- ❌ **Found:** `.text-gradient-aurora` (heading gradient) used the same light "surface" tones as the ambient backgrounds — `aurora-cyan`/`aurora-emerald` measured **1.81:1 / 1.89:1** against the marketing background, far below the 3:1 large-text minimum.
  **Fixed:** added darker "-text" variants (`--aurora-cyan-text`, `--aurora-emerald-text`, `--aurora-violet-text`) verified at **5.8:1–7:1**, and switched `.text-gradient-aurora` to use them. Surface tones are unchanged everywhere else (buttons, blobs, tokens).
- ❌ **Found:** the widget's user-message bubble (violet→cyan gradient with `primary-foreground` text) measured **1.85:1** against the cyan end — a severe failure, would have been nearly unreadable.
  **Fixed:** switched to a solid pale-violet surface (`oklch(0.93 0.035 296)`) with `aurora-navy` text — verified at **13.29:1**.
- ✅ Verified safe (no changes needed): neo button text vs. gradient (7.05:1 / 9.39:1), marketing foreground vs. background (16.21:1), dashboard sidebar active-nav text vs. new gradient (uses existing dark `--sidebar-accent-foreground`, unchanged lightness profile from before).
- ⚠️ **Flagged, not fixed (pre-existing, outside redesign scope):** the dashboard's `ConversationIdView` operator-side user-message bubble (shared `packages/ui` `AIMessage` component, untouched) uses `primary-foreground` text against a `from-primary to-[#7dd3e4]` gradient — the `#7dd3e4` end has the same low-contrast risk as the widget bug just fixed. Left alone per the "don't change shared component defaults outside the phase being redesigned" rule; flagging here since a real person (dashboard operator) could be affected.

### E2E failures — all pre-existing, unrelated to this redesign

7 of 16 E2E tests fail, all against **stale test expectations that never matched the live site at any point in this session**:
- `renders the hero and primary conversion path` expects heading `/never miss another/i` — the live headline has always been "An AI agent that handles your chat and voice support" (confirmed in the Phase 0 baseline screenshot, before any redesign work).
- `shows pricing plans with plan CTAs` expects tiers named "Starter"/"Growth" — live tiers are "Free"/"Pro"/"Scale" (confirmed in Phase 0's pricing-page read).
- `FAQ accordion expands` expects a "How long does setup take" question — no such question exists in the live FAQ content (confirmed in Phase 2's read of `faq.tsx`).
- `shows the error screen for an unknown organization` (widget) times out waiting for specific error text — depends on live Convex backend validation behavior for a nonexistent org, not on any UI redesign change.

These all trace back to the **same dead/unwired content draft** (`marketing/constants.ts`, `landing-view.tsx`) identified as unused in Phase 2 — the E2E tests appear to have been written against that draft, which was never actually connected to `page.tsx`. No file this redesign touched is referenced by any of these failing assertions. Recommend the repository owner either rewrite these 3 marketing E2E tests to match the live copy, or wire up the drafted content — both are content/product decisions outside this redesign's scope.

### Bundle size vs. Phase 0 baseline

| Route | Phase 0 baseline | Final | Delta | Why |
|---|---|---|---|---|
| `/` (marketing) | 231 kB | 275 kB | +44 kB | Motion + Lenis, used directly for the hero/scroll (Three.js/R3F confirmed code-split separately, not in this number) |
| widget `/` | 321 kB | 362 kB | +41 kB | Motion, now genuinely used for screen/message transitions |

Both remain reasonable for their purpose; no runaway bundle growth.

**Files modified this phase:** `packages/ui/src/styles/globals.css` (contrast-fix tokens), `apps/widget/modules/widget/ui/screens/widget-chat-screen.tsx` (user-bubble contrast fix).
