import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { catalogLabelForTemplateKey } from "@/lib/template-labels"
import { templateKeyForCronStep } from "@/lib/nurture-schedule"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function monthRangeYmd(year: number, month1to12: number): { start: string; end: string } {
  const start = `${year}-${pad(month1to12)}-01`
  const lastD = new Date(year, month1to12, 0).getDate()
  const end = `${year}-${pad(month1to12)}-${pad(lastD)}`
  return { start, end }
}

function ymdFromTs(iso: string | null | undefined, fallback: string): string {
  if (!iso) return fallback
  return iso.slice(0, 10)
}

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const y = Number(req.nextUrl.searchParams.get("year"))
  const m = Number(req.nextUrl.searchParams.get("month"))
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return NextResponse.json({ error: "Invalid year or month" }, { status: 400 })
  }

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { start, end } = monthRangeYmd(y, m)

  const { data: leads, error } = await admin
    .from("leads")
    .select(
      "id,name,email,service,lead_stage,nurture_step,raw_payload,next_nurture_on,recycle_at,call_booked_at,shoot_booked_at,completed_at",
    )
    .is("unsubscribed_at", null)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  type CalItem = {
    date: string
    kind: string
    leadId: string
    name: string
    title: string
    subtitle?: string
  }

  const byDate = new Map<string, CalItem[]>()

  function push(date: string, item: CalItem) {
    if (date < start || date > end) return
    const list = byDate.get(date) ?? []
    list.push(item)
    byDate.set(date, list)
  }

  for (const row of leads ?? []) {
    const name = String(row.name ?? "Lead")
    const id = String(row.id)
    const svc = row.service ? String(row.service) : "media-day"

    if (row.next_nurture_on) {
      const d = String(row.next_nurture_on)
      const step = Number(row.nurture_step ?? 0)
      if (step >= 1 && step <= 3) {
        const raw = row.raw_payload as { role?: string } | null
        const aud = raw?.role === "parent" ? "parent" : "senior"
        const key = templateKeyForCronStep(svc, step as 1 | 2 | 3, aud)
        push(d, {
          date: d,
          kind: "nurture",
          leadId: id,
          name,
          title: `Email ${step}`,
          subtitle: catalogLabelForTemplateKey(svc, key),
        })
      }
    }

    if (row.recycle_at) {
      const d = ymdFromTs(String(row.recycle_at), "")
      if (d)
        push(d, {
          date: d,
          kind: "recycle",
          leadId: id,
          name,
          title: "Recycle check-in",
          subtitle: catalogLabelForTemplateKey(svc, "recycle_checkin"),
        })
    }

    if (row.call_booked_at) {
      const d = ymdFromTs(String(row.call_booked_at), "")
      if (d)
        push(d, {
          date: d,
          kind: "call",
          leadId: id,
          name,
          title: "Call booked",
        })
    }

    if (row.shoot_booked_at) {
      const d = ymdFromTs(String(row.shoot_booked_at), "")
      if (d)
        push(d, {
          date: d,
          kind: "shoot",
          leadId: id,
          name,
          title: "Shoot booked",
        })
    }

    if (row.completed_at) {
      const d = ymdFromTs(String(row.completed_at), "")
      if (d)
        push(d, {
          date: d,
          kind: "completed",
          leadId: id,
          name,
          title: "Completed",
        })
    }
  }

  const dates = Array.from(byDate.keys()).sort()
  const events = dates.map(date => ({ date, items: byDate.get(date)! }))

  return NextResponse.json({ year: y, month: m, start, end, events })
}
