import Link from "next/link"

export default function Email3ThanksPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[var(--ac-accent)] text-[11px] uppercase tracking-widest mb-4">Thanks for letting us know</p>
      <h1 className="font-heading text-white text-3xl md:text-4xl max-w-md">We appreciate the honesty.</h1>
      <p className="text-[#888] text-sm mt-4 max-w-md leading-relaxed">
        If timing changes down the road, you can always reach out. No pressure.
      </p>
      <Link href="/" className="mt-8 text-[var(--ac-accent)] text-sm hover:underline">
        Back to home
      </Link>
    </div>
  )
}
