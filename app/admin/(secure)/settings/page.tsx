import { requireAdminUser } from "@/lib/admin-auth"
import { AdminHubPageHeader } from "@/components/admin/admin-hub-page-header"
import { AutomationSettingsForm } from "@/components/admin/automation-settings-form"
import { AutomationTemplateShortcuts } from "@/components/admin/automation-template-shortcuts"

export default async function AdminSettingsPage() {
  await requireAdminUser()
  return (
    <div className="space-y-10">
      <AdminHubPageHeader
        title="Automation & safety"
        subtitle="What happens automatically (Day 0 + your new-lead email), how to pause sends, and what “recycle” means. Nurture emails are always sent manually from Follow-ups."
      />
      <AutomationTemplateShortcuts />
      <AutomationSettingsForm />
    </div>
  )
}
