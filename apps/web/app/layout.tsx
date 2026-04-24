import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";
import { fontSans, fontMono } from "@/lib/fonts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://echoai.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "echoAi — AI customer support that talks and chats, 24/7",
    template: "%s · echoAi",
  },
  description:
    "echoAi is an embeddable AI agent that answers your customers over chat and voice — so your team only handles what truly needs a human.",
  keywords: [
    "AI customer support",
    "AI chatbot",
    "voice AI agent",
    "Vapi",
    "support widget",
    "Convex",
    "Clerk",
    "echoAi",
  ],
  applicationName: "echoAi",
  authors: [{ name: "echoAi" }],
  creator: "echoAi",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "echoAi",
    title: "echoAi — AI customer support that talks and chats, 24/7",
    description:
      "Drop a single script tag and ship an AI agent that handles chat + voice support, then escalates only what really needs a human.",
  },
  twitter: {
    card: "summary_large_image",
    title: "echoAi — AI customer support, 24/7",
    description:
      "AI agent that handles chat + voice support. Embeddable in 5 minutes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
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
              colorPrimary: "#7dd3e4",
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
