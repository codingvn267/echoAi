import {
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
} from "@convex-dev/rag";
import { ConvexError } from "convex/values";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/json",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/html",
  "text/markdown",
  "text/plain",
]);

export function validateFileUpload(
  filename: string,
  bytes: ArrayBuffer
): string {
  if (!filename.trim() || filename.length > 255 || filename.includes("\0")) {
    throw new ConvexError({ code: "BAD_REQUEST", message: "Invalid filename" });
  }
  if (bytes.byteLength < 1 || bytes.byteLength > MAX_FILE_BYTES) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: `Files must be smaller than ${MAX_FILE_BYTES / 1024 / 1024} MB`,
    });
  }

  const contentType = guessMimeTypeFromContents(bytes);
  const extensionType = guessMimeTypeFromExtension(filename);
  if (contentType && extensionType && contentType !== extensionType) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "File contents do not match the filename extension",
    });
  }

  const mimeType = contentType || extensionType;
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Unsupported file type",
    });
  }

  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (text.includes("\0")) {
        throw new Error("Binary content");
      }
    } catch {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Text files must contain valid UTF-8 text",
      });
    }
  }

  return mimeType;
}
