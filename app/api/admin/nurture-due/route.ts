import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { filterNurtureDueRowsForQueue } from "@/lib/follow-up-gate"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data, error } = await admin
    .from("leads")
    .select(
      "id,name,email,service,lead_tier,lead_stage,nurture_step,next_nurture_at,next_nurture_on,created_at,raw_payload",
    )
    .is("unsubscribed_at", null)
    .is("nurture_paused_at", null)
    .is("completed_at", null)
    .gt("nurture_step", 0)
    .order("created_at", { ascending: false })
    .limit(120)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const leads = await filterNurtureDueRowsForQueue(admin, data ?? [])
  return NextResponse.json({ leads })
}
