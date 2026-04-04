import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data: g } = await admin.from("automation_settings").select("value").eq("key", "global").maybeSingle()
  const { data: s } = await admin.from("automation_settings").select("value").eq("key", "services").maybeSingle()

  return NextResponse.json({
    global: g?.value ?? { paused: false },
    services: s?.value ?? {},
  })
}

const patchSchema = z.object({
  globalPaused: z.boolean().optional(),
  servicesJson: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = patchSchema.parse(await req.json())
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  if (body.globalPaused !== undefined) {
    const { data: existing } = await admin.from("automation_settings").select("value").eq("key", "global").maybeSingle()
    const prev = (existing?.value as Record<string, unknown> | null) ?? {}
    await admin.from("automation_settings").upsert(
      {
        key: "global",
        value: { ...prev, paused: body.globalPaused },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )
  }

  if (body.servicesJson !== undefined) {
    let parsed: Record<string, boolean> = {}
    try {
      parsed = JSON.parse(body.servicesJson) as Record<string, boolean>
    } catch {
      return NextResponse.json({ error: "Invalid services JSON" }, { status: 400 })
    }
    await admin.from("automation_settings").upsert(
      {
        key: "services",
        value: parsed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )
  }

  return NextResponse.json({ ok: true })
}
