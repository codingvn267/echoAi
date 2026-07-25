import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  subscriptions: defineTable({
    organizationId: v.string(),
    status: v.string(),
    entitlement: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    plan: v.optional(
      v.union(v.literal("starter"), v.literal("growth"), v.literal("scale"))
    ),
    providerUpdatedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_organization_id", ["organizationId"]),
  widgetSettings: defineTable({
    organizationId: v.string(),
    greetMessage: v.string(),
    defaultSuggestions: v.object({
      suggestion1: v.optional(v.string()),
      suggestion2: v.optional(v.string()),
      suggestion3: v.optional(v.string()),
    }),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    }),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_vapi_assistant_id", ["vapiSettings.assistantId"]),

  plugins: defineTable({
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    secretName: v.string(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_id_and_service", ["organizationId", "service"]),

  conversations: defineTable({
    threadId: v.string(),
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_contact_session_id", ["contactSessionId"])
    .index("by_thread_id", ["threadId"])
    .index("by_status_and_organization_id", ["status", "organizationId"]),

  leads: defineTable({
    organizationId: v.string(),
    providerEventId: v.optional(v.string()),
    contactSessionId: v.optional(v.id("contactSessions")),
    conversationId: v.optional(v.id("conversations")),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    service: v.optional(v.string()),
    urgency: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    notes: v.optional(v.string()),
    summary: v.optional(v.string()),
    source: v.union(v.literal("chat"), v.literal("voice"), v.literal("phone")),
    status: v.union(
      v.literal("new"),
      v.literal("booked"),
      v.literal("needs_callback"),
      v.literal("contacted"),
      v.literal("closed")
    ),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_source_and_provider_event_id", ["source", "providerEventId"])
    .index("by_status_and_organization_id", ["status", "organizationId"])
    .index("by_contact_session_id", ["contactSessionId"]),

  appointments: defineTable({
    organizationId: v.string(),
    leadId: v.optional(v.id("leads")),
    contactSessionId: v.optional(v.id("contactSessions")),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    service: v.string(),
    startTime: v.number(),
    durationMinutes: v.number(),
    status: v.union(
      v.literal("requested"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_status_and_organization_id", ["status", "organizationId"])
    .index("by_organization_id_and_start_time", [
      "organizationId",
      "startTime",
    ]),

  bookingSettings: defineTable({
    organizationId: v.string(),
    timezone: v.string(),
    businessHours: v.array(
      v.object({
        day: v.number(), // 0 = Sunday ... 6 = Saturday
        open: v.string(), // "09:00"
        close: v.string(), // "17:00"
        closed: v.optional(v.boolean()),
      })
    ),
    services: v.array(
      v.object({
        name: v.string(),
        durationMinutes: v.number(),
        description: v.optional(v.string()),
      })
    ),
    slotIntervalMinutes: v.number(),
    capacityPerSlot: v.number(),
    notifyEmail: v.optional(v.string()),
    notifyPhone: v.optional(v.string()),
  }).index("by_organization_id", ["organizationId"]),

  contactSessions: defineTable({
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    expiresAt: v.number(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.string()),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        cookieEnabled: v.optional(v.boolean()),
        referrer: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  })
    .index("by_expires_at", ["expiresAt"])
    .index("by_organization_id", ["organizationId"]),
  // Deduplication log for inbound webhooks (Clerk, Vapi). We record each
  // provider event id once so retried/duplicate deliveries are ignored,
  // preventing double-charged subscriptions or duplicate phone leads.
  webhookEvents: defineTable({
    source: v.string(),
    eventId: v.string(),
    status: v.optional(
      v.union(
        v.literal("received"),
        v.literal("processing"),
        v.literal("succeeded"),
        v.literal("failed")
      )
    ),
    attempts: v.optional(v.number()),
    receivedAt: v.optional(v.number()),
    processingStartedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
  })
    .index("by_source_and_event_id", ["source", "eventId"])
    .index("by_processed_at", ["processedAt"]),

  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key_and_window_start", ["key", "windowStart"])
    .index("by_updated_at", ["updatedAt"]),

  organizationUsage: defineTable({
    organizationId: v.string(),
    period: v.string(),
    messageCount: v.number(),
    promptCharacters: v.number(),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    activeAiRequests: v.number(),
    updatedAt: v.number(),
  }).index("by_organization_id_and_period", ["organizationId", "period"]),

  aiReservations: defineTable({
    organizationId: v.string(),
    expiresAt: v.number(),
  })
    .index("by_organization_id_and_expires_at", ["organizationId", "expiresAt"])
    .index("by_expires_at", ["expiresAt"]),

  fileUsage: defineTable({
    organizationId: v.string(),
    bytes: v.number(),
    fileCount: v.number(),
    updatedAt: v.number(),
  }).index("by_organization_id", ["organizationId"]),
});
