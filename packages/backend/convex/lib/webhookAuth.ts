const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

function normalizeSignature(value: string): string {
  const signature = value.trim();
  const separator = signature.indexOf("=");
  return separator >= 0 ? signature.slice(separator + 1) : signature;
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function verifyVapiWebhook(options: {
  payload: string;
  signature: string | null;
  timestamp: string | null;
  secret: string | undefined;
  now?: number;
}): Promise<boolean> {
  const { payload, signature, timestamp, secret, now = Date.now() } = options;
  if (!secret || !signature || !timestamp) {
    return false;
  }

  const timestampSeconds = Number(timestamp);
  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(now / 1000 - timestampSeconds) > MAX_WEBHOOK_AGE_SECONDS
  ) {
    return false;
  }

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
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(normalizeSignature(signature).toLowerCase(), expected);
}

export function safeWebhookError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 1_000);
  }
  return "Unknown webhook processing error";
}
