import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"
import { LeadProfileForm } from "@/components/admin/lead-profile-form"
import { LeadEventsList } from "@/components/admin/lead-events-list"

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser()
  const { id } = await params
  const admin = createSupabaseAdmin()
  if (!admin) return <p className="text-red-400">Supabase admin not configured.</p>

  const { data: lead, error } = await admin.from("leads").select("*").eq("id", id).maybeSingle()
  if (error || !lead) notFound()

  const { data: related } = await admin.from("leads").select("id,created_at,lead_stage").eq("email", lead.email).neq("id", id).order("created_at", { ascending: false })

  const { data: events } = await admin
    .from("lead_events")
    .select("id,type,payload,created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(80)

  return (
    <div className="max-w-4xl">
      <Link href="/admin/leads" className="text-[#666] text-sm hover:text-[var(--ac-accent)] mb-6 inline-block">
        ← Leads
      </Link>
      <h1 className="font-heading text-2xl text-white mb-1">{lead.name}</h1>
      <p className="text-[#666] text-sm mb-8">{lead.email}</p>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[#555] mb-3">Lifecycle & nurture</h2>
          <LeadProfileForm lead={lead} />
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[#555] mb-3">Related leads (same email)</h2>
          {(related?.length ?? 0) === 0 ? (
            <p className="text-[#666] text-sm">None</p>
          ) : (
            <ul className="text-sm space-y-2">
              {related!.map(r => (
                <li key={r.id}>
                  <Link href={`/admin/leads/${r.id}`} className="text-[var(--ac-accent)] hover:underline">
                    {r.id.slice(0, 8)}…
                  </Link>
                  <span className="text-[#666] ml-2">{r.lead_stage}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-[#555] mb-3">Raw payload</h2>
        <pre className="text-xs bg-[#111] border border-[#2a2a2a] rounded-lg p-4 overflow-auto max-h-64 text-[#aaa]">
          {JSON.stringify(lead.raw_payload, null, 2)}
        </pre>
      </div>

      <div className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-[#555] mb-3">Timeline</h2>
        <LeadEventsList events={events ?? []} />
      </div>
    </div>
  )
}
