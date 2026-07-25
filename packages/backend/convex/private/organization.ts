import { ConvexError, v } from "convex/values";
import { action } from "../_generated/server.js";
import { internal } from "../_generated/api.js";
import { supportAgent } from "../system/ai/agents/supportAgent.js";
import rag from "../system/ai/rag.js";
import { deleteSecret } from "../lib/secrets.js";
import { Doc, Id } from "../_generated/dataModel.js";

export type OrganizationExport = {
  exportedAt: number;
  organizationId: string;
  conversations: Doc<"conversations">[];
  leads: Doc<"leads">[];
  appointments: Doc<"appointments">[];
  contactSessions: Doc<"contactSessions">[];
  widgetSettings: Doc<"widgetSettings"> | null;
  bookingSettings: Doc<"bookingSettings"> | null;
  subscription: Doc<"subscriptions"> | null;
  usage: Doc<"organizationUsage">[];
  files: { filename: string; category: string | null; sizeBytes?: number }[];
};

async function requireOrgAdmin(ctx: {
  auth: { getUserIdentity: () => Promise<Record<string, unknown> | null> };
}): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Identity not found",
    });
  }
  const orgId = identity.orgId as string;
  if (!orgId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Organization not found",
    });
  }
  return orgId;
}

// Customer data export (GDPR/DPA): returns every record the platform holds
// for the caller's organization plus file metadata, capped per table.
export const exportData = action({
  args: {},
  handler: async (ctx): Promise<OrganizationExport> => {
    const orgId = await requireOrgAdmin(ctx);

    const snapshot: Omit<OrganizationExport, "files"> = await ctx.runQuery(
      internal.system.organizationData.snapshot,
      { organizationId: orgId }
    );

    const files: { filename: string; category: string | null; sizeBytes?: number }[] =
      [];
    const namespace = await rag.getNamespace(ctx, { namespace: orgId });
    if (namespace) {
      let cursor: string | null = null;
      let isDone = false;
      while (!isDone) {
        const page = await rag.list(ctx, {
          namespaceId: namespace.namespaceId,
          paginationOpts: { numItems: 100, cursor },
        });
        for (const entry of page.page) {
          const metadata = entry.metadata as
            | { filename?: string; category?: string | null; sizeBytes?: number }
            | undefined;
          files.push({
            filename: metadata?.filename ?? entry.key ?? "unknown",
            category: metadata?.category ?? null,
            sizeBytes: metadata?.sizeBytes,
          });
        }
        cursor = page.continueCursor;
        isDone = page.isDone;
      }
    }

    return { ...snapshot, files };
  },
});

// Complete organization erasure: conversations and their agent threads,
// leads, appointments, contact sessions, RAG entries with stored blobs,
// plugin secrets, configuration, subscription state, and usage counters.
export const deleteAllData = action({
  args: {
    // Explicit confirmation so a stray client call cannot wipe a tenant.
    confirmOrganizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgAdmin(ctx);
    if (args.confirmOrganizationId !== orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Confirmation does not match the active organization",
      });
    }

    const deleted = {
      conversations: 0,
      leads: 0,
      appointments: 0,
      contactSessions: 0,
      files: 0,
      secrets: 0,
    };

    // Conversations and their agent threads (messages/embeddings).
    for (;;) {
      const threadIds: string[] = await ctx.runMutation(
        internal.system.organizationData.takeConversationBatch,
        { organizationId: orgId }
      );
      if (threadIds.length === 0) {
        break;
      }
      deleted.conversations += threadIds.length;
      for (const threadId of threadIds) {
        await supportAgent.deleteThreadSync(ctx, { threadId });
      }
    }

    for (const table of ["leads", "appointments", "contactSessions"] as const) {
      for (;;) {
        const removed: number = await ctx.runMutation(
          internal.system.organizationData.deleteRowBatch,
          { organizationId: orgId, table }
        );
        if (removed === 0) {
          break;
        }
        deleted[table] += removed;
      }
    }

    // RAG entries and their stored blobs.
    const namespace = await rag.getNamespace(ctx, { namespace: orgId });
    if (namespace) {
      for (;;) {
        const page = await rag.list(ctx, {
          namespaceId: namespace.namespaceId,
          paginationOpts: { numItems: 50, cursor: null },
        });
        if (page.page.length === 0) {
          break;
        }
        for (const entry of page.page) {
          const storageId = (
            entry.metadata as { storageId?: Id<"_storage"> } | undefined
          )?.storageId;
          if (storageId) {
            await ctx.storage.delete(storageId).catch(() => undefined);
          }
          await rag.deleteAsync(ctx, { entryId: entry.entryId });
          deleted.files += 1;
        }
        if (page.isDone) {
          break;
        }
      }
    }

    // Configuration, subscription, plugins, and usage counters.
    const { secretNames } = await ctx.runMutation(
      internal.system.organizationData.deleteConfiguration,
      { organizationId: orgId }
    );
    for (const secretName of secretNames) {
      await deleteSecret(secretName);
      deleted.secrets += 1;
    }

    console.info("Organization data deleted", {
      organizationId: orgId,
      ...deleted,
    });
    return deleted;
  },
});
