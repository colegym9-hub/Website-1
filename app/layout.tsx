import "./globals.css"
import { cn } from "@/lib/utils"

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
        {children}
      </body>
    </html>
  )
}
