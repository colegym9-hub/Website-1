import "./globals.css"
import { cn } from "@/lib/utils"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import Nav from "@/components/nav"
import PageLoader from "@/components/page-loader"
import BackgroundEffects from "@/components/background-effects"

export const metadata = {
  title: "A.C Media - Athlete Photography",
  description:
    "Cinematic athlete photography experience based in Binghamton, NY. Media days, sportraits, senior portraits. Every athlete has a story worth telling.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("dark antialiased")}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" />
        <link rel="stylesheet" href="https://use.typekit.net/xjl1yqv.css" />
      </head>
      <body suppressHydrationWarning>
        <BackgroundEffects />
        <PageLoader />
        <SmoothScrollProvider>
          <Nav />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
