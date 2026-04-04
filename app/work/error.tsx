"use client"

export default function WorkError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6 px-4">
      <p className="text-[#A0A0A0] text-xs tracking-widest uppercase">
        Something went wrong
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 text-xs tracking-widest uppercase text-[var(--ac-text)] bg-[var(--ac-accent)] hover:bg-[var(--ac-accent-hover)] transition-colors"
      >
        Try again
      </button>
    </main>
  )
}
