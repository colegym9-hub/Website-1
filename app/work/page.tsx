import { buildDefaultGalleryLayout } from "@/lib/gallery-defaults"
import { DEFAULT_SEO_WORK } from "@/lib/site-content-defaults"
import WorkPageClient from "@/components/work/work-page-client"

export const metadata = {
  title: DEFAULT_SEO_WORK.title,
  description: DEFAULT_SEO_WORK.description,
}

export default function WorkPage() {
  const layout = buildDefaultGalleryLayout()
  return <WorkPageClient galleryLayout={layout} />
}
