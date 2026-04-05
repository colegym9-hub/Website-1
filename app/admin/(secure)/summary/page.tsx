import { requireAdminUser } from "@/lib/admin-auth"
import { AdminHubPageHeader } from "@/components/admin/admin-hub-page-header"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export default async function AdminSummaryPage() {
  await requireAdminUser()
  const admin = createSupabaseAdmin()
  if (!admin) return <p className="text-red-400">Supabase admin not configured.</p>

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - 7)
  const since = sinceDate.toISOString()
  const { count: inquiries7d } = await admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since)
  const { count: callBooked } = await admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .not("call_booked_at", "is", null)
  const { count: yesClicks } = await admin
    .from("lead_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "email3.yes")
  const { count: noClicks } = await admin
    .from("lead_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "email3.no")

  const cards = [
    { label: "Inquiries (last 7 days)", value: inquiries7d ?? 0 },
    { label: "Leads with a call booked timestamp", value: callBooked ?? 0 },
    { label: "Email 3 “Yes” clicks (all time)", value: yesClicks ?? 0 },
    { label: "Email 3 “No” clicks (all time)", value: noClicks ?? 0 },
  ]

  return (
    <div>
      <AdminHubPageHeader
        title="Summary"
        subtitle="Plain-language counts from your funnel and tracked link events."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">{c.label}</p>
            <p className="mt-3 font-heading text-3xl text-[var(--ac-text)]">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
