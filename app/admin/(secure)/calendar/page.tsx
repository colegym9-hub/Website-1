import { requireAdminUser } from "@/lib/admin-auth"
import { AdminHubPageHeader } from "@/components/admin/admin-hub-page-header"
import { AdminCalendarMonth } from "@/components/admin/admin-calendar-month"

export default async function AdminCalendarPage() {
  await requireAdminUser()
  return (
    <div>
      <AdminHubPageHeader
        title="Calendar"
        subtitle="Nurture dates, recycle check-ins, milestones, and completed markers — all in one month view. Uses each lead’s stored dates."
      />
      <AdminCalendarMonth />
    </div>
  )
}
