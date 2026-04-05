import { AdminHubSidebar } from "@/components/admin/admin-hub-sidebar"
import { AdminWorkQueueBell } from "@/components/admin/admin-work-queue-bell"

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-panel flex min-h-screen flex-col bg-[var(--ac-bg)] md:flex-row">
      <AdminHubSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-end border-b border-[var(--ac-divider)] bg-[var(--ac-surface)] px-4 md:px-6">
          <AdminWorkQueueBell />
        </header>
        <main className="min-h-[50vh] flex-1 overflow-auto text-[var(--ac-text)]">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
