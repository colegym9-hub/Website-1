import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { runNurtureAutomation } from "@/lib/run-nurture-automation"

/**
 * Recycle check-in batch only (due `recycle_at`). Scheduled nurture is manual from /admin/nurture-queue.
 * Gated by Supabase session + allowlist. Ignores the Eastern weekday window.
 */
export async function POST() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const result = await runNurtureAutomation({ respectSendWindow: false })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({
    ok: true,
    sent: result.sent,
    ...(result.skipped ? { skipped: result.skipped } : {}),
  })
}
