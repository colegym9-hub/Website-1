"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Slider } from "@/components/ui/slider"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "coach" | "parent" | "senior" | "athlete"
type Service = "media-day" | "sportraits" | "senior-portraits"
type StepId =
  | "who-are-you" | "service-select" | "readiness"
  | "md-sport" | "md-roster" | "md-location" | "md-timeline" | "md-frame" | "md-contact" | "md-rec" | "md-custom-quote"
  | "sp-sports" | "sp-location" | "sp-timeline" | "sp-frame" | "sp-contact" | "sp-rec"
  | "sr-welcome" | "sr-frame" | "sr-session" | "sr-vibe" | "sr-location" | "sr-timeline" | "sr-contact" | "sr-rec"
  | "thank-you"

type ReadinessId = "exploring" | "comparing" | "ready"

interface FD {
  role: Role | ""; service: Service | ""
  sport: string; rosterSize: number
  sports: string[]; vision: string
  sessionType: string; sessionTypeNote: string; vibes: string[]; moodboard: string
  name: string; email: string; phone: string; org: string
  location: string; timeline: string; timelineNote: string
  packageIntent: number; packageName: string
  readiness: ReadinessId | ""
  notes: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: { id: Role; label: string }[] = [
  { id: "coach", label: "Coach" },
  { id: "parent", label: "Parent" },
  { id: "senior", label: "Senior" },
  { id: "athlete", label: "Athlete" },
]

const SERVICES = [
  { id: "media-day" as Service, label: "Media Day", img: "https://images.pixieset.com/821255111/195568d10a8ef49a1684257859a246c3-large.jpg" },
  { id: "sportraits" as Service, label: "Sportraits", img: "https://images.pixieset.com/821255111/17617b846454f5f264d489b2eded72bf-large.jpg" },
  { id: "senior-portraits" as Service, label: "Senior Portraits", img: "https://images.pixieset.com/821255111/aebf37f2c2ea8d62e25d6eb7ea4b4f9c-large.jpg" },
]

const ROLE_SERVICES: Record<Role, Service[]> = {
  coach: ["media-day"],
  parent: ["media-day", "sportraits", "senior-portraits"],
  senior: ["senior-portraits", "sportraits", "media-day"],
  athlete: ["sportraits", "senior-portraits", "media-day"],
}

/** Quick-pick sets full location string; user can also type City, State in the field. */
const LOCATION_QUICK_PICKS: { label: string; value: string }[] = [
  { label: "Binghamton", value: "Binghamton, NY" },
  { label: "Vestal", value: "Vestal, NY" },
  { label: "Athens", value: "Athens, PA" },
  { label: "Waverly", value: "Waverly, NY" },
  { label: "Elmira", value: "Elmira, NY" },
  { label: "Corning", value: "Corning, NY" },
  { label: "Horseheads", value: "Horseheads, NY" },
  { label: "Ithaca", value: "Ithaca, NY" },
  { label: "Mansfield", value: "Mansfield, PA" },
  { label: "Wellsboro", value: "Wellsboro, PA" },
  { label: "Towanda", value: "Towanda, PA" },
  { label: "Troy", value: "Troy, PA" },
]

const US_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NC", "ND", "OH", "OK", "OR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
])

function locationLooksOutsideNyPa(loc: string): boolean {
  const t = loc.trim()
  if (!t) return false
  if (/\b(NY|PA)\b/i.test(t)) return false
  const m = t.match(/,\s*([A-Za-z]{2})\s*$/)
  if (!m) return false
  const code = m[1].toUpperCase()
  if (code === "NY" || code === "PA") return false
  return US_STATE_CODES.has(code)
}

const READINESS_OPTIONS: { id: ReadinessId; label: string }[] = [
  { id: "exploring", label: "Just looking for now" },
  { id: "comparing", label: "Comparing a few options" },
  { id: "ready", label: "Ready to make it happen" },
]
const TIMELINES = ["Next 2-3 weeks", "1-2 months out", "This season (3+ months)", "No set date yet"]
const SR_TIMELINES = ["Spring", "Summer", "Early Fall", "Late Fall", "Winter"]
const SESSION_TYPES = ["Nature", "Urban", "Athletic / Sport-specific", "Mix of everything", "Other"]
const VIBES = ["Fierce & epic", "Relaxed & natural", "Clean & classic", "Fun & expressive"]
const SPORTS_LIST = ["Football","Basketball","Soccer","Baseball","Softball","Volleyball","Wrestling","Track & Field","Cross Country","Swimming","Lacrosse","Golf","Tennis","Hockey","Gymnastics","Cheerleading","Dance","Other"]

// ─── Packages ─────────────────────────────────────────────────────────────────

interface Pkg { name: string; price: string; desc: string; tag?: string }

