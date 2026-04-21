import HomeHero from "@/components/home/home-hero"
import HomeJourney from "@/components/home/home-journey"
import HomeArcServices from "@/components/home/home-arc-services"
import Footer from "@/components/footer"
import { SiteShell } from "@/components/site-shell"
import { DEFAULT_SEO_HOME } from "@/lib/site-content-defaults"

export const metadata = {
  title: DEFAULT_SEO_HOME.title,
  description: DEFAULT_SEO_HOME.description,
}

export default function Home() {
  return (
    <SiteShell>
      <main>
        <HomeHero />
        <HomeJourney />
        <HomeArcServices />
        <Footer />
      </main>
    </SiteShell>
  )
}
