import { createHmac, timingSafeEqual } from "crypto"

function secret() {
  return process.env.ENGAGE_TOKEN_SECRET || process.env.MAGNET_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-only-engage-secret"
}

export type EngagePayload = {
  v: 1
  leadId: string
  kind: "link" | "email3" | "unsub"
  target?: string
  choice?: "yes" | "no"
  exp: number
}

const MAX_AGE_MS = 120 * 24 * 60 * 60 * 1000

/** Signed token for tracked links, Email 3 yes/no, and unsubscribe. */
export function signEngageToken(payload: Omit<EngagePayload, "v" | "exp"> & { exp?: number }): string {
  const full: EngagePayload = {
    v: 1,
    leadId: payload.leadId,
    kind: payload.kind,
    target: payload.target,
    choice: payload.choice,
    exp: payload.exp ?? Date.now() + MAX_AGE_MS,
  }
  const body = Buffer.from(JSON.stringify(full), "utf8").toString("base64url")
  const sig = createHmac("sha256", secret()).update(body).digest("hex")
  return `${body}.${sig}`
}

export function verifyEngageToken(token: string): EngagePayload | null {
  try {
    const dot = token.lastIndexOf(".")
    if (dot < 0) return null
    const body = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const expected = createHmac("sha256", secret()).update(body).digest("hex")
    const a = Buffer.from(sig, "hex")
    const b = Buffer.from(expected, "hex")
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as EngagePayload
    if (parsed.v !== 1 || typeof parsed.leadId !== "string" || typeof parsed.exp !== "number") return null
    if (Date.now() > parsed.exp) return null
    return parsed
  } catch {
    return null
  }
}
