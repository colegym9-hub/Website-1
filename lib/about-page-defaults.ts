import type { AboutClientContent } from "@/components/about/about-client"
import {
  DEFAULT_ABOUT_BELIEFS,
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_MILESTONES,
  DEFAULT_ABOUT_NOW,
  DEFAULT_ABOUT_PHOTOS,
  DEFAULT_ABOUT_SLIDE_BEGINNING,
  DEFAULT_ABOUT_SLIDE_WORK,
  DEFAULT_GLOBAL_FOOTER,
} from "@/lib/site-content-defaults"

export function buildDefaultAboutPageContent(): AboutClientContent {
  const f = DEFAULT_GLOBAL_FOOTER
  return {
    hero: DEFAULT_ABOUT_HERO,
    slideBeginning: DEFAULT_ABOUT_SLIDE_BEGINNING,
    slideWork: DEFAULT_ABOUT_SLIDE_WORK,
    now: DEFAULT_ABOUT_NOW,
    beliefs: DEFAULT_ABOUT_BELIEFS,
    milestones: DEFAULT_ABOUT_MILESTONES,
    photos: DEFAULT_ABOUT_PHOTOS,
    closing: {
      headline: `${f.headlineLine1} ${f.headlineLine2}`,
      buttonText: `${f.ctaText} →`,
      buttonHref: f.ctaHref,
    },
  }
}
