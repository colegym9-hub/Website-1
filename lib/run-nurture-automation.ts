export type NurtureRunOutcome =
  | { ok: true; sent: number; skipped?: string }
  | { ok: false; error: string }

/**
 * Legacy cron hook: nurture and recycle are sent only from the admin panel (manual).
 * This endpoint remains for Bearer-auth manual triggers but does not send email.
 */
export async function runNurtureAutomation(args: { respectSendWindow: boolean }): Promise<NurtureRunOutcome> {
  void args
  return { ok: true, sent: 0, skipped: "manual_only_admin_panel" }
}
