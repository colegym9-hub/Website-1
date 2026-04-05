import { requireAdminUser } from "@/lib/admin-auth"
import { AdminHubPageHeader } from "@/components/admin/admin-hub-page-header"
import { TemplatesCatalogEditor } from "@/components/admin/templates-catalog-editor"

export default async function AdminTemplatesPage() {
  await requireAdminUser()
  return (
    <div>
      <AdminHubPageHeader
        title="Templates"
        subtitle="Nurture and recycle emails only (plain text → HTML for sending). Day 0 confirmations are automatic. Use Load A.C Media default copy to install starter templates."
      />
      <TemplatesCatalogEditor />
    </div>
  )
}
