import AboutClient from "@/components/about/about-client"
import { SiteShell } from "@/components/site-shell"

export const metadata = {
  title: "About - A.C Media",
  description:
    "Cole Warner founded A.C Media to give every athlete an image that reflects the version of themselves they worked to become. Based in Binghamton and Elmira-Corning, NY.",
}

export default function AboutPage() {
  return (
    <SiteShell>
      <AboutClient />
    </SiteShell>
  )
}
