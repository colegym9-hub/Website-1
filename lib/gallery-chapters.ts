import { SHOOTS, TESTIMONIALS, type Shoot, type Testimonial } from "@/components/portfolio/shoot-data"
import type { GalleryChapter, GalleryShootRef, GalleryChapterQuote } from "@/lib/site-content-schema"

function shootRef(id: string): GalleryShootRef {
  const s = SHOOTS.find((x) => x.id === id)
  if (!s) throw new Error(`Missing shoot: ${id}`)
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    cover: s.cover,
    images: [...s.images],
    isGrayscale: s.isGrayscale,
    objectPosition: s.objectPosition,
  }
}

function quoteRef(id: string): GalleryChapterQuote {
  const t = TESTIMONIALS.find((x) => x.id === id)
  if (!t) throw new Error(`Missing testimonial: ${id}`)
  return {
    id: t.id,
    quote: t.quote,
    attribution: t.attribution,
    context: t.context,
  }
}

export const DEFAULT_GALLERY_CHAPTERS: GalleryChapter[] = [
  {
    id: "ch-sportraits",
    eyebrow: "Sportraits · 01",
    hero: shootRef("fletcher-good"),
    supports: [shootRef("mackenzie-sportraits"), shootRef("dom-weed")],
    quote: quoteRef("dom-weed-quote"),
  },
  {
    id: "ch-media-days",
    eyebrow: "Media Days · 02",
    hero: shootRef("binghamton-kickline"),
    supports: [shootRef("williamson-basketball"), shootRef("egc-dance")],
    quote: quoteRef("binghamton-kickline-quote"),
  },
  {
    id: "ch-senior-portraits",
    eyebrow: "Senior Portraits · 03",
    hero: shootRef("mackenzie-chamberlain"),
    supports: [shootRef("jack-nolan"), shootRef("jade-colewell")],
    quote: quoteRef("mackenzie-quote"),
  },
  {
    id: "ch-closing",
    eyebrow: "Closing · 04",
    hero: shootRef("talon-daneglo"),
    supports: [shootRef("owen-stevens"), shootRef("fury-fastpitch")],
    quote: quoteRef("jack-nolan-quote"),
  },
]
