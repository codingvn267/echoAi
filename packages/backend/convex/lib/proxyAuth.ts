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

export function contactSessionSignaturePayload(args: {
  timestamp: number;
  organizationId: string;
  clientAddressHash: string;
  name: string;
  email: string;
}): string {
  return [
    args.timestamp,
    args.organizationId,
    args.clientAddressHash,
    args.name,
    args.email.toLowerCase(),
  ].join("\n");
}

export async function verifyProxySignature(options: {
  payload: string;
  signature: string;
  secret: string | undefined;
}): Promise<boolean> {
  if (!options.secret || !options.signature) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(options.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(options.payload)
  );
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(options.signature.toLowerCase(), expected);
}
