import HomeHero from "@/components/home/home-hero"
import HomeJourney from "@/components/home/home-journey"
import HomeArcServices from "@/components/home/home-arc-services"
import Footer from "@/components/footer"
import { SiteShell } from "@/components/site-shell"

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
