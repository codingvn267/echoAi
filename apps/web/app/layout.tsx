import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";
import { fontSans, fontMono } from "@/lib/fonts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://helora.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Helora — AI customer support that talks and chats, 24/7",
    template: "%s · Helora",
  },
  description:
    "Helora is an embeddable AI agent that answers your customers over chat and voice — so your team only handles what truly needs a human.",
  keywords: [
    "AI customer support",
    "AI chatbot",
    "voice AI agent",
    "Vapi",
    "support widget",
    "Convex",
    "Clerk",
    "Helora",
  ],
  applicationName: "Helora",
  authors: [{ name: "Helora" }],
  creator: "Helora",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Helora",
    title: "Helora — AI customer support that talks and chats, 24/7",
    description:
      "Drop a single script tag and ship an AI agent that handles chat + voice support, then escalates only what really needs a human.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Helora — AI customer support, 24/7",
    description:
      "AI agent that handles chat + voice support. Embeddable in 5 minutes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0fdfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1524" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#06b6d4",
            },
          }}
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
        >
          <Providers>
            <Toaster />
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
