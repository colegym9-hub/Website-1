"use client"

import DesktopChapters from "@/components/portfolio/gallery/desktop-chapters"
import MobileChapters from "@/components/portfolio/gallery/mobile-chapters"
import type { GalleryLayout } from "@/lib/site-content-schema"

export default function CanvasGallery({ layout }: { layout: GalleryLayout }) {
  return (
    <>
      <DesktopChapters layout={layout} />
      <MobileChapters layout={layout} />
    </>
  )
}
