import AboutClient from "@/components/about/about-client"
import Footer from "@/components/footer"
import { SiteShell } from "@/components/site-shell"
import { buildDefaultAboutPageContent } from "@/lib/about-page-defaults"
import { DEFAULT_GLOBAL_FOOTER, DEFAULT_SEO_ABOUT } from "@/lib/site-content-defaults"
import type { AboutClientContent } from "@/components/about/about-client"

export const metadata = {
  title: DEFAULT_SEO_ABOUT.title,
  description: DEFAULT_SEO_ABOUT.description,
}

export default function AboutPage() {
  const fb = buildDefaultAboutPageContent()
  const f = DEFAULT_GLOBAL_FOOTER

  const data: AboutClientContent = {
    hero: fb.hero,
    slideBeginning: fb.slideBeginning,
    slideWork: fb.slideWork,
    now: fb.now,
    beliefs: fb.beliefs,
    milestones: fb.milestones,
    photos: fb.photos,
    closing: {
      headline: `${f.headlineLine1} ${f.headlineLine2}`,
      buttonText: `${f.ctaText} →`,
      buttonHref: f.ctaHref,
    },
  }

  return (
    <SiteShell>
      <AboutClient data={data} />
      <Footer />
    </SiteShell>
  )
}
