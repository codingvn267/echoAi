import { v, ConvexError } from "convex/values";
import { action, mutation, query, QueryCtx } from "../_generated/server.js";
import {
  contentHashFromArrayBuffer,
  Entry,
  EntryId,
  vEntryId,
} from "@convex-dev/rag";
import { extractTextContent } from "../lib/extractTextContent.js";
import rag from "../system/ai/rag.js";
import { Id } from "../_generated/dataModel.js";
import { paginationOptsValidator } from "convex/server";
import { internal } from "../_generated/api.js";
import { validateFileUpload } from "../lib/fileValidation.js";

const MAX_EXTRACTED_CHARACTERS = 200_000;
const MAX_ESTIMATED_TOKENS = 50_000;

export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
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

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid namespace",
      });
    }

    const entry = await rag.getEntry(ctx, {
      entryId: args.entryId,
    });

    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }

    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      });
    }

    if (entry.metadata?.storageId) {
      const storageMetadata = await ctx.db.system.get(
        entry.metadata.storageId as Id<"_storage">
      );
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);

      const usage = await ctx.db
        .query("fileUsage")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .unique();
      if (usage) {
        await ctx.db.patch(usage._id, {
          bytes: Math.max(0, usage.bytes - (storageMetadata?.size ?? 0)),
          fileCount: Math.max(0, usage.fileCount - 1),
          updatedAt: Date.now(),
        });
      }
    }

    await rag.deleteAsync(ctx, {
      entryId: args.entryId,
    });
  },
});

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    const { bytes, filename, category } = args;
    const mimeType = validateFileUpload(filename, bytes);
    await ctx.runMutation(internal.system.fileQuotas.reserve, {
      organizationId: orgId,
      bytes: bytes.byteLength,
    });
    const blob = new Blob([bytes], { type: mimeType });
    let storageId: Id<"_storage"> | undefined;

    try {
      storageId = await ctx.storage.store(blob);
      const text = await extractTextContent(ctx, {
        storageId,
        filename,
        bytes,
        mimeType,
      });
      if (
        text.length > MAX_EXTRACTED_CHARACTERS ||
        Math.ceil(text.length / 4) > MAX_ESTIMATED_TOKENS
      ) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Extracted file content exceeds the ingestion limit",
        });
      }

      const { entryId, created } = await rag.add(ctx, {
        namespace: orgId,
        text,
        key: filename,
        metadata: {
          storageId,
          uploadedBy: orgId,
          filename,
          category: category ?? null,
          sizeBytes: bytes.byteLength,
        } as EntryMetadata,
        contentHash: await contentHashFromArrayBuffer(bytes),
      });

      if (!created) {
        await ctx.storage.delete(storageId);
        await ctx.runMutation(internal.system.fileQuotas.release, {
          organizationId: orgId,
          bytes: bytes.byteLength,
        });
        const existing = await rag.getEntry(ctx, { entryId });
        const existingStorageId = existing?.metadata?.storageId as
          | Id<"_storage">
          | undefined;
        return {
          url: existingStorageId
            ? await ctx.storage.getUrl(existingStorageId)
            : null,
          entryId,
        };
      }

      return {
        url: await ctx.storage.getUrl(storageId),
        entryId,
      };
    } catch (error) {
      if (storageId) {
        await ctx.storage.delete(storageId);
      }
      await ctx.runMutation(internal.system.fileQuotas.release, {
        organizationId: orgId,
        bytes: bytes.byteLength,
      });
      throw error;
    }
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
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

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const results = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: args.paginationOpts,
    });

    const files = await Promise.all(
      results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
    );

    const filteredFiles = args.category
      ? files.filter((file) => file.category === args.category)
      : files;

    return {
      page: filteredFiles,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

export type PublicFile = {
  id: EntryId;
  name: string;
  type: string;
  size: string;
  status: "ready" | "processing" | "error";
  url: string | null;
  category?: string;
};

type EntryMetadata = {
  storageId: Id<"_storage">;
  uploadedBy: string;
  filename: string;
  category: string | null;
  sizeBytes: number;
};

async function convertEntryToPublicFile(
  ctx: QueryCtx,
  entry: Entry
): Promise<PublicFile> {
  const metadata = entry.metadata as EntryMetadata | undefined;
  const storageId = metadata?.storageId;

  let fileSize = "unknown";

  if (storageId) {
    try {
      const storageMetadata = await ctx.db.system.get(storageId);
      if (storageMetadata) {
        fileSize = formatFileSize(storageMetadata.size);
      }
    } catch (error) {
      console.error("Failed to get storage metadata: ", error);
    }
  }

  const filename = entry.key || "Unknown";
  const extension = filename.split(".").pop()?.toLowerCase() || "txt";

  let status: "ready" | "processing" | "error" = "error";
  if (entry.status === "ready") {
    status = "ready";
  } else if (entry.status === "pending") {
    status = "processing";
  }

  const url = storageId ? await ctx.storage.getUrl(storageId) : null;

  return {
    id: entry.entryId,
    name: filename,
    type: extension,
    size: fileSize,
    status,
    url,
    category: metadata?.category || undefined,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