const SP_PKGS: Pkg[] = [
  { name: "Basic Sportrait", price: "$400", desc: "1 hr · 1 location · 3 retouched · 20+ edited · Studio lighting · Digital gallery + print rights" },
  { name: "Premium Sportrait", price: "$500", desc: "2 hrs · Up to 2 locations · 5 retouched · 30+ edited · Studio lighting · Water / smoke effects · Full gallery", tag: "Most Popular" },
  { name: "Deluxe Sportrait", price: "$700", desc: "3 hrs · Unlimited locations · 10 retouched · 40+ edited · Studio lighting · Water / smoke effects · Full gallery" },
]
const SR_PKGS: Pkg[] = [
  { name: "Basic", price: "$350", desc: "1 hr · 1 location · Unlimited outfits · 3 retouched · 20+ edited · Digital gallery + print rights" },
  { name: "Premium", price: "$500", desc: "2 hrs · Up to 2 locations · 5 retouched · 30+ edited · Professional lighting · Full gallery + print rights", tag: "Most Popular" },
  { name: "Deluxe", price: "$600", desc: "3 hrs · Unlimited locations + outfits · 10 retouched · 40+ edited · Option to split across days · Full gallery" },
  { name: "The Whole Thing", price: "$750", desc: "Senior portraits + Sportraits in one production. 1.5 hrs each · Dramatic lighting · Water / smoke effects · 60+ edited · Can split across days", tag: "Best Value" },
]

// ─── MD pricing calculator ────────────────────────────────────────────────────

function calcMdPrice(base: number, extra: number, count: number): string {
  if (count <= 12) return `$${base.toLocaleString()}`
  const total = base + extra * (count - 12)
  return `$${total.toLocaleString()} · $${extra}/athlete over 12`
}

function getMdPkgsForRoster(count: number): Pkg[] {
  return [
    {
      name: "Premium Media Day",
      price: calcMdPrice(900, 75, count),
      desc: "Up to 12 athletes included in base price · 1 standard + 3 choice poses · 5 edited images per athlete · Studio lighting · Full gallery",
    },
    {
      name: "Deluxe Media Day",
      price: calcMdPrice(1500, 125, count),
      desc: "Up to 12 athletes included in base price · 3 to 6 hr full production · 2 to 3 standard + 5+ poses · Multiple group concepts · Advanced lighting · Smoke, water + fire effects · Full gallery",
      tag: "Full Production",
    },
  ]
}

// ─── Framing questions → package mapping ───────────────────────────────────────

interface Frame { label: string; body: string; pkgIdx: number }

const MD_FRAMES: Frame[] = [
  { label: "Portraits that deliver.", body: "Every athlete looking their best. Consistent, clean, and professional. Efficient use of your team's time.", pkgIdx: 0 },
  { label: "A full production day.", body: "Multiple poses, different setups, smoke and lighting effects. Photos that make your program look elite.", pkgIdx: 1 },
  { label: "The biggest statement you can make.", body: "Everything we have. Extended time, fire and smoke, advanced setups. A media day your program remembers.", pkgIdx: 1 },
]
const SP_FRAMES: Frame[] = [
  {
    label: "The look people actually post.",
    body: "One location, one hour, no filler poses. We build around your sport and your edge — so it feels like you, not a stock athlete portrait.",
    pkgIdx: 0,
  },
  {
    label: "More than one side of the story.",
    body: "Different locations and looks in one session. Same intensity start to finish — varsity energy without the chaos.",
    pkgIdx: 1,
  },
  {
    label: "When you want the full treatment.",
    body: "Unlimited locations, cinematic effects, and the time to get the shots you imagined — not the ones you settle for.",
    pkgIdx: 2,
  },
]
const SR_FRAMES: Frame[] = [
  {
    label: "Every shot should feel like me.",
    body: "Personality-forward. We build the session around who you are. Your energy, your style, your ideas. Not just where to stand.",
    pkgIdx: 1,
  },
  {
    label: "No limits. Locations, looks, all of it.",
    body: "Unlimited locations, unlimited outfits. A full day built around every side of you. Nothing left out.",
    pkgIdx: 2,
  },
  {
    label: "Portraits + athlete identity in one session.",
    body: "Senior portraits and Sportraits combined. Both sides of who you are, captured in one production.",
    pkgIdx: 3,
  },
]

// ─── Path builder ─────────────────────────────────────────────────────────────

function getPath(role: Role | "", service: Service | "", rosterSize = 15): StepId[] {
  const base: StepId[] = ["who-are-you", "service-select"]
  if (!role || !service) return base
  if (service === "media-day") {
    if (rosterSize > 35)
      return [...base, "md-sport", "md-roster", "md-location", "md-timeline", "readiness", "md-contact", "md-custom-quote", "thank-you"]
    return [...base, "md-sport", "md-roster", "md-location", "md-timeline", "md-frame", "readiness", "md-contact", "md-rec", "thank-you"]
  }
  if (service === "sportraits")
    return [...base, "sp-sports", "sp-location", "sp-timeline", "sp-frame", "readiness", "sp-contact", "sp-rec", "thank-you"]
  return [...base, "sr-welcome", "sr-frame", "sr-session", "sr-vibe", "sr-location", "sr-timeline", "readiness", "sr-contact", "sr-rec", "thank-you"]
}

function stepShortLabel(id: StepId, fd: FD): string {
  const svcMap: Record<string, string> = { "media-day": "Media Day", sportraits: "Sportraits", "senior-portraits": "Senior" }
  switch (id) {
    case "who-are-you": return fd.role ? fd.role.charAt(0).toUpperCase() + fd.role.slice(1) : ""
    case "service-select": return fd.service ? svcMap[fd.service] ?? "" : ""
    case "md-sport": return fd.sport || ""
    case "md-roster": return fd.rosterSize ? `${fd.rosterSize} Athletes` : ""
    case "md-contact": case "sp-contact": case "sr-contact": case "sr-welcome": return fd.name || ""
    case "md-location": case "sp-location": case "sr-location": return fd.location || ""
    case "md-timeline": case "sp-timeline": case "sr-timeline": return fd.timeline || ""
    case "sp-sports": return fd.sports[0] ?? ""
    case "sr-session": return fd.sessionType || ""
    case "sr-vibe": return fd.vibes[0] ?? ""
    case "readiness": return fd.readiness === "ready" ? "Ready" : fd.readiness ? "Set" : ""
    case "md-frame": case "sp-frame": case "sr-frame": return "Vision"
    case "md-rec": case "sp-rec": case "sr-rec": return fd.packageName ? fd.packageName.split(" ")[0] : ""
    default: return ""
  }
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function H({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-heading text-white leading-tight text-center" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)" }}>
      {children}
    </h1>
  )
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-[#777] text-sm text-center mt-2 leading-relaxed max-w-sm mx-auto">{children}</p>
}

