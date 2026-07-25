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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
