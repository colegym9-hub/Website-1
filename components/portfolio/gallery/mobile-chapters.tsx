"use client"

import MobileChapterPanel from "@/components/portfolio/gallery/mobile-chapter-panel"
import type { GalleryLayout } from "@/lib/site-content-schema"

export default function MobileChapters({ layout }: { layout: GalleryLayout }) {
  return (
    <div className="md:hidden flex flex-col gap-16 px-5 py-20">
      {layout.chapters.map((chapter, i) => (
        <MobileChapterPanel
          key={chapter.id}
          chapter={chapter}
          index={i}
          isLast={i === layout.chapters.length - 1}
        />
      ))}
    </div>
  )
}
