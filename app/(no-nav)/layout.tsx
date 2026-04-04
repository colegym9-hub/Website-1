// This layout intentionally omits the site-wide Nav and BackgroundEffects
// so that /book (and any future no-nav routes) get a fully clean shell.
export default function NoNavLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
