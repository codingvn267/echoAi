"use client";

import { Protect, useAuth } from "@clerk/nextjs";
import {
  CheckCircle2Icon,
  Code2Icon,
  CopyIcon,
  ExternalLinkIcon,
  Globe2Icon,
  LockKeyholeIcon,
  Mic2Icon,
  PlugZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { BrandMark } from "@/components/brand-mark";
import { INSTALL_PLATFORMS } from "@/modules/marketing/constants";
import { VapiView } from "@/modules/plugins/ui/views/vapi-view";

const widgetScriptUrl =
  process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ??
  "https://widget.helora.ai/widget.js";
const widgetUrl =
  process.env.NEXT_PUBLIC_WIDGET_URL ?? "https://widget.helora.ai";

const buildSnippet = (organizationId: string) => `<script
  src="${widgetScriptUrl}"
  data-org-id="${organizationId}"
  data-widget-url="${widgetUrl}"
  defer
></script>`;

const WebsiteIntegration = () => {
  const { orgId } = useAuth();
  const [copied, setCopied] = useState(false);
  const organizationId = orgId ?? "your-organization-id";
  const snippet = buildSnippet(organizationId);
  const previewUrl = `${widgetUrl}?organizationId=${encodeURIComponent(organizationId)}`;

  const copySnippet = async () => {
    if (!orgId) {
      toast.error("Select an organization before copying the snippet");
      return;
    }

    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Install snippet copied");
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      toast.error("Could not access the clipboard");
    }
  };

  return (
    <Card className="overflow-hidden border-border/70 bg-background/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
              <Globe2Icon className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle>Website widget</CardTitle>
              <CardDescription className="mt-1">
                Add Helora to any website with one script tag.
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit gap-1.5">
            <CheckCircle2Icon className="size-3.5 text-emerald-600" />
            Ready to install
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Your install snippet</p>
              <p className="text-xs text-muted-foreground">
                This is already linked to the selected organization.
              </p>
            </div>
            <Button
              aria-label="Copy install snippet"
              disabled={!orgId}
              onClick={copySnippet}
              size="sm"
              variant="neo"
            >
              {copied ? <CheckCircle2Icon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="max-w-full overflow-x-auto rounded-md border bg-zinc-950 p-4 text-xs leading-6 text-zinc-200 shadow-inner">
            <code>{snippet}</code>
          </pre>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Copy", "Copy the organization-specific snippet above."],
            [
              "2",
              "Paste",
              "Place it just before your site's closing body tag.",
            ],
            [
              "3",
              "Verify",
              "Publish, then open your site and test the launcher.",
            ],
          ].map(([step, title, description]) => (
            <div
              className="flex gap-3 rounded-md border bg-muted/25 p-3"
              key={step}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                {step}
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2Icon className="size-4" />
            Works with custom sites and major site builders.
          </div>
          <Button asChild disabled={!orgId} size="sm" variant="neo">
            <a href={previewUrl} rel="noreferrer" target="_blank">
              Preview widget
              <ExternalLinkIcon />
            </a>
          </Button>
        </div>

        <Accordion className="border-t" collapsible type="single">
          {INSTALL_PLATFORMS.map((platform) => (
            <AccordionItem key={platform.name} value={platform.name}>
              <AccordionTrigger>{platform.name}</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-2">
                  {platform.steps.map((step, index) => (
                    <li
                      className="flex gap-3 text-sm text-muted-foreground"
                      key={step}
                    >
                      <span className="font-medium tabular-nums text-foreground">
                        {index + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const VoiceUpgrade = () => (
  <Card className="border-dashed bg-background/70">
    <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <LockKeyholeIcon className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">
            Voice integration is available on Growth
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Connect Vapi to manage AI assistants, business phone numbers, and
            voice calls from Helora.
          </p>
        </div>
      </div>
      <Button asChild className="shrink-0" variant="neo">
        <Link href="/billing">View plans</Link>
      </Button>
    </CardContent>
  </Card>
);

export const IntegrationsView = () => (
  <div className="min-h-screen p-4 sm:p-6 lg:p-8">
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <PlugZapIcon className="size-4" />
            Connections
          </div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Integrations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Put Helora on your website, then connect the voice services your
            front desk already uses.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BrandMark size={28} />
          <span>Secure per-organization setup</span>
        </div>
      </header>

      <section
        aria-labelledby="website-integration-heading"
        className="space-y-4"
      >
        <div>
          <h2
            className="text-lg font-semibold"
            id="website-integration-heading"
          >
            Install Helora
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your widget configuration and knowledge base load automatically.
          </p>
        </div>
        <WebsiteIntegration />
      </section>

      <section
        aria-labelledby="voice-integration-heading"
        className="space-y-4 pb-8"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
            <Mic2Icon className="size-4 text-primary" />
          </div>
          <div>
            <h2
              className="text-lg font-semibold"
              id="voice-integration-heading"
            >
              Voice and phone
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bring your Vapi assistants and numbers into Helora.
            </p>
          </div>
        </div>
        <Protect
          condition={(has) => has({ plan: "growth" })}
          fallback={<VoiceUpgrade />}
        >
          <VapiView embedded />
        </Protect>
      </section>
    </div>
  </div>
);
