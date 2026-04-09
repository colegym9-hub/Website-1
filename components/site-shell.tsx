"use client"

import Nav from "@/components/nav"
import PageLoader from "@/components/page-loader"
import BackgroundEffects from "@/components/background-effects"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundEffects />
      <PageLoader />
      <SmoothScrollProvider>
        <Nav />
        {children}
      </SmoothScrollProvider>
    </>
  )
}
