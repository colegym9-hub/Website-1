"use client"

import FloatingQuote from "@/components/portfolio/floating-quote"
import GalleryCard from "@/components/portfolio/gallery/gallery-card"
import type { GalleryChapter } from "@/lib/site-content-schema"

type Props = {
  chapter: GalleryChapter
  chapterWidthVw: number
  index: number
}

export default function ChapterPanel({ chapter, chapterWidthVw, index }: Props) {
  return (
    <section
      aria-label={chapter.eyebrow}
      className="relative flex-shrink-0 h-screen"
      style={{ width: `${chapterWidthVw}vw`, padding: "9vh 4vw 6vh" }}
    >
      <div className="pointer-events-none absolute left-[4vw] top-[4vh] flex items-baseline gap-4">
        <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--ac-accent)" }}>
          {chapter.eyebrow}
        </p>
      </div>
      <div className="pointer-events-none absolute right-[4vw] top-[4vh]">
        <span
          className="font-heading text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--ac-text-muted)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div
        className="relative h-full w-full"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(6, minmax(0, 1fr))",
          columnGap: "1vw",
          rowGap: "1vh",
        }}
      >
        <div style={{ gridColumn: "1 / span 6", gridRow: "1 / span 6" }}>
          <GalleryCard item={chapter.hero} role="hero" priority={index === 0} />
        </div>

        <div style={{ gridColumn: "7 / span 3", gridRow: "1 / span 3" }}>
          <GalleryCard item={chapter.supports[0]} role="support" />
        </div>

        <div style={{ gridColumn: "7 / span 3", gridRow: "4 / span 3" }}>
          <GalleryCard item={chapter.supports[1]} role="support" />
        </div>

        <div
          style={{
            gridColumn: "10 / span 3",
            gridRow: "2 / span 4",
            display: "flex",
            alignItems: "center",
            paddingLeft: "1.2vw",
          }}
        >
          <FloatingQuote
            quote={chapter.quote.quote}
            attribution={chapter.quote.attribution}
            context={chapter.quote.context}
            delay={0.4 + index * 0.1}
          />
        </div>
      </div>
    </section>
  )
}
