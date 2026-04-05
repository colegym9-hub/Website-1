import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { filterRecycleDueRowsForQueue, type RecycleQueueRow } from "@/lib/follow-up-gate"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data, error } = await admin
    .from("leads")
    .select("id,name,email,service,recycle_at")
    .not("recycle_at", "is", null)
    .is("unsubscribed_at", null)
    .is("completed_at", null)
    .order("recycle_at", { ascending: true })
    .limit(80)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = (data ?? []) as RecycleQueueRow[]
  const leads = await filterRecycleDueRowsForQueue(admin, rows)
  return NextResponse.json({ leads })
}
