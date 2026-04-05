import { NextRequest, NextResponse } from "next/server"
import { runNurtureAutomation } from "@/lib/run-nurture-automation"

function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  const auth = req.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

/** Optional manual trigger (e.g. curl with CRON_SECRET). Vercel Cron is disabled; nurture sends use Admin → Follow-ups. */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await runNurtureAutomation({ respectSendWindow: true })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({
    ok: true,
    sent: result.sent,
    ...(result.skipped ? { skipped: result.skipped } : {}),
  })
}
