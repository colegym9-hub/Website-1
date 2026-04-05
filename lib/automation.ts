import type { SupabaseClient } from "@supabase/supabase-js"

export async function isAutomationPaused(admin: SupabaseClient): Promise<boolean> {
  const { data } = await admin.from("automation_settings").select("value").eq("key", "global").maybeSingle()
  const v = data?.value as { paused?: boolean } | null
  return Boolean(v?.paused)
}

export async function isServiceAutomationEnabled(admin: SupabaseClient, service: string): Promise<boolean> {
  const { data } = await admin.from("automation_settings").select("value").eq("key", "services").maybeSingle()
  const v = data?.value as Record<string, boolean> | null
  if (!v || typeof v !== "object") return true
  if (v[service] === undefined) return true
  return Boolean(v[service])
}

/** One DB round-trip for admin queue filters (paused + per-service map). */
export async function loadAutomationSendGate(admin: SupabaseClient): Promise<{
  paused: boolean
  serviceEnabled: (service: string) => boolean
}> {
  const [{ data: g }, { data: s }] = await Promise.all([
    admin.from("automation_settings").select("value").eq("key", "global").maybeSingle(),
    admin.from("automation_settings").select("value").eq("key", "services").maybeSingle(),
  ])
  const paused = Boolean((g?.value as { paused?: boolean } | null)?.paused)
  const v = s?.value as Record<string, boolean> | null
  function serviceEnabled(service: string) {
    if (!v || typeof v !== "object") return true
    if (v[service] === undefined) return true
    return Boolean(v[service])
  }
  return { paused, serviceEnabled }
}
