import { Suspense } from "react"
import { requireAdminUser } from "@/lib/admin-auth"
import { AdminHubPageHeader } from "@/components/admin/admin-hub-page-header"
import { FollowUpsQueue } from "@/components/admin/follow-ups-queue"

export default async function NurtureQueuePage() {
  await requireAdminUser()
  return (
    <div>
      <AdminHubPageHeader
        title="Follow-up queue"
        subtitle="Nurture and recycle emails — compose, edit, save to templates, then send when you’re ready."
      />
      <Suspense fallback={<p className="text-sm text-[var(--ac-text-muted)]">Loading…</p>}>
        <FollowUpsQueue />
      </Suspense>
    </div>
  )
}
