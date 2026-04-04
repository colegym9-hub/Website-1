import { requireAdminUser } from "@/lib/admin-auth"
import { AutomationSettingsForm } from "@/components/admin/automation-settings-form"

export default async function AdminSettingsPage() {
  await requireAdminUser()
  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-2">Automation</h1>
      <p className="text-[#666] text-sm mb-8">Global kill switch and optional per-service flags (stored in Supabase).</p>
      <AutomationSettingsForm />
    </div>
  )
}
