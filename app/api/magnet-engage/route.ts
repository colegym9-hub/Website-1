import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { insertLeadEvent } from "@/lib/lead-events"
import { verifyMagnetToken } from "@/lib/magnet-token"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const bodySchema = z.object({
  leadId: z.string().uuid(),
  token: z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const { leadId, token } = bodySchema.parse(json)
    if (!verifyMagnetToken(leadId, token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }
    const admin = createSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }
    const { data: lead } = await admin.from("leads").select("next_nurture_at").eq("id", leadId).maybeSingle()
    const next = lead?.next_nurture_at ? new Date(String(lead.next_nurture_at)) : null
    const pullForward = new Date()
    pullForward.setUTCDate(pullForward.getUTCDate() + 1)
    pullForward.setUTCHours(15, 30, 0, 0)
    const shorter =
      next && next.getTime() > Date.now() && pullForward.getTime() < next.getTime() ? pullForward.toISOString() : undefined

    const { error } = await admin
      .from("leads")
      .update({
        magnet_engaged_at: new Date().toISOString(),
        lead_stage: "engaged_warm",
        ...(shorter ? { next_nurture_at: shorter } : {}),
      })
      .eq("id", leadId)
    if (error) {
      console.error("magnet-engage update", error)
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
    await insertLeadEvent(admin, leadId, "link.magnet", {})
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