function Pill({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all cursor-pointer font-medium
        ${selected ? "border-[var(--ac-accent)] bg-[var(--ac-accent)]/10 text-white" : "border-[#2a2a2a] bg-[#111] text-[#bbb] hover:border-[var(--ac-accent)]/50"}`}
    >
      {label}
    </motion.button>
  )
}

function PkgCard({ pkg, recommended, selected, onSelect }: { pkg: Pkg; recommended?: boolean; selected?: boolean; onSelect: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className={`relative rounded-xl border p-5 cursor-pointer transition-all text-left bg-[#111]
        ${selected || recommended ? "border-[var(--ac-accent)]" : "border-[#2a2a2a] hover:border-[#444]"}`}
    >
      {recommended && (
        <span className="absolute top-3 right-3 text-[9px] uppercase tracking-widest text-[var(--ac-accent)] border border-[var(--ac-accent)]/50 rounded px-2 py-0.5">
          Recommended
        </span>
      )}
      {pkg.tag && !recommended && (
        <span className="absolute top-3 right-3 text-[9px] uppercase tracking-widest text-[#555] border border-[#2a2a2a] rounded px-2 py-0.5">
          {pkg.tag}
        </span>
      )}
      <p className="font-heading text-white text-lg pr-28">{pkg.name}</p>
      <p className="text-[var(--ac-accent)] font-heading text-2xl mt-0.5">{pkg.price}</p>
      <p className="text-[#666] text-xs mt-3 leading-relaxed">{pkg.desc}</p>
      <div className="mt-4 text-[10px] uppercase tracking-widest text-[#444] hover:text-[var(--ac-accent)] transition-colors">
        {selected ? <span className="text-[var(--ac-accent)]">✓ Selected</span> : "Select →"}
      </div>
    </motion.div>
  )
}

// ─── Sport Picker ─────────────────────────────────────────────────────────────

function SportPicker({ selected, onChange, multi = true }: { selected: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = SPORTS_LIST.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s))

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  const add = (s: string) => { onChange(multi ? [...selected, s] : [s]); setQuery(""); if (!multi) setOpen(false) }

  return (
    <div ref={ref} className="relative w-full">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--ac-accent)]/10 border border-[var(--ac-accent)]/30 text-[var(--ac-accent)] text-xs rounded-full">
              {s}
              <button onClick={() => onChange(selected.filter(x => x !== s))} className="hover:text-white">×</button>
            </span>
          ))}
        </div>
      )}
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={multi ? "Search and add sports…" : "Search a sport…"}
        className="w-full bg-transparent border-b border-[#2a2a2a] text-white text-sm py-3 outline-none placeholder:text-[#444] focus:border-[var(--ac-accent)] transition-colors"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute left-0 right-0 top-full mt-1 bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-auto z-20"
            style={{ maxHeight: 200 }}
          >
            {filtered.map(s => (
              <button key={s} onMouseDown={e => { e.preventDefault(); add(s) }}
                className="w-full text-left px-4 py-2.5 text-sm text-[#bbb] hover:bg-[#222] hover:text-white transition-colors">
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ path, idx, fd, onGoTo }: { path: StepId[]; idx: number; fd: FD; onGoTo: (i: number) => void }) {
  const visible = path.filter(s => s !== "thank-you")
  return (
    <div className="w-full mb-8">
      <div className="flex gap-1.5">
        {visible.map((id, i) => {
          const done = i < idx
          const active = i === idx
          const label = done ? stepShortLabel(id, fd) : ""
          return done ? (
            <button
              key={id}
              type="button"
              onClick={() => onGoTo(i)}
              title={`Back to ${id.replace(/-/g, " ")}`}
              aria-label={`Back to ${id.replace(/-/g, " ")}`}
              className="relative flex-1 h-7 rounded-md overflow-hidden transition-all duration-500 cursor-pointer hover:brightness-110"
              style={{ background: "var(--ac-accent)", border: "1px solid transparent" }}
            >
              {label && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold uppercase tracking-wider text-[#0d2224] truncate px-1">
                  {label}
                </span>
              )}
            </button>
          ) : (
            <div key={id} className="relative flex-1 h-7 rounded-md overflow-hidden transition-all duration-500"
              style={{
                background: active ? "rgba(127,184,190,0.12)" : "#181818",
                border: active ? "1px solid rgba(127,184,190,0.35)" : "1px solid transparent",
              }}
            />
          )
        })}
      </div>
      <p className="text-[10px] text-[#3a3a3a] mt-1 text-right">
        {Math.min(idx + 1, visible.length)} / {visible.length}
      </p>
    </div>
  )
}

// ─── Nav Buttons ──────────────────────────────────────────────────────────────

function Nav({ onBack, onNext, nextLabel = "Continue", nextDisabled = false, showBack = true }:
  { onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean; showBack?: boolean }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-6 py-5 z-40 pointer-events-none"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}>
      {showBack && onBack
        ? (
          <button onClick={onBack}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-[#555] border border-[#1e1e1e] hover:border-[#333] hover:text-[#888] transition-all uppercase tracking-widest bg-[#0a0a0a]">
            ← Back
          </button>
        )
        : <div />}
      {onNext && (
        <motion.button
          onClick={onNext}
          disabled={nextDisabled}
          whileHover={nextDisabled ? {} : { scale: 1.03 }}
          whileTap={nextDisabled ? {} : { scale: 0.97 }}
          className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all
            bg-[var(--ac-accent)] text-[#071314] hover:bg-[var(--ac-accent-hover)]
            disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(127,184,190,0.25)]"
        >
          {nextLabel} →
        </motion.button>
      )}
    </div>
  )
}

// ─── Contact form schema ───────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  org: z.string().optional(),
  notes: z.string().optional(),
})
type CF = z.infer<typeof contactSchema>

function ContactForm({ defaults, onDone, framing }: {
  defaults: Partial<CF>
  onDone: (d: CF) => void | Promise<void>
  framing: string
}) {
  const [pending, setPending] = useState(false)
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<CF>({
    resolver: zodResolver(contactSchema), defaultValues: defaults, mode: "onChange",
  })
  const cls = "w-full bg-transparent border-b border-[#2a2a2a] text-white text-sm py-3 outline-none placeholder:text-[#3a3a3a] focus:border-[var(--ac-accent)] transition-colors"
  const ta = "w-full mt-2 bg-[#111] border border-[#2a2a2a] rounded-xl text-white text-sm p-3 placeholder:text-[#3a3a3a] outline-none focus:border-[var(--ac-accent)] transition-colors resize-none min-h-[72px]"
  return (
    <form
      onSubmit={handleSubmit(async data => {
        setPending(true)
        try {
          await Promise.resolve(onDone(data))
        } finally {
          setPending(false)
        }
      })}
      className="flex flex-col gap-5 mt-6 text-left w-full"
    >
      <p className="text-[#555] text-xs text-center leading-relaxed">{framing}</p>
      <div>
        <input {...register("name")} placeholder="Full name *" className={cls} />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <input {...register("email")} type="email" placeholder="Email *" className={cls} />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <input {...register("phone")} type="tel" placeholder="Phone (optional)" className={cls} />
      <input {...register("org")} placeholder="School / team / org (optional)" className={cls} />
      <div>
        <label className="text-[#555] text-[10px] uppercase tracking-widest">Anything we should know? (optional)</label>
        <textarea {...register("notes")} placeholder="Short note, constraints, references, etc." className={ta} rows={2} />
      </div>
      <div className="flex justify-center">
        <button type="submit" disabled={!isValid || pending}
          className="mt-2 px-8 py-3 bg-[var(--ac-accent)] text-[#0d2224] font-heading rounded-lg text-sm disabled:opacity-30 hover:bg-[var(--ac-accent-hover)] transition-colors">
          {pending ? "Saving…" : "Continue →"}
        </button>
      </div>
    </form>
  )
}

// ─── Package rec display ───────────────────────────────────────────────────────

function PackageRec({ pkgs, recIdx, selected, onSelect, onNext, submitting }:
  { pkgs: Pkg[]; recIdx: number; selected: string; onSelect: (n: string) => void; onNext: () => void; submitting?: boolean }) {
  const rec = pkgs[recIdx]
  const others = pkgs.filter((_, i) => i !== recIdx)
  return (
    <div className="w-full">
      <H>Here&apos;s our recommendation.</H>
      <Sub>Based on what you told us. You know best though. All options are below.</Sub>
      <div className="mt-6">
        {rec && <PkgCard pkg={rec} recommended selected={selected === rec.name} onSelect={() => { onSelect(rec.name) }} />}
      </div>
      {others.length > 0 && (
        <>
          <p className="text-[#444] text-[10px] uppercase tracking-widest mt-6 mb-3">Other options</p>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {others.map(p => (
              <PkgCard key={p.name} pkg={p} selected={selected === p.name} onSelect={() => onSelect(p.name)} />
            ))}
          </div>
        </>
      )}
      <div className="flex justify-center mt-8">
        <button
          onClick={onNext}
          disabled={!selected || submitting}
          className="px-8 py-3 bg-[var(--ac-accent)] text-[#0d2224] font-heading rounded-lg text-sm disabled:opacity-30 hover:bg-[var(--ac-accent-hover)] transition-colors"
        >
          {submitting ? "Sending…" : "Get my quote →"}
        </button>
      </div>
    </div>
  )
}

// ─── Main Funnel ──────────────────────────────────────────────────────────────

type TyMeta = {
  ctaVariant: "schedule_first" | "warm_up"
  leadTier: "hot" | "warm" | "nurture"
  leadId: string
  magnetToken: string
}

export default function Funnel({ initialService }: { initialService?: string }) {
  const [fd, setFd] = useState<FD>({
    role: "", service: "", sport: "", rosterSize: 15, sports: [], vision: "",
    sessionType: "", sessionTypeNote: "", vibes: [], moodboard: "", name: "", email: "", phone: "", org: "",
    location: "", timeline: "", timelineNote: "", packageIntent: -1, packageName: "",
    readiness: "", notes: "",
  })
  const [stepIdx, setStepIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tyMeta, setTyMeta] = useState<TyMeta | null>(null)
  const [partialLeadId, setPartialLeadId] = useState<string>("")
  const appliedInitial = useRef(false)

  useEffect(() => {
    if (!initialService || appliedInitial.current) return
    const s = initialService as Service
    if (["media-day", "sportraits", "senior-portraits"].includes(s)) {
      setFd(p => ({ ...p, service: s }))
      appliedInitial.current = true
    }
  }, [initialService])

  const upd = <K extends keyof FD>(k: K, v: FD[K]) => setFd(p => ({ ...p, [k]: v }))
  const path = getPath(fd.role, fd.service, fd.rosterSize)
  const stepId = path[stepIdx] ?? "who-are-you"

  const goTo = useCallback((i: number, d = 1) => {
    setDir(d)
    setStepIdx(i)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [])
  const adv = useCallback(() => goTo(stepIdx + 1), [goTo, stepIdx])
  const bk = useCallback(() => goTo(stepIdx - 1, -1), [goTo, stepIdx])

  const computedMdPkgs = getMdPkgsForRoster(fd.rosterSize)
  const pkgs = fd.service === "media-day" ? computedMdPkgs : fd.service === "sportraits" ? SP_PKGS : SR_PKGS
  const frames = fd.service === "media-day" ? MD_FRAMES : fd.service === "sportraits" ? SP_FRAMES : SR_FRAMES
  const recIdx = frames[fd.packageIntent]?.pkgIdx ?? 0
  const isParent = fd.role === "parent"
  const timelines = stepId === "sr-timeline" ? SR_TIMELINES : TIMELINES
  const thankYouIdx = path.indexOf("thank-you")

  /** Awaits POST; only advances on success. On failure or bad JSON, stay on rec step — default ctaVariant warm_up if response unusable (no false calendar promise). */
  const finish = async (finalFd: FD) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalFd, partialLeadId }),
      })
      let data: {
        ok?: boolean
        ctaVariant?: string
        leadTier?: string
        leadId?: string
        magnetToken?: string
        error?: string
      } = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again or email us.")
        setSubmitting(false)
        return
      }
      const ctaVariant = data.ctaVariant === "schedule_first" ? "schedule_first" : "warm_up"
      const leadTier =
        data.leadTier === "hot" || data.leadTier === "warm" || data.leadTier === "nurture" ? data.leadTier : "warm"
      setTyMeta({
        ctaVariant,
        leadTier,
        leadId: typeof data.leadId === "string" ? data.leadId : "",
        magnetToken: typeof data.magnetToken === "string" ? data.magnetToken : "",
      })
      if (thankYouIdx !== -1) goTo(thankYouIdx)
    } catch {
      setSubmitError("Network error. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (stepId) {

      // ── Who are you? ─────────────────────────────────────────────────────────
      case "who-are-you":
        return (
          <>
            <H>Who&apos;s reaching out?</H>
            <div className="grid grid-cols-2 gap-3 mt-8">
              {ROLES.map(r => (
                <Pill key={r.id} label={r.label} selected={fd.role === r.id} onClick={() => {
                  const svc = ROLE_SERVICES[r.id]
                  setFd(p => ({ ...p, role: r.id, service: svc.includes(p.service as Service) ? p.service : "" }))
                  setTimeout(adv, 200)
                }} />
              ))}
            </div>
            <Nav onBack={undefined} showBack={false} onNext={fd.role ? adv : undefined} nextDisabled={!fd.role} />
          </>
        )

      // ── Service select ────────────────────────────────────────────────────────
      case "service-select": {
        const avail = fd.role ? ROLE_SERVICES[fd.role] : (["media-day", "sportraits", "senior-portraits"] as Service[])
        const svcs = SERVICES.filter(s => avail.includes(s.id))
        const blurbs: Record<string, string> = {
          "media-day": "Full team shoot for athletes, coaches, and program identity.",
          "sportraits": "Individual athlete portraits with cinematic lighting.",
          "senior-portraits": "Your senior year, shot like a production.",
        }
        return (
          <>
            <H>What are we creating?</H>
            <div className="flex flex-col gap-3 mt-8">
              {svcs.map(s => (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => { upd("service", s.id); setTimeout(adv, 200) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all cursor-pointer flex items-center gap-4
                    ${fd.service === s.id
                      ? "border-[var(--ac-accent)] bg-[var(--ac-accent)]/10"
                      : "border-[#2a2a2a] bg-[#111] hover:border-[var(--ac-accent)]/50"}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#2a2a2a]">
                    <img src={s.img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{s.label}</p>
                    <p className="text-[#666] text-xs mt-0.5">{blurbs[s.id]}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <Nav onBack={bk} showBack={stepIdx > 0} />
          </>
        )
      }

      // ── MD: Sport / program ───────────────────────────────────────────────────
      case "md-sport":
        return (
          <>
            <H>What sport or program?</H>
            <Sub>Tell us who&apos;s getting photographed.</Sub>
            <div className="mt-8">
              <SportPicker selected={fd.sport ? [fd.sport] : []} multi={false} onChange={v => upd("sport", v[0] ?? "")} />
            </div>
            <Nav onBack={bk} onNext={fd.sport ? adv : undefined} nextDisabled={!fd.sport} />
          </>
        )

      // ── MD: Roster size ───────────────────────────────────────────────────────
      case "md-roster":
        return (
          <>
            <H>How big is your roster?</H>
            <Sub>This helps us dial in the right package and pricing for your team.</Sub>
            <div className="max-w-sm mx-auto mt-10">
              <Slider value={[fd.rosterSize]} min={1} max={60} onValueChange={v => upd("rosterSize", v[0])}
                className="[&>[data-slot=slider-track]]:bg-[#2a2a2a] [&>[data-slot=slider-range]]:bg-[var(--ac-accent)] [&>[data-slot=slider-thumb]]:bg-[var(--ac-accent)]" />
              <div className="flex justify-between mt-3 text-[10px] text-[#444]">
                <span>1</span><span>30</span><span>60+</span>
              </div>
              <p className="text-center mt-4 text-[var(--ac-accent)] font-heading text-2xl">{fd.rosterSize} athletes</p>
            </div>
            <Nav onBack={bk} onNext={adv} />
          </>
        )

      // md-contact is now handled by the unified contact case below

      // ── MD / SP / SR: Location (text + quick picks, no Places API) ─────────────
      case "md-location": case "sp-location": case "sr-location": {
        const warn = locationLooksOutsideNyPa(fd.location)
        return (
          <>
            <H>Where are you based?</H>
            <Sub>We primarily work in New York and Pennsylvania. Type your city or pick one below.</Sub>
            <input
              type="text"
              value={fd.location}
              onChange={e => upd("location", e.target.value)}
              placeholder="City, State (e.g. Elmira, NY)"
              className="w-full mt-6 bg-[#111] border border-[#2a2a2a] rounded-xl text-white text-sm px-4 py-3 placeholder:text-[#3a3a3a] outline-none focus:border-[var(--ac-accent)]"
            />
            <p className="text-[10px] text-[#444] mt-4 uppercase tracking-wider">Common areas</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {LOCATION_QUICK_PICKS.filter(q => q.value).map(q => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => upd("location", q.value)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-colors ${fd.location === q.value ? "border-[var(--ac-accent)] text-white bg-[var(--ac-accent)]/10" : "border-[#2a2a2a] text-[#888] hover:border-[#444]"}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            {warn && (
              <p className="text-amber-200/90 text-xs mt-4 text-center leading-relaxed max-w-md mx-auto">
                Heads up: we&apos;re mainly in NY and PA. We can still talk. Cole will confirm whether travel works.
              </p>
            )}
            <Nav onBack={bk} onNext={fd.location.trim() ? adv : undefined} nextDisabled={!fd.location.trim()} />
          </>
        )
      }

      // ── Readiness (all services) ───────────────────────────────────────────────
      case "readiness":
        return (
          <>
            <H>Where are things at on your end?</H>
            <Sub>No wrong answers. This just helps Cole know how to follow up.</Sub>
            <div className="flex flex-col gap-3 mt-8">
              {READINESS_OPTIONS.map(o => (
                <Pill key={o.id} label={o.label} selected={fd.readiness === o.id} onClick={() => { upd("readiness", o.id); setTimeout(adv, 250) }} />
              ))}
            </div>
            <Nav onBack={bk} onNext={fd.readiness ? adv : undefined} nextDisabled={!fd.readiness} />
          </>
        )

      // ── MD / SP / SR: Timeline ────────────────────────────────────────────────
      case "md-timeline": case "sp-timeline": case "sr-timeline": {
        const isOpen = fd.timeline === "No set date yet"
        return (
          <>
            <H>When are you thinking?</H>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
              {timelines.map(t => (
                <Pill key={t} label={t} selected={fd.timeline === t} onClick={() => upd("timeline", t)} />
              ))}
            </div>
            {fd.timeline && (
              <div className="mt-5">
                <textarea
                  value={fd.timelineNote}
                  onChange={e => upd("timelineNote", e.target.value)}
                  placeholder={isOpen ? "Tell us more, like after graduation in June, or after the season ends..." : "Any other timing details? (optional)"}
                  rows={isOpen ? 3 : 2}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl text-white text-sm p-4 placeholder:text-[#3a3a3a] outline-none focus:border-[var(--ac-accent)] transition-colors resize-none"
                />
              </div>
            )}
            <Nav onBack={bk} onNext={fd.timeline ? adv : undefined} nextDisabled={!fd.timeline} />
          </>
        )
      }

      // ── MD / SP / SR: Package framing ─────────────────────────────────────────
      case "md-frame": case "sp-frame": case "sr-frame": {
        const isSr = fd.service === "senior-portraits"
        return (
          <>
            <H>{isSr ? "What kind of session sounds like you?" : "What matters most to you?"}</H>
            <Sub>
              {isSr
                ? "This shapes how we build the whole day, not just which package."
                : "Pick the one that fits. We build from there."}
            </Sub>
            <div className="flex flex-col gap-3 mt-8">
              {frames.map((f, i) => (
                <motion.div
                  key={i}
                  onClick={() => upd("packageIntent", i)}
                  whileHover={{ scale: 1.01 }}
                  className={`rounded-xl border p-5 cursor-pointer transition-all text-left
                    ${fd.packageIntent === i ? "border-[var(--ac-accent)] bg-[var(--ac-accent)]/8" : "border-[#2a2a2a] bg-[#111] hover:border-[#444]"}`}
                >
                  <p className="font-heading text-white text-base">{f.label}</p>
                  <p className="text-[#666] text-xs mt-1.5 leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </div>
            <Nav onBack={bk} onNext={fd.packageIntent >= 0 ? adv : undefined} nextDisabled={fd.packageIntent < 0} />
          </>
        )
      }

      // ── MD / SP / SR: Package rec ─────────────────────────────────────────────
      case "md-rec": case "sp-rec": case "sr-rec":
        return (
          <>
            <PackageRec
              pkgs={pkgs}
              recIdx={recIdx}
              selected={fd.packageName}
              onSelect={n => upd("packageName", n)}
              onNext={() => { void finish({ ...fd }) }}
              submitting={submitting}
            />
            {submitError && <p className="text-red-400 text-xs text-center mt-4 max-w-sm mx-auto">{submitError}</p>}
            <Nav onBack={bk} />
          </>
        )

      // ── Final contact (all paths) ─────────────────────────────────────────────
      case "md-contact": case "sp-contact": case "sr-contact": {
        const svcLabel = fd.service === "media-day" ? "Media Day" : fd.service === "sportraits" ? "Sportraits" : "Senior Portraits"
        return (
          <>
            <div className="text-center mb-2">
              <span className="text-[var(--ac-accent)] text-[11px] uppercase tracking-widest">{svcLabel}</span>
            </div>
            <H>Almost there.</H>
            <ContactForm
              defaults={{ name: fd.name, email: fd.email, phone: fd.phone, org: fd.org, notes: fd.notes }}
              framing="Drop your info and Cole will be in touch."
              onDone={async d => {
                const updated = { ...fd, ...d }
                setFd(p => ({ ...p, ...d }))
                try {
                  const r = await fetch("/api/book/partial", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...updated, partialLeadId }),
                  })
                  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; leadId?: string }
                  if (typeof j.leadId === "string" && j.leadId) setPartialLeadId(j.leadId)
                } catch {
                  /* final /api/book submit still inserts or updates */
                }
                adv()
              }}
            />
            <Nav onBack={bk} showBack />
          </>
        )
      }

      // ── MD: Custom quote (large rosters) ─────────────────────────────────────
      case "md-custom-quote":
        return (
          <>
            <H>This one needs a custom quote.</H>
            <Sub>Rosters over 35 athletes are priced individually. We will put together a full breakdown based on your team size, shoot goals, and timeline.</Sub>
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 mt-8 text-left">
              <p className="text-[#555] text-xs uppercase tracking-widest mb-3">What you submitted</p>
              {fd.sport && <Row label="Sport" val={fd.sport} />}
              <Row label="Roster size" val={`${fd.rosterSize} athletes`} />
              {fd.location && <Row label="Location" val={fd.location} />}
              {fd.timeline && <Row label="Timeline" val={fd.timeline + (fd.timelineNote ? ` (${fd.timelineNote})` : "")} />}
              {fd.name && <Row label="Name" val={fd.name} />}
              {fd.email && <Row label="Email" val={fd.email} />}
            </div>
            <div className="flex justify-center mt-8">
              <button
                onClick={() => { void finish({ ...fd }) }}
                disabled={submitting}
                className="px-8 py-3 bg-[var(--ac-accent)] text-[#0d2224] font-heading rounded-lg text-sm disabled:opacity-30 hover:bg-[var(--ac-accent-hover)] transition-colors"
              >
                {submitting ? "Sending..." : "Send my info to Cole"}
              </button>
            </div>
            {submitError && <p className="text-red-400 text-xs text-center mt-4">{submitError}</p>}
            <Nav onBack={bk} />
          </>
        )

      // ── SP: Sports picker ─────────────────────────────────────────────────────
      case "sp-sports":
        return (
          <>
            <H>{isParent ? "What sport does your athlete play?" : "What sport do you play?"}</H>
            <Sub>Select as many as apply.</Sub>
            <div className="mt-8">
              <SportPicker selected={fd.sports} onChange={v => upd("sports", v)} />
            </div>
            <Nav onBack={bk} onNext={fd.sports.length ? adv : undefined} nextDisabled={!fd.sports.length} />
          </>
        )

      // sp-contact is now handled by the unified contact case below

      // ── SR: Welcome ──────────────────────────────────────────────────────────
      case "sr-welcome":
        return (
          <>
            <div className="text-center mb-2">
              <span className="text-[var(--ac-accent)] text-[11px] uppercase tracking-widest">Senior Portraits</span>
            </div>
            <H>
              {isParent
                ? "This is your senior's year. Let's make sure the photos look like them."
                : "This is your senior year. Let's make sure the photos actually look like you."}
            </H>
            <Sub>
              {isParent
                ? "No backdrops. No forcing a pose. We build the whole session around who your senior actually is."
                : "No backdrops, no forced poses. Every shot is built around you."}
            </Sub>
            <Nav onBack={bk} showBack={stepIdx > 0} onNext={adv} nextLabel="Let's do this" />
          </>
        )

      // ── SR: Session type ──────────────────────────────────────────────────────
      case "sr-session":
        return (
          <>
            <H>{isParent ? "What kind of setting feels right for your senior?" : "What kind of setting feels right for you?"}</H>
            <Sub>Starting point only. We figure out the details together.</Sub>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
              {SESSION_TYPES.map(s => (
                <Pill key={s} label={s} selected={fd.sessionType === s} onClick={() => { upd("sessionType", s); if (s !== "Other") upd("sessionTypeNote", "") }} />
              ))}
            </div>
            {fd.sessionType === "Other" && (
              <div className="mt-4">
                <textarea
                  value={fd.sessionTypeNote}
                  onChange={e => upd("sessionTypeNote", e.target.value)}
                  placeholder="Tell us what you have in mind..."
                  rows={3}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl text-white text-sm p-4 placeholder:text-[#3a3a3a] outline-none focus:border-[var(--ac-accent)] transition-colors resize-none"
                />
              </div>
            )}
            <Nav onBack={bk} onNext={fd.sessionType && (fd.sessionType !== "Other" || fd.sessionTypeNote.trim()) ? adv : undefined} nextDisabled={!fd.sessionType || (fd.sessionType === "Other" && !fd.sessionTypeNote.trim())} />
          </>
        )

      // ── SR: Vibe ──────────────────────────────────────────────────────────────
      case "sr-vibe":
        return (
          <>
            <H>{isParent ? "What is your senior's vibe?" : "What is your vibe?"}</H>
            <Sub>Pick everything that fits. Most people are more than one thing.</Sub>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
              {VIBES.map(v => (
                <Pill key={v} label={v} selected={fd.vibes.includes(v)}
                  onClick={() => upd("vibes", fd.vibes.includes(v) ? fd.vibes.filter(x => x !== v) : [...fd.vibes, v])} />
              ))}
            </div>
            <Nav onBack={bk} onNext={fd.vibes.length ? adv : undefined} nextDisabled={!fd.vibes.length} />
          </>
        )

      // ── Thank you ─────────────────────────────────────────────────────────────
      case "thank-you": {
        const cta = tyMeta?.ctaVariant ?? "warm_up"
        const tier = tyMeta?.leadTier ?? "warm"
        const scheduleHref = process.env.NEXT_PUBLIC_SCHEDULE_URL?.trim() || "/schedule"
        const magnetHref =
          tyMeta?.leadId && tyMeta?.magnetToken
            ? `/resources/welcome-pack?l=${encodeURIComponent(tyMeta.leadId)}&t=${encodeURIComponent(tyMeta.magnetToken)}`
            : "/resources/welcome-pack"
        const warmNurtureBlurb =
          tier === "nurture"
            ? "Thanks for raising your hand. Cole will follow up within one business day — check your inbox (and spam). While you’re deciding, the welcome guide below answers the questions people ask first."
            : "Thanks for the details — Cole will follow up within one business day. Check your inbox (and spam). The welcome guide below is there if you want a head start before you hear from him."
        return (
          <div className="text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
              <p className="text-[var(--ac-accent)] text-[11px] uppercase tracking-widest mb-4">You&apos;re all set</p>
              <h1 className="font-heading text-white" style={{ fontSize: "clamp(3rem, 10vw, 5rem)" }}>We got you.</h1>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-[#666] text-sm mt-3 max-w-md mx-auto leading-relaxed">
              {cta === "schedule_first"
                ? "Cole will confirm details soon. Lock a time now if you want momentum on the calendar."
                : warmNurtureBlurb}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 mt-8 max-w-sm mx-auto text-left">
              {fd.name && <Row label="Name" val={fd.name} />}
              {fd.email && <Row label="Email" val={fd.email} />}
              {fd.service && <Row label="Session" val={{ "media-day": "Media Day", sportraits: "Sportraits", "senior-portraits": "Senior Portraits" }[fd.service] ?? ""} />}
              {fd.packageName && <Row label="Package" val={fd.packageName} />}
              {fd.location && <Row label="Location" val={fd.location} />}
              {fd.timeline && <Row label="Timeline" val={fd.timeline} />}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-col items-center gap-4 mt-8">
              {cta === "schedule_first" ? (
                <Link
                  href={scheduleHref}
                  className="inline-block px-8 py-3 bg-[var(--ac-accent)] text-[#0d2224] font-heading rounded-lg text-sm hover:bg-[var(--ac-accent-hover)] transition-colors shadow-[0_0_20px_rgba(127,184,190,0.25)]"
                >
                  Book a quick call →
                </Link>
              ) : (
                <Link
                  href={magnetHref}
                  className="inline-block px-8 py-3 bg-[var(--ac-accent)] text-[#0d2224] font-heading rounded-lg text-sm hover:bg-[var(--ac-accent-hover)] transition-colors shadow-[0_0_20px_rgba(127,184,190,0.25)]"
                >
                  View your welcome guide →
                </Link>
              )}
              <div className="flex flex-wrap justify-center gap-4 text-xs uppercase tracking-widest text-[#555]">
                <a href="https://instagram.com/a_c.media" className="hover:text-[var(--ac-accent)] transition-colors">Instagram</a>
                <Link href="/work" className="hover:text-[var(--ac-accent)] transition-colors">Our work</Link>
              </div>
              {cta === "warm_up" && tier === "nurture" && (
                <p className="text-[#555] text-xs mt-6 max-w-sm mx-auto">
                  Prefer to talk now?{" "}
                  <Link href={scheduleHref} className="text-[#888] hover:text-[var(--ac-accent)] underline underline-offset-2">
                    Open scheduling
                  </Link>
                </p>
              )}
            </motion.div>
          </div>
        )
      }

      default:
        return null
    }
  }

  const isThankYou = stepId === "thank-you"

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      {!isThankYou && <ProgressBar path={path} idx={stepIdx} fd={fd} onGoTo={i => goTo(i, -1)} />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepId}
          initial={{ x: dir * 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir * -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#1e1e1e] last:border-0">
      <span className="text-[#555] text-xs">{label}</span>
      <span className="text-white text-xs font-medium text-right max-w-[60%] truncate">{val}</span>
    </div>
  )
}
