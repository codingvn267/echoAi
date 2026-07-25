/** @type {import('next').NextConfig} */
const frameAncestors = (process.env.WIDGET_ALLOWED_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(
    (origin) =>
      origin === "'none'" ||
      origin === "*" ||
      /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin) ||
      (process.env.NODE_ENV !== "production" &&
        /^http:\/\/localhost(?::\d+)?$/i.test(origin))
  )
  .join(" ");

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
            value: `frame-ancestors ${frameAncestors || "*"}; object-src 'none'; base-uri 'self'`,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), payment=(), microphone=(self)",
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
