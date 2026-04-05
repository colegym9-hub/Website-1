import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { buildBellNurtureList, buildBellRecycleList } from "@/lib/work-queue-filter"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const tz = req.nextUrl.searchParams.get("tz")?.trim() || "America/New_York"

  try {
    const [nurture, recycle] = await Promise.all([buildBellNurtureList(admin, tz), buildBellRecycleList(admin, tz)])
    return NextResponse.json({ nurture: nurture.length, recycle: recycle.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 })
  }
}
