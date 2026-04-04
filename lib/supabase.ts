import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Returns the full public URL for a file in the "portfolio" Supabase bucket.
 * Path example: "sportraits/dom-weed/cover.jpg"
 */
export function getImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio/${path}`
}
