import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdminUser } from "@/lib/admin-auth"
import { AdminHubPageHeader } from "@/components/admin/admin-hub-page-header"
import { LeadProfileForm } from "@/components/admin/lead-profile-form"
import { LeadEventsList } from "@/components/admin/lead-events-list"
import { LeadDetailWorkspace } from "@/components/admin/lead-detail-workspace"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser()
  const { id } = await params
  const admin = createSupabaseAdmin()
  if (!admin) return <p className="text-red-400">Supabase admin not configured.</p>

  const { data: lead, error } = await admin.from("leads").select("*").eq("id", id).maybeSingle()
  if (error || !lead) notFound()

  const { data: related } = await admin
    .from("leads")
    .select("id,created_at,lead_stage")
    .eq("email", lead.email)
    .neq("id", id)
    .order("created_at", { ascending: false })

  const { data: events } = await admin
    .from("lead_events")
    .select("id,type,payload,created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(80)

  const leadForClient = {
    id: String(lead.id),
    name: String(lead.name ?? ""),
    email: String(lead.email ?? ""),
    service: lead.service ? String(lead.service) : null,
    lead_tier: lead.lead_tier ? String(lead.lead_tier) : null,
    lead_stage: lead.lead_stage ? String(lead.lead_stage) : null,
    nurture_step: lead.nurture_step != null ? Number(lead.nurture_step) : null,
    created_at: lead.created_at ? String(lead.created_at) : null,
    recycle_at: lead.recycle_at ? String(lead.recycle_at) : null,
    next_nurture_at: lead.next_nurture_at ? String(lead.next_nurture_at) : null,
    next_nurture_on: (lead as { next_nurture_on?: string | null }).next_nurture_on
      ? String((lead as { next_nurture_on?: string | null }).next_nurture_on).slice(0, 10)
      : null,
    completed_at: (lead as { completed_at?: string | null }).completed_at
      ? String((lead as { completed_at?: string | null }).completed_at)
      : null,
    call_booked_at: (lead as { call_booked_at?: string | null }).call_booked_at
      ? String((lead as { call_booked_at?: string | null }).call_booked_at)
      : null,
    shoot_booked_at: (lead as { shoot_booked_at?: string | null }).shoot_booked_at
      ? String((lead as { shoot_booked_at?: string | null }).shoot_booked_at)
      : null,
    nurture_paused_at: lead.nurture_paused_at ? String(lead.nurture_paused_at) : null,
    unsubscribed_at: lead.unsubscribed_at ? String(lead.unsubscribed_at) : null,
    raw_payload: lead.raw_payload,
  }

  const svcLabel =
    leadForClient.service === "media-day"
      ? "Media Day"
      : leadForClient.service === "senior-portraits"
        ? "Senior portraits"
        : leadForClient.service === "sportraits"
          ? "Sportraits"
          : leadForClient.service || "—"

  return (
    <div className="max-w-6xl">
      <Link
        href="/admin/leads"
        className="mb-4 inline-block text-sm text-[var(--ac-text-muted)] transition-colors hover:text-[var(--ac-accent)]"
      >
        ← Back to leads
      </Link>
      <AdminHubPageHeader
        title={String(lead.name ?? "Lead")}
        subtitle={`${leadForClient.email} · ${svcLabel}${leadForClient.lead_tier ? ` · ${leadForClient.lead_tier}` : ""}`}
      />

      <div className="mb-10">
        <LeadDetailWorkspace lead={leadForClient} events={events ?? []} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
            Lifecycle & nurture
          </h2>
          <LeadProfileForm lead={leadForClient as Record<string, unknown> & { id: string }} />
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
            Related leads (same email)
          </h2>
          {(related?.length ?? 0) === 0 ? (
            <p className="text-sm text-[var(--ac-text-muted)]">None</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {related!.map(r => (
                <li key={r.id}>
                  <Link href={`/admin/leads/${r.id}`} className="font-medium text-[var(--ac-accent)] hover:underline">
                    {r.id.slice(0, 8)}…
                  </Link>
                  <span className="ml-2 text-[var(--ac-text-muted)]">{r.lead_stage}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="mt-10 rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-4">
        <summary className="cursor-pointer text-xs font-semibold text-[var(--ac-text-muted)]">
          Raw payload (JSON)
        </summary>
        <pre className="mt-3 max-h-64 overflow-auto text-xs text-[var(--ac-text-muted)]">
          {JSON.stringify(lead.raw_payload, null, 2)}
        </pre>
      </details>

      <div className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
          Full timeline
        </h2>
        <LeadEventsList events={events ?? []} />
      </div>
    </div>
  )
}
