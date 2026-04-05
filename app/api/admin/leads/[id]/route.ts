import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const ymdOrEmpty = z.preprocess(
  (v: unknown) => (v === "" ? null : v),
  ymd.nullable().optional(),
)

const patchSchema = z
  .object({
    lead_stage: z.string().optional(),
    nurture_step: z.number().int().min(0).max(10).optional(),
    next_nurture_at: z.string().nullable().optional(),
    next_nurture_on: ymdOrEmpty,
    nurture_paused_at: z.string().nullable().optional(),
    recycle_at: z.string().nullable().optional(),
    unsubscribed_at: z.string().nullable().optional(),
    call_booked_at: z.string().nullable().optional(),
    shoot_booked_at: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
  })
  .strict()

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 })
  }
  const raw = parsed.data
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const body: Record<string, unknown> = { ...raw }
  if (Object.prototype.hasOwnProperty.call(raw, "next_nurture_on")) {
    const on = raw.next_nurture_on
    body.next_nurture_at = on ? `${on}T12:00:00.000Z` : null
  }

  const { error } = await admin.from("leads").update(body).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
