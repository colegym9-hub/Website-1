import { NextRequest, NextResponse } from "next/server"
import { siteBase } from "@/lib/email-config"
import { verifyEngageToken } from "@/lib/engage-token"
import { insertLeadEvent } from "@/lib/lead-events"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const k = req.nextUrl.searchParams.get("k")
  const admin = createSupabaseAdmin()

  if (!k || !admin) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;">Could not unsubscribe. Contact Cole directly.</body></html>`,
      { status: 400, headers: { "content-type": "text/html" } },
    )
  }

  const payload = verifyEngageToken(k)
  if (!payload || payload.kind !== "unsub") {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;">Link expired or invalid.</body></html>`,
      { status: 400, headers: { "content-type": "text/html" } },
    )
  }

  const now = new Date().toISOString()
  await admin
    .from("leads")
    .update({
      unsubscribed_at: now,
      nurture_paused_at: now,
      next_nurture_at: null,
      nurture_step: 0,
      recycle_at: null,
    })
    .eq("id", payload.leadId)

  await insertLeadEvent(admin, payload.leadId, "unsubscribed", {})

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;max-width:480px;">
      <p>You’re unsubscribed from automated follow-ups.</p>
      <p style="color:#666;font-size:14px;">You can still email us anytime.</p>
      <p><a href="${siteBase()}">Back to site</a></p>
    </body></html>`,
    { headers: { "content-type": "text/html" } },
  )
}
