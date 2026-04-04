import { createHmac, timingSafeEqual } from "crypto"

function secret() {
  return process.env.MAGNET_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-only-magnet-secret"
}

/** HMAC token proving knowledge of lead id (server-generated). */
export function signMagnetToken(leadId: string): string {
  return createHmac("sha256", secret()).update(leadId).digest("hex")
}

export function verifyMagnetToken(leadId: string, token: string): boolean {
  try {
    const expected = signMagnetToken(leadId)
    const a = Buffer.from(expected, "hex")
    const b = Buffer.from(token, "hex")
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
