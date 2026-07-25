import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "./schema.js";
import { api, internal } from "./_generated/api.js";
import { verifyVapiWebhook } from "./lib/webhookAuth.js";
import { validateFileUpload } from "./lib/fileValidation.js";

const modules = import.meta.glob("./**/*.{js,ts}");
const ORG = "org_security_1";
const OTHER_ORG = "org_security_2";

async function seedWidget(
  t: ReturnType<typeof convexTest>,
  organizationId = ORG
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("widgetSettings", {
      organizationId,
      greetMessage: "Hello",
      defaultSuggestions: {},
      vapiSettings: {},
    });
  });
}

describe("tenant isolation and abuse controls", () => {
  it("rejects a conversation when the session belongs to another organization", async () => {
    const t = convexTest(schema, modules);
    const sessionId = await t.run(async (ctx) =>
      ctx.db.insert("contactSessions", {
        name: "Visitor",
        email: "visitor@example.com",
        organizationId: ORG,
        expiresAt: Date.now() + 60_000,
      })
    );

    await expect(
      t.mutation(api.public.conversations.create, {
        organizationId: OTHER_ORG,
        contactSessionId: sessionId,
      })
    ).rejects.toThrow("Incorrect session");
  });

  it("rate-limits repeated session creation from one address", async () => {
    const t = convexTest(schema, modules);
    await seedWidget(t);

    for (let index = 0; index < 5; index += 1) {
      await t.mutation(internal.system.contactSessions.create, {
        name: `Visitor ${index}`,
        email: `visitor${index}@example.com`,
        organizationId: ORG,
        clientAddressHash: "a".repeat(64),
      });
    }

    await expect(
      t.mutation(internal.system.contactSessions.create, {
        name: "Blocked Visitor",
        email: "blocked@example.com",
        organizationId: ORG,
        clientAddressHash: "a".repeat(64),
      })
    ).rejects.toThrow("Too many requests");
  });

  it("rejects oversized prompts before reserving AI capacity", async () => {
    const t = convexTest(schema, modules);
    const sessionId = await t.run(async (ctx) =>
      ctx.db.insert("contactSessions", {
        name: "Visitor",
        email: "visitor@example.com",
        organizationId: ORG,
        expiresAt: Date.now() + 60_000,
      })
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("conversations", {
        contactSessionId: sessionId,
        organizationId: ORG,
        status: "unresolved",
        threadId: "thread_security",
      });
    });

    await expect(
      t.mutation(internal.system.usage.reserveMessage, {
        contactSessionId: sessionId,
        threadId: "thread_security",
        promptCharacters: 4_001,
      })
    ).rejects.toThrow("Messages must contain");
  });
});

describe("integration authorization", () => {
  it("requires an organization admin to save Vapi credentials", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t
        .withIdentity({
          subject: "member_user",
          orgId: ORG,
          orgRole: "org:member",
        })
        .action(api.private.secrets.upsert, {
          service: "vapi",
          value: {
            publicApiKey: "public_key_test",
            privateApiKey: "private_key_test",
          },
        })
    ).rejects.toThrow("Only organization admins");
  });

  it("requires an active subscription before saving Vapi credentials", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t
        .withIdentity({
          subject: "admin_user",
          orgId: ORG,
          orgRole: "org:admin",
        })
        .action(api.private.secrets.upsert, {
          service: "vapi",
          value: {
            publicApiKey: "public_key_test",
            privateApiKey: "private_key_test",
          },
        })
    ).rejects.toThrow("active Pro subscription");
  });
});

