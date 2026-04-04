import { NextRequest, NextResponse } from "next/server"
import { MEDIA_DAY_BTS_YOUTUBE, MACKENZIE_SESSION_URL, PIXIESET_INQUIRY_URL, siteBase } from "@/lib/email-config"
import { verifyEngageToken } from "@/lib/engage-token"
import { insertLeadEvent } from "@/lib/lead-events"
import { isTerminalNurtureStage } from "@/lib/lead-stages"
import { signMagnetToken } from "@/lib/magnet-token"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const DEST: Record<string, string> = {
  work: `${siteBase()}/work`,
  schedule: PIXIESET_INQUIRY_URL,
  bts: MEDIA_DAY_BTS_YOUTUBE,
  mackenzie: MACKENZIE_SESSION_URL,
}

export async function GET(req: NextRequest) {
  const k = req.nextUrl.searchParams.get("k")
  if (!k) return NextResponse.redirect(siteBase(), 302)

  const payload = verifyEngageToken(k)
  if (!payload || payload.kind !== "link" || !payload.target) return NextResponse.redirect(siteBase(), 302)

  const admin = createSupabaseAdmin()
  if (admin) {
    await insertLeadEvent(admin, payload.leadId, "link.clicked", { target: payload.target })

    if (payload.target === "schedule") {
      const { data: row } = await admin.from("leads").select("lead_stage").eq("id", payload.leadId).maybeSingle()
      if (!isTerminalNurtureStage(row?.lead_stage)) {
        await admin
          .from("leads")
          .update({
            lead_stage: "hot_intent",
            nurture_paused_at: new Date().toISOString(),
            next_nurture_at: null,
            nurture_step: 0,
          })
          .eq("id", payload.leadId)
      }
      await insertLeadEvent(admin, payload.leadId, "schedule.clicked", { via: "token" })
    }
  }

  if (payload.target === "prep") {
    const token = signMagnetToken(payload.leadId)
    return NextResponse.redirect(
      `${siteBase()}/resources/welcome-pack?l=${encodeURIComponent(payload.leadId)}&t=${encodeURIComponent(token)}`,
      302,
    )
  }

  const url = DEST[payload.target]
  return NextResponse.redirect(url || siteBase(), 302)
}
