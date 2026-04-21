"use client"

import Nav from "@/components/nav"
import PageLoader from "@/components/page-loader"
import BackgroundEffects from "@/components/background-effects"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import type { GlobalNavContent } from "@/lib/site-content-schema"

export function SiteShell({
  children,
  navContent,
}: {
  children: React.ReactNode
  navContent?: GlobalNavContent
}) {
  return (
    <>
      <BackgroundEffects />
      <PageLoader />
      <SmoothScrollProvider>
        <Nav content={navContent} />
        {children}
      </SmoothScrollProvider>
    </>
  )
}
