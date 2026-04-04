"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import BackgroundEffects from "@/components/background-effects"
import Funnel from "@/components/book/funnel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

function BookInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialService = searchParams.get("service") ?? undefined
  const [showLeave, setShowLeave] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--ac-bg)] flex flex-col">
      <BackgroundEffects />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14">
        <span
          className="text-[var(--ac-text)] tracking-[0.15em] uppercase text-sm"
          style={{ fontFamily: '"coolvetica", sans-serif' }}
        >
          A.C Media
        </span>
        <button
          onClick={() => setShowLeave(true)}
          aria-label="Exit booking"
          className="text-[var(--ac-text-muted)] hover:text-[var(--ac-text)] transition-colors p-1"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Funnel */}
      <main className="flex-1 flex items-start justify-center pt-20 pb-28">
        <Funnel initialService={initialService} />
      </main>

      {/* Leave dialog */}
      <Dialog open={showLeave} onOpenChange={setShowLeave}>
        <DialogContent className="max-w-sm border border-[var(--ac-divider)]" style={{ background: "#161616" }}>
          <DialogTitle className="font-heading text-white text-xl">Leave this page?</DialogTitle>
          <p className="text-[#777] text-sm leading-relaxed mt-1">
            Your progress will be lost if you go back now.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.back()}
              className="flex-1 py-2.5 text-sm text-[#666] border border-[#2a2a2a] rounded-lg hover:border-[#555] transition-colors"
            >
              Leave
            </button>
            <button
              onClick={() => setShowLeave(false)}
              className="flex-1 py-2.5 text-sm text-[#0d2224] bg-[var(--ac-accent)] rounded-lg hover:bg-[var(--ac-accent-hover)] transition-colors font-medium"
            >
              Keep going
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ac-bg)]" />}>
      <BookInner />
    </Suspense>
  )
}
