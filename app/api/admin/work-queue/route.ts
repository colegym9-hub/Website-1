import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { templateKeyForCronStep } from "@/lib/nurture-schedule"
import { catalogLabelForTemplateKey } from "@/lib/template-labels"
import { buildBellNurtureList, buildBellRecycleList, nurtureBellKey, recycleBellKey } from "@/lib/work-queue-filter"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const tz = req.nextUrl.searchParams.get("tz")?.trim() || "America/New_York"
  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  try {
    const [nurtureFiltered, recycleFiltered, recentRes] = await Promise.all([
      buildBellNurtureList(admin, tz),
      buildBellRecycleList(admin, tz),
      admin.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since48h),
    ])

    const nurtureItems = nurtureFiltered.map(row => {
      const step = (row.nurture_step ?? 1) as 1 | 2 | 3
      const raw = row.raw_payload as { role?: string } | null
      const audience = raw?.role === "parent" ? "parent" : "senior"
      const templateKey = templateKeyForCronStep(row.service || "media-day", step, audience)
      const tplName = catalogLabelForTemplateKey(row.service || "media-day", templateKey)
      return {
        kind: "nurture" as const,
        leadId: row.id,
        name: row.name,
        email: row.email,
        service: row.service,
        step,
        templateKey,
        reminderKey: nurtureBellKey(row, step),
        nextNurtureOn: row.next_nurture_on ?? null,
        label: `Email ${step}`,
        subtitle: tplName,
      }
    })

    const recycleItems = recycleFiltered.map(row => ({
      kind: "recycle" as const,
      leadId: row.id,
      name: row.name,
      email: row.email,
      service: row.service,
      reminderKey: recycleBellKey(row, tz),
      label: "Recycle check-in",
      subtitle: "Scheduled follow-up",
    }))

    const recentLeadsCount = recentRes.count ?? 0

    return NextResponse.json({
      nurture: nurtureItems,
      recycle: recycleItems,
      nurtureTotal: nurtureItems.length,
      recycleTotal: recycleItems.length,
      workTotal: nurtureItems.length + recycleItems.length,
      recentLeadsCount,
      timeZone: tz,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 })
  }
}