describe("webhook authentication and durability", () => {
  it("validates a fresh Vapi HMAC and rejects replayed timestamps", async () => {
    const secret = "test-secret";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({ message: { type: "end-of-call-report" } });
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const digest = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${timestamp}.${payload}`)
    );
    const signature = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    await expect(
      verifyVapiWebhook({ payload, signature, timestamp, secret })
    ).resolves.toBe(true);
    await expect(
      verifyVapiWebhook({
        payload,
        signature,
        timestamp,
        secret,
        now: Date.now() + 6 * 60 * 1000,
      })
    ).resolves.toBe(false);
  });

  it("retries failed events but suppresses successful events", async () => {
    const t = convexTest(schema, modules);
    const event = { source: "vapi", eventId: "call_1" };

    await t.mutation(internal.system.webhookEvents.receive, event);
    expect(
      await t.mutation(internal.system.webhookEvents.startProcessing, event)
    ).toMatchObject({ acquired: true });
    await t.mutation(internal.system.webhookEvents.fail, {
      ...event,
      error: "temporary failure",
    });
    expect(
      await t.mutation(internal.system.webhookEvents.startProcessing, event)
    ).toMatchObject({ acquired: true });
    await t.mutation(internal.system.webhookEvents.succeed, event);
    expect(
      await t.mutation(internal.system.webhookEvents.startProcessing, event)
    ).toMatchObject({ acquired: false, status: "succeeded" });
  });

  it("does not duplicate a phone lead when Vapi retries a call", async () => {
    const t = convexTest(schema, modules);
    const args = {
      organizationId: ORG,
      providerEventId: "call_idempotent",
      name: "Phone visitor",
    };

    const first = await t.mutation(
      internal.system.leads.createFromPhoneCall,
      args
    );
    const retried = await t.mutation(
      internal.system.leads.createFromPhoneCall,
      args
    );
    const leads = await t.run(async (ctx) => ctx.db.query("leads").collect());

    expect(retried).toBe(first);
    expect(leads).toHaveLength(1);
  });

  it("ignores out-of-order subscription updates", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.system.subscriptions.upsert, {
      organizationId: ORG,
      status: "active",
      providerUpdatedAt: 2_000,
    });
    const stale = await t.mutation(internal.system.subscriptions.upsert, {
      organizationId: ORG,
      status: "past_due",
      providerUpdatedAt: 1_000,
    });
    const subscription = await t.query(
      internal.system.subscriptions.getByOrganizationId,
      { organizationId: ORG }
    );

    expect(stale).toEqual({ applied: false });
    expect(subscription?.status).toBe("active");
    expect(subscription?.entitlement).toBe("paid");
  });
});

describe("file and retention controls", () => {
  it("erases organization rows, configuration, and usage counters", async () => {
    const t = convexTest(schema, modules);
    await seedWidget(t);
    await t.run(async (ctx) => {
      const sessionId = await ctx.db.insert("contactSessions", {
        name: "Erase Me",
        email: "erase@example.com",
        organizationId: ORG,
        expiresAt: Date.now() + 60_000,
      });
      await ctx.db.insert("leads", {
        organizationId: ORG,
        contactSessionId: sessionId,
        name: "Erase Lead",
        source: "chat",
        status: "new",
      });
      await ctx.db.insert("subscriptions", {
        organizationId: ORG,
        status: "active",
      });
      await ctx.db.insert("fileUsage", {
        organizationId: ORG,
        bytes: 123,
        fileCount: 1,
        updatedAt: Date.now(),
      });
    });

    for (const table of ["leads", "contactSessions"] as const) {
      let removed: number;
      do {
        removed = await t.mutation(
          internal.system.organizationData.deleteRowBatch,
          { organizationId: ORG, table }
        );
      } while (removed > 0);
    }
    await t.mutation(internal.system.organizationData.deleteConfiguration, {
      organizationId: ORG,
    });

    const remaining = await t.run(async (ctx) => ({
      leads: await ctx.db.query("leads").collect(),
      sessions: await ctx.db.query("contactSessions").collect(),
      widgetSettings: await ctx.db.query("widgetSettings").collect(),
      subscriptions: await ctx.db.query("subscriptions").collect(),
      fileUsage: await ctx.db.query("fileUsage").collect(),
    }));

    expect(remaining.leads).toHaveLength(0);
    expect(remaining.sessions).toHaveLength(0);
    expect(remaining.widgetSettings).toHaveLength(0);
    expect(remaining.subscriptions).toHaveLength(0);
    expect(remaining.fileUsage).toHaveLength(0);
  });

  it("backfills fileUsage from entry metadata", async () => {
    const t = convexTest(schema, modules);
    const result = await t.mutation(
      internal.system.organizationData.setFileUsage,
      {
        organizationId: ORG,
        entries: [{ sizeBytes: 1_000 }, { sizeBytes: 2_500 }],
      }
    );

    expect(result).toEqual({ bytes: 3_500, fileCount: 2 });
    const usage = await t.run(async (ctx) =>
      ctx.db
        .query("fileUsage")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", ORG))
        .unique()
    );
    expect(usage?.bytes).toBe(3_500);
  });

  it("rejects files larger than the ingestion limit", () => {
    const bytes = new Uint8Array(10 * 1024 * 1024 + 1).buffer;
    expect(() => validateFileUpload("large.txt", bytes)).toThrow(
      "Files must be smaller"
    );
  });

  it("deletes contact sessions after the retention grace period", async () => {
    const t = convexTest(schema, modules);
    const sessionId = await t.run(async (ctx) =>
      ctx.db.insert("contactSessions", {
        name: "Expired",
        email: "expired@example.com",
        organizationId: ORG,
        expiresAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      })
    );

    const removed = await t.mutation(
      internal.system.contactSessions.removeExpired,
      { cutoff: Date.now() - 7 * 24 * 60 * 60 * 1000, batchSize: 100 }
    );
    expect(removed).toBe(1);
    expect(await t.run(async (ctx) => ctx.db.get(sessionId))).toBeNull();
  });
});
