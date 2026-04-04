import { NextRequest, NextResponse } from "next/server"
import { addDays } from "date-fns"
import { PIXIESET_INQUIRY_URL, siteBase } from "@/lib/email-config"
import { verifyEngageToken } from "@/lib/engage-token"
import { insertLeadEvent } from "@/lib/lead-events"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const k = req.nextUrl.searchParams.get("k")
  if (!k) return NextResponse.redirect(siteBase(), 302)

  const payload = verifyEngageToken(k)
  if (!payload || payload.kind !== "email3" || !payload.choice) return NextResponse.redirect(siteBase(), 302)

  const admin = createSupabaseAdmin()
  if (admin) {
    if (payload.choice === "yes") {
      await insertLeadEvent(admin, payload.leadId, "email3.yes", {})
      await admin
        .from("leads")
        .update({
          lead_stage: "hot_intent",
          nurture_paused_at: new Date().toISOString(),
          next_nurture_at: null,
          nurture_step: 0,
        })
        .eq("id", payload.leadId)
      return NextResponse.redirect(PIXIESET_INQUIRY_URL, 302)
    }

    await insertLeadEvent(admin, payload.leadId, "email3.no", {})
    const recycleAt = addDays(new Date(), 90).toISOString()
    await admin
      .from("leads")
      .update({
        nurture_paused_at: new Date().toISOString(),
        next_nurture_at: null,
        nurture_step: 0,
        recycle_at: recycleAt,
      })
      .eq("id", payload.leadId)
  }

  return NextResponse.redirect(`${siteBase()}/book/email3-thanks`, 302)
}
