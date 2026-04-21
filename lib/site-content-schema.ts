import { z } from "zod"

/** ─── SEO ─────────────────────────────────────────────────────────────── */
export const seoMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().optional().default(""),
})
export type SeoMeta = z.infer<typeof seoMetaSchema>

/** ─── Home: Hero ──────────────────────────────────────────────────────── */
export const homeHeroSchema = z.object({
  typewriterWords: z.array(z.string()).min(1),
  innerOrbitImages: z.array(z.string()).length(6),
  outerOrbitImages: z.array(z.string()).length(9),
})
export type HomeHeroContent = z.infer<typeof homeHeroSchema>

/** ─── Home: Journey ─────────────────────────────────────────────────────── */
export const homeJourneySchema = z.object({
  headlineLine1: z.string(),
  accentWord: z.string(),
  paragraph1: z.string(),
  paragraph2: z.string(),
  ctaText: z.string(),
  ctaHref: z.string(),
  pillImage: z.string(),
  circleImage: z.string(),
  watermark: z.string(),
  headshotLeft: z.string(),
  headshotRight: z.string(),
})
export type HomeJourneyContent = z.infer<typeof homeJourneySchema>

/** ─── Home: Arc services ───────────────────────────────────────────────── */
export const arcServiceCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleBreak: z.tuple([z.string(), z.string()]).optional(),
  description: z.string(),
  service: z.enum(["media-day", "sportraits", "senior-portraits"]),
  image: z.string(),
  bgPosition: z.string().optional(),
})
export const homeServicesSchema = z.object({
  cards: z.array(arcServiceCardSchema).length(3),
})
export type HomeServicesContent = z.infer<typeof homeServicesSchema>

/** ─── About ───────────────────────────────────────────────────────────── */
export const aboutHeroStatSchema = z.object({
  number: z.string(),
  label: z.string(),
})
export const aboutHeroSchema = z.object({
  profileSrc: z.string(),
  profileAlt: z.string(),
  headline: z.string(),
  stats: z.array(aboutHeroStatSchema).length(3),
})
export type AboutHeroContent = z.infer<typeof aboutHeroSchema>

export const aboutSlideSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  body: z.string(),
})
export type AboutSlideContent = z.infer<typeof aboutSlideSchema>

export const aboutNowSchema = z.object({
  headline: z.string(),
  paragraphs: z.array(z.string()).length(3),
})
export type AboutNowContent = z.infer<typeof aboutNowSchema>

export const beliefCardSchema = z.object({
  label: z.string(),
  title: z.string(),
  body: z.string(),
})
export const aboutBeliefsSchema = z.object({
  cards: z.array(beliefCardSchema).length(4),
})
export type AboutBeliefsContent = z.infer<typeof aboutBeliefsSchema>

export const milestonePillSchema = z.object({
  label: z.string(),
  thumbSrc: z.string(),
  thumbAlt: z.string(),
})
export const aboutMilestonesSchema = z.object({
  pills: z.array(milestonePillSchema).length(4),
})
export type AboutMilestonesContent = z.infer<typeof aboutMilestonesSchema>

export const aboutPhotoSchema = z.object({ src: z.string(), alt: z.string() })
export const aboutPhotosSchema = z.object({
  collage: z.array(aboutPhotoSchema).length(5),
  beliefStrydsCollage: z.array(aboutPhotoSchema).length(5),
  circlePortrait: aboutPhotoSchema,
  beliefMediaDayHero: aboutPhotoSchema,
  beliefBtsRaw: aboutPhotoSchema,
})
export type AboutPhotosContent = z.infer<typeof aboutPhotosSchema>

/** ─── Global: Footer + Nav ──────────────────────────────────────────────── */
export const footerLinkSchema = z.object({ label: z.string(), href: z.string() })
export const globalFooterSchema = z.object({
  eyebrow: z.string(),
  headlineLine1: z.string(),
  headlineLine2: z.string(),
  ctaText: z.string(),
  ctaHref: z.string(),
  brandLine: z.string(),
  /** e.g. Instagram + email in the info bar */
  links: z.array(footerLinkSchema),
  locationLine: z.string(),
  /** Shown after © year — e.g. "A.C Media" */
  copyrightName: z.string(),
})
export type GlobalFooterContent = z.infer<typeof globalFooterSchema>

export const globalNavSchema = z.object({
  brandLabel: z.string().default("A.C Media"),
  links: z.array(footerLinkSchema),
  ctaText: z.string(),
  ctaHref: z.string(),
  sheetSocialLabel: z.string(),
  sheetSocialHref: z.string(),
})
export type GlobalNavContent = z.infer<typeof globalNavSchema>

/** ─── Work gallery layout ───────────────────────────────────────────────── */
export const galleryCategorySchema = z.enum(["sportraits", "media-days", "senior-portraits"])

export const gallerySpotlightQuoteSchema = z.object({
  quote: z.string(),
  name: z.string(),
  detail: z.string(),
})

export const galleryEndCtaSchema = z.object({
  headline: z.string(),
  buttonText: z.string(),
  buttonHref: z.string(),
})

export const galleryItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("shoot"),
    id: z.string(),
    col: z.number().int().min(1).max(12),
    colSpan: z.number().int().min(1).max(12),
    row: z.number().int().min(1).max(12),
    rowSpan: z.number().int().min(1).max(12),
    title: z.string(),
    category: galleryCategorySchema,
    cover: z.string(),
    images: z.array(z.string()),
    isGrayscale: z.boolean().optional(),
    speed: z.number().min(0).max(2).optional().default(0.5),
    /** Optional legacy size for mobile aspect ratio */
    sizePreset: z.enum(["small", "medium", "large", "hero"]).optional(),
  }),
  z.object({
    type: z.literal("quote"),
    id: z.string(),
    col: z.number().int().min(1).max(12),
    colSpan: z.number().int().min(1).max(12),
    row: z.number().int().min(1).max(12),
    rowSpan: z.number().int().min(1).max(12),
    quote: z.string(),
    attribution: z.string(),
    context: z.string(),
  }),
])

export const galleryLayoutSchema = z.object({
  trackWidthVw: z.number().min(100).max(2000).default(600),
  gridColumns: z.literal(12).default(12),
  gridRowCount: z.number().int().min(2).max(8).default(3),
  items: z.array(galleryItemSchema),
  spotlightQuotes: z.array(gallerySpotlightQuoteSchema),
  endCta: galleryEndCtaSchema,
  spotlightEyebrow: z.string().default("What clients say"),
})
export type GalleryLayout = z.infer<typeof galleryLayoutSchema>
export type GalleryItem = z.infer<typeof galleryItemSchema>
export type GallerySpotlightQuote = z.infer<typeof gallerySpotlightQuoteSchema>

/** Content row IDs */
export const SITE_CONTENT_IDS = [
  "home:hero",
  "home:journey",
  "home:services",
  "about:hero",
  "about:slide-beginning",
  "about:slide-work",
  "about:now",
  "about:beliefs",
  "about:milestones",
  "about:photos",
  "global:footer",
  "global:nav",
  "seo:home",
  "seo:about",
  "seo:work",
] as const
export type SiteContentId = (typeof SITE_CONTENT_IDS)[number]

export const siteContentIdSchema = z.enum(SITE_CONTENT_IDS)

export function parseSiteContent<T>(schema: z.ZodType<T>, raw: unknown): T | null {
  const r = schema.safeParse(raw)
  return r.success ? r.data : null
}
