import Link from "next/link"
import { requireAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export default async function AdminLeadsPage() {
  await requireAdminUser()
  const admin = createSupabaseAdmin()
  if (!admin) return <p className="text-red-400">Supabase admin not configured.</p>

  const { data: leads, error } = await admin
    .from("leads")
    .select(
      "id,created_at,name,email,service,lead_tier,lead_stage,nurture_step,next_nurture_at,unsubscribed_at",
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return <p className="text-red-400">{error.message}</p>

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-2">Leads</h1>
      <p className="text-[#666] text-sm mb-8">Recent inquiries (newest first).</p>
      <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#141414] text-[#888] text-left">
            <tr>
              <th className="p-3 font-medium">When</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Service</th>
              <th className="p-3 font-medium">Tier</th>
              <th className="p-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map(row => (
              <tr key={row.id} className="border-t border-[#222] hover:bg-[#151515]">
                <td className="p-3 text-[#888] whitespace-nowrap">
                  {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <Link href={`/admin/leads/${row.id}`} className="text-[var(--ac-accent)] hover:underline">
                    {row.name}
                  </Link>
                </td>
                <td className="p-3 text-[#ccc] max-w-[200px] truncate">{row.email}</td>
                <td className="p-3 text-[#aaa]">{row.service || "—"}</td>
                <td className="p-3 text-[#aaa]">{row.lead_tier || "—"}</td>
                <td className="p-3 text-[#aaa]">{row.lead_stage || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
