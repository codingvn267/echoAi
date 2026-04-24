import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://echoai.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't index the authenticated app or Sentry tunnel
        disallow: ["/dashboard", "/conversations", "/billing", "/files", "/customization", "/integrations", "/plugins", "/org-selection", "/monitoring"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
