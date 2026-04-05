import { requireAdminUser } from "@/lib/admin-auth"
import { AdminHubPageHeader } from "@/components/admin/admin-hub-page-header"
import { AdminLeadsDashboard, type LeadTableRow } from "@/components/admin/admin-leads-dashboard"
import { AdminSchemaBanner } from "@/components/admin/admin-schema-banner"
import { getAdminHubStats } from "@/lib/admin-hub-stats"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const FULL_SELECT =
  "id,created_at,name,email,service,lead_tier,lead_stage,nurture_step,next_nurture_at,unsubscribed_at"
const FALLBACK_SELECT = "id,created_at,name,email,service,lead_tier,lead_stage,unsubscribed_at"

export default async function AdminLeadsPage() {
  await requireAdminUser()
  const admin = createSupabaseAdmin()
  if (!admin) {
    return <p className="text-red-400">Supabase admin not configured.</p>
  }

  let schemaPartial = false
  let queryError: string | null = null

  const primary = await admin.from("leads").select(FULL_SELECT).order("created_at", { ascending: false }).limit(200)

  let leads: LeadTableRow[] = []

  if (primary.error && primary.error.message.includes("nurture_step")) {
    schemaPartial = true
    const fb = await admin.from("leads").select(FALLBACK_SELECT).order("created_at", { ascending: false }).limit(200)
    if (fb.error) queryError = fb.error.message
    else leads = (fb.data ?? []) as LeadTableRow[]
  } else if (primary.error) {
    queryError = primary.error.message
  } else {
    leads = (primary.data ?? []) as LeadTableRow[]
  }

  const stats = await getAdminHubStats(admin)

  return (
    <div>
      <AdminHubPageHeader
        title="Leads"
        subtitle="Track inquiries through your funnel — open a row for lifecycle controls, events, and tests."
      />

      {queryError ? (
        <p className="mb-6 text-sm text-red-400">{queryError}</p>
      ) : schemaPartial ? (
        <div className="mb-6">
          <AdminSchemaBanner message="column leads.nurture_step does not exist" />
        </div>
      ) : null}

      {!queryError ? (
        <AdminLeadsDashboard leads={leads} stats={stats} schemaPartial={schemaPartial} />
      ) : null}
    </div>
  )
}
