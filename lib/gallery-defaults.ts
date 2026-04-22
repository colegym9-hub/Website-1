import type { GalleryLayout } from "@/lib/site-content-schema"
import { DEFAULT_GALLERY_CHAPTERS } from "@/lib/gallery-chapters"

export const DEFAULT_CHAPTER_WIDTH_VW = 100

export function buildDefaultGalleryLayout(): GalleryLayout {
  return {
    chapters: DEFAULT_GALLERY_CHAPTERS,
    chapterWidthVw: DEFAULT_CHAPTER_WIDTH_VW,
  }
}
