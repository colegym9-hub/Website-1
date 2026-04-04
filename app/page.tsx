import HomeHero from "@/components/home/home-hero"
import HomeJourney from "@/components/home/home-journey"
import HomeArcServices from "@/components/home/home-arc-services"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main>
      <HomeHero />
      <HomeJourney />
      <HomeArcServices />
      <Footer />
    </main>
  )
}
