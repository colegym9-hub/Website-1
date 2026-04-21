// DEV-ONLY PREVIEW. Safe to delete.
// Created during a Claude session to verify the /book funnel renders while
// app/(no-nav)/book/page.tsx is temporarily set to notFound() in WIP.
// If /book is restored, this route becomes redundant and should be removed.

import Funnel from "@/components/book/funnel"

export default function FunnelPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--ac-bg)] py-8">
      <div className="mx-auto max-w-2xl px-6 text-center text-[10px] uppercase tracking-widest text-[#444] pb-4">
        dev preview. delete app/funnel-preview-dev/ when /book is restored.
      </div>
      <Funnel />
    </main>
  )
}
