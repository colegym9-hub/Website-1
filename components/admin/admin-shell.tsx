import Link from "next/link"

const nav = [
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/summary", label: "Summary" },
  { href: "/admin/templates", label: "Email templates" },
  { href: "/admin/settings", label: "Automation" },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="w-52 border-r border-[#222] p-4 flex flex-col gap-1 shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-[#666] mb-4 px-2">A.C Media</p>
        {nav.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className="px-3 py-2 rounded-md text-sm text-[#aaa] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            {n.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-auto">{children}</main>
    </div>
  )
}
