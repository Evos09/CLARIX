import crypto from "node:crypto";

/** Derives a stable 32-byte key from ENCRYPTION_KEY (falls back to Clerk secret in dev). */
function key(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.CLERK_SECRET_KEY || "clarix-dev-encryption-key";
  return crypto.createHash("sha256").update(secret).digest();
}

/** AES-256-GCM encrypt -> base64(iv | tag | ciphertext). */
export function encryptToken(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptToken(data: string): string {
  const buf = Buffer.from(data, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
