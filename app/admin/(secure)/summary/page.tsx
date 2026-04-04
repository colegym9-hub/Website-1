import { requireAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export default async function AdminSummaryPage() {
  await requireAdminUser()
  const admin = createSupabaseAdmin()
  if (!admin) return <p className="text-red-400">Supabase admin not configured.</p>

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
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
    { label: 'Email 3 “Yes” clicks (all time)', value: yesClicks ?? 0 },
    { label: 'Email 3 “No” clicks (all time)', value: noClicks ?? 0 },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-2">Summary</h1>
      <p className="text-[#666] text-sm mb-8">Plain-language counts from your funnel and events.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(c => (
          <div key={c.label} className="border border-[#2a2a2a] rounded-xl p-5 bg-[#111]">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">{c.label}</p>
            <p className="font-heading text-3xl text-white">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
