import { openai } from "@ai-sdk/openai";
import { createTool, saveMessage } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { internal, components } from "@workspace/backend/_generated/api.js";
import rag from "../rag.js";
import { SEARCH_INTERPRETER_PROMPT } from "../constants.js";

export const search = createTool({
  description:
    "Search the knowledge base for relevant information to help answer user questions.",
  args: z.object({
    query: z.string().describe("The search query to find relevant information"),
  }),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId }
    );

    if (!conversation) {
      return "Conversation not found";
    }

    const orgId = conversation.organizationId;

    const searchResult = await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });

    const contextText = `Found results in ${searchResult.entries
      .map((e) => e.title || null)
      .filter((t) => t !== null)
      .join(", ")}. Here is the context: \n\n${searchResult.text}`;

    const response = await generateText({
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${args.query}" \n\nSearch results: ${contextText}`,
        },
      ],
      model: openai.chat("gpt-4o-mini"),
    });

    await saveMessage(ctx, components.agent, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: response.text,
      },
    });

    return response.text;
  },
});
