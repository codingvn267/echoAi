// Sentry's withSentryConfig wrapping loader (v10) currently duplicates imports in
// app-router layout.tsx files when used together with next/font + ClerkProvider,
// breaking the production build. Runtime error reporting still works through
// instrumentation.ts and instrumentation-client.ts. Source-map upload can be
// re-enabled later via Vercel's Sentry integration or by re-wrapping with
// withSentryConfig once the upstream bug is fixed.

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  devIndicators: false,
};

export default nextConfig;
