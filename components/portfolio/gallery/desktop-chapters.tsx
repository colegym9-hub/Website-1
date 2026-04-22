"use client"

import { useRef } from "react"
import ChapterPanel from "@/components/portfolio/gallery/chapter-panel"
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll"
import type { GalleryLayout } from "@/lib/site-content-schema"

export default function DesktopChapters({ layout }: { layout: GalleryLayout }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const trackWidthVw = layout.chapters.length * layout.chapterWidthVw

  useHorizontalScroll({
    wrapRef,
    trackRef,
    progressRef,
    deps: [layout.chapters.length, layout.chapterWidthVw],
  })

  return (
    <div ref={wrapRef} className="relative hidden md:block">
      <div className="sticky top-0 overflow-hidden" style={{ height: "100vh" }}>
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 z-50 origin-left"
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "var(--ac-accent)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
          }}
        />

        <div
          ref={trackRef}
          className="absolute left-0 top-0 flex h-full will-change-transform"
          style={{ width: `${trackWidthVw}vw`, height: "100vh" }}
        >
          {layout.chapters.map((chapter, i) => (
            <ChapterPanel
              key={chapter.id}
              chapter={chapter}
              chapterWidthVw={layout.chapterWidthVw}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
