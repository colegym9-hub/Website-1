import { requireAdminUser } from "@/lib/admin-auth"
import { TemplatesEditor } from "@/components/admin/templates-editor"

export default async function AdminTemplatesPage() {
  await requireAdminUser()
  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-2">Email templates</h1>
      <p className="text-[#666] text-sm mb-8">DB-backed overrides per service + template key. Empty DB uses built-in HTML from the repo.</p>
      <TemplatesEditor />
    </div>
  )
}
