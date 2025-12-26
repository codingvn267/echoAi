import { openai } from "@ai-sdk/openai";
import { RAG } from "@convex-dev/rag";
import { components } from "../../_generated/api.js";

const rag = new RAG(components.rag, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textEmbeddingModel: openai.embedding(
    "text-embedding-3-small"
  ) as any,
  embeddingDimension: 1536,
});

export default rag;
