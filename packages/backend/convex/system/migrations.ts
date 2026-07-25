import { internalAction } from "../_generated/server.js";
import { internal } from "../_generated/api.js";
import rag from "./ai/rag.js";
import { Id } from "../_generated/dataModel.js";

// One-shot migration: recompute fileUsage counters from the RAG entries that
// already exist so storage quotas are accurate for organizations that uploaded
// files before quota enforcement shipped.
//
// Run from the Convex dashboard or CLI:
//   npx convex run system/migrations:backfillFileUsage
export const backfillFileUsage = internalAction({
  args: {},
  handler: async (ctx) => {
    const organizationIds = await ctx.runQuery(
      internal.system.organizationData.listOrganizationIds,
      {}
    );

    const results: Record<string, { bytes: number; fileCount: number }> = {};

    for (const organizationId of organizationIds) {
      const namespace = await rag.getNamespace(ctx, {
        namespace: organizationId,
      });
      if (!namespace) {
        continue;
      }

      const entries: { storageId?: string; sizeBytes?: number }[] = [];
      let cursor: string | null = null;
      let isDone = false;
      while (!isDone) {
        const page = await rag.list(ctx, {
          namespaceId: namespace.namespaceId,
          paginationOpts: { numItems: 100, cursor },
        });
        for (const entry of page.page) {
          const metadata = entry.metadata as
            | { storageId?: Id<"_storage">; sizeBytes?: number }
            | undefined;
          entries.push({
            storageId: metadata?.storageId,
            sizeBytes: metadata?.sizeBytes,
          });
        }
        cursor = page.continueCursor;
        isDone = page.isDone;
      }

      results[organizationId] = await ctx.runMutation(
        internal.system.organizationData.setFileUsage,
        { organizationId, entries }
      );
    }

    console.info("fileUsage backfill completed", results);
    return results;
  },
});
