"use client"

import FloatingQuote from "@/components/portfolio/floating-quote"
import GalleryCard from "@/components/portfolio/gallery/gallery-card"
import type { GalleryChapter } from "@/lib/site-content-schema"

type Props = {
  chapter: GalleryChapter
  index: number
  isLast: boolean
}

export default function MobileChapterPanel({ chapter, index, isLast }: Props) {
  return (
    <section aria-label={chapter.eyebrow} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--ac-accent)" }}>
          {chapter.eyebrow}
        </p>
        <span
          className="font-heading text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--ac-text-muted)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative">
        <GalleryCard item={chapter.hero} role="mobile-hero" priority={index === 0} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <GalleryCard item={chapter.supports[0]} role="mobile-support" />
        </div>
        <div className="relative">
          <GalleryCard item={chapter.supports[1]} role="mobile-support" />
        </div>
      </div>

      <div className="pt-2">
        <FloatingQuote
          quote={chapter.quote.quote}
          attribution={chapter.quote.attribution}
          context={chapter.quote.context}
          delay={0}
        />
      </div>

      {!isLast && <div className="mt-4 h-px w-full" style={{ backgroundColor: "var(--ac-divider)" }} />}
    </section>
  )
}
