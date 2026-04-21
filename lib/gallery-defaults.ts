import type { GalleryItem, GalleryLayout, GallerySpotlightQuote } from "@/lib/site-content-schema"
import { SHOOTS, TESTIMONIALS, type Shoot, type ShootSize, type Testimonial } from "@/components/portfolio/shoot-data"

const TRACK_VW = 600
const COLS = 12
const COL_VW = TRACK_VW / COLS

function parseVw(s: string): number {
  const n = parseFloat(String(s).replace("vw", "").trim())
  return Number.isFinite(n) ? n : 0
}

function parseVh(s: string): number {
  const n = parseFloat(String(s).replace("vh", "").trim())
  return Number.isFinite(n) ? n : 0
}

function sizeToColSpan(size: ShootSize): number {
  const w: Record<ShootSize, number> = { small: 18, medium: 26, large: 34, hero: 44 }
  return Math.max(1, Math.min(COLS, Math.ceil(w[size] / COL_VW)))
}

function leftToCol(leftVw: number): number {
  const c = Math.floor(leftVw / COL_VW) + 1
  return Math.min(COLS, Math.max(1, c))
}

function topToRow(topVh: number, rowCount: number): number {
  if (topVh < 38) return 1
  if (topVh < 55) return 2
  return Math.min(rowCount, 3)
}

function shootToItem(s: Shoot, rowCount: number): Extract<GalleryItem, { type: "shoot" }> {
  const left = parseVw(s.left)
  const top = parseVh(s.top)
  const col = leftToCol(left)
  const colSpan = sizeToColSpan(s.size)
  const row = topToRow(top, rowCount)
  const rowSpan = s.size === "hero" || s.size === "large" ? 2 : 1
  return {
    type: "shoot",
    id: s.id,
    col: Math.min(col, COLS - colSpan + 1),
    colSpan,
    row,
    rowSpan: Math.min(rowSpan, rowCount - row + 1),
    title: s.title,
    category: s.category,
    cover: s.cover,
    images: [...s.images],
    isGrayscale: s.isGrayscale,
    speed: s.speed,
    sizePreset: s.size,
  }
}

function testimonialToItem(t: Testimonial, rowCount: number): Extract<GalleryItem, { type: "quote" }> {
  const left = parseVw(t.left)
  const top = parseVh(t.top)
  return {
    type: "quote",
    id: t.id,
    col: Math.min(COLS - 2, Math.max(1, leftToCol(left))),
    colSpan: 2,
    row: topToRow(top, rowCount),
    rowSpan: 1,
    quote: t.quote,
    attribution: t.attribution,
    context: t.context,
  }
}

const DEFAULT_SPOTLIGHT: GallerySpotlightQuote[] = [
  {
    quote:
      "The best photoshoot I've ever done. He really made us feel comfortable, and the photos turned out incredible.",
    name: "McKenna Patton",
    detail: "Dance",
  },
  {
    quote: "I was blown away when I saw my photos. You can clearly see AC took his time on every photo.",
    name: "Dom Weed",
    detail: "Senior + Baseball",
  },
  {
    quote: "AC is the premier photographer in the area and he won't let you down.",
    name: "Jack Nolan",
    detail: "Senior Portraits",
  },
]

export function buildDefaultGalleryLayout(): GalleryLayout {
  const gridRowCount = 3
  const shootItems = SHOOTS.map((s) => shootToItem(s, gridRowCount))
  const quoteItems = TESTIMONIALS.map((t) => testimonialToItem(t, gridRowCount))
  const items: GalleryItem[] = [...shootItems, ...quoteItems]

  return {
    trackWidthVw: TRACK_VW,
    gridColumns: 12,
    gridRowCount,
    items,
    spotlightQuotes: DEFAULT_SPOTLIGHT,
    endCta: {
      headline: "Let's build\nyours.",
      buttonText: "Book a shoot",
      buttonHref: "/contact",
    },
    spotlightEyebrow: "What clients say",
  }
}
