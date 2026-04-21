/**
 * Seed site_content + work_gallery from code defaults.
 *
 *   npx tsx scripts/seed-site-cms.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
 * (e.g. load .env.local in your shell or use `dotenv-cli`).
 */
import { createClient } from "@supabase/supabase-js"
import { buildDefaultGalleryLayout } from "../lib/gallery-defaults"
import { DEFAULT_CONTENT_BY_ID } from "../lib/site-content-defaults"
import { SITE_CONTENT_IDS } from "../lib/site-content-schema"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

async function main() {
  const now = new Date().toISOString()

  for (const id of SITE_CONTENT_IDS) {
    const json = DEFAULT_CONTENT_BY_ID[id]
    if (!json) continue
    const { error } = await admin.from("site_content").upsert(
      {
        id,
        draft_json: json,
        published_json: json,
        updated_at: now,
        published_at: now,
        published_by: "seed",
      },
      { onConflict: "id" },
    )
    if (error) console.error(id, error.message)
    else console.log("OK site_content", id)
  }

  const gl = buildDefaultGalleryLayout()
  const { error: gErr } = await admin.from("work_gallery").upsert(
    {
      id: "production",
      draft_layout: gl,
      published_layout: gl,
      updated_at: now,
      published_at: now,
      published_by: "seed",
    },
    { onConflict: "id" },
  )
  if (gErr) console.error("work_gallery", gErr.message)
  else console.log("OK work_gallery production")
}

void main()
