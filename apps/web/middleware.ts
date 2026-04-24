import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that anyone (signed in or not) can access without auth.
const isPublicRoute = createRouteMatcher([
  "/",                       // marketing landing
  "/pricing",
  "/about",
  "/legal/(.*)",             // privacy + terms
  "/sign-in(.*)",
  "/sign-up(.*)",
])

// Routes a signed-in user can hit even before picking an organization.
const isOrgFreeRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/about",
  "/legal/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/org-selection(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  // Protect everything except public marketing + auth routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Signed-in user with no org tries to enter the app -> pick an org first
  if (userId && !orgId && !isOrgFreeRoute(req)) {
    const searchParams = new URLSearchParams({ redirectUrl: req.url });
    const orgSelection = new URL(
      `/org-selection?${searchParams.toString()}`, req.url,
    );
    return NextResponse.redirect(orgSelection);
  }
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};