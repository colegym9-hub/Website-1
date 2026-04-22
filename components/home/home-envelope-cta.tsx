"use client"

import React, { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"
import type { HomeEnvelopeContent } from "@/lib/site-content-schema"
import { DEFAULT_HOME_ENVELOPE } from "@/lib/site-content-defaults"
import styles from "./home-envelope-cta.module.css"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type Errors = Partial<Record<"name" | "email" | "message", string>>
type Phase = "closed" | "open" | "sealing" | "sealed"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function AutoSizeInput(props: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholderWidth: string
  type?: "text" | "email" | "tel"
  inputMode?: "text" | "email" | "tel"
  autoComplete?: string
  invalid?: boolean
  disabled?: boolean
  ariaLabel: string
}) {
  const { id, value, onChange, placeholderWidth, type = "text", inputMode, autoComplete, invalid, disabled, ariaLabel } = props
  const style = value.length === 0 ? { width: placeholderWidth } : undefined
  return (
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={cn(styles.blank, invalid && styles.blankInvalid)}
      style={style}
      size={Math.max(value.length, 1)}
    />
  )
}

export default function HomeEnvelopeCta({ content }: { content?: HomeEnvelopeContent }) {
  const c = content ?? DEFAULT_HOME_ENVELOPE

  const sectionRef = useRef<HTMLElement | null>(null)
  const envelopeRef = useRef<HTMLDivElement | null>(null)
  const flapRef = useRef<HTMLDivElement | null>(null)
  const waxRef = useRef<HTMLDivElement | null>(null)
  const stampRef = useRef<HTMLDivElement | null>(null)
  const letterRef = useRef<HTMLDivElement | null>(null)
  const letterContentRef = useRef<HTMLDivElement | null>(null)
  const successRef = useRef<HTMLDivElement | null>(null)
  const hasInitRef = useRef(false)
  const hasOpenedRef = useRef(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [phase, setPhase] = useState<Phase>("closed")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (hasInitRef.current) return
    if (!flapRef.current || !waxRef.current || !letterRef.current || !letterContentRef.current || !stampRef.current || !sectionRef.current) {
      return
    }
    hasInitRef.current = true

    gsap.set(flapRef.current, { rotationX: 0, transformOrigin: "top center" })
    gsap.set(waxRef.current, { scale: 1, opacity: 1 })
    gsap.set(letterRef.current, { y: 40, opacity: 0, scale: 0.96 })
    gsap.set(letterContentRef.current, { opacity: 0, y: 10 })
    gsap.set(stampRef.current, { opacity: 0, scale: 1.4 })

    const reduced = prefersReducedMotion()
    if (reduced) {
      gsap.set(flapRef.current, { rotationX: -170 })
      gsap.set(waxRef.current, { scale: 0, opacity: 0 })
      gsap.set(letterRef.current, { y: 0, opacity: 1, scale: 1 })
      gsap.set(letterContentRef.current, { opacity: 1, y: 0 })
      hasOpenedRef.current = true
      setPhase("open")
      return
    }

    const openEnvelope = () => {
      if (hasOpenedRef.current) return
      hasOpenedRef.current = true
      const tl = gsap.timeline({ onComplete: () => setPhase("open") })
      tl.to(waxRef.current, { scale: 0, opacity: 0, duration: 0.35, ease: "power2.in" }, 0)
      tl.to(flapRef.current, { rotationX: -170, duration: 0.75, ease: "power2.inOut" }, 0.1)
      tl.to(letterRef.current, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.4)
      tl.to(letterContentRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.85)
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 85%",
      once: true,
      onEnter: openEnvelope,
    })

    const isVisible = () => {
      if (!sectionRef.current) return false
      const rect = sectionRef.current.getBoundingClientRect()
      return rect.top < window.innerHeight * 0.85 && rect.bottom > 0
    }
    if (isVisible()) openEnvelope()

    return () => {
      st.kill()
    }
  }, [])

  function validate(): Errors {
    const e: Errors = {}
    if (!name.trim()) e.name = c.errorTextName
    if (!email.trim()) e.email = c.errorTextEmail
    else if (!EMAIL_RE.test(email.trim())) e.email = c.errorTextEmail
    if (!message.trim()) e.message = c.errorTextMessage
    return e
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          service: "home-inline",
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        setErrors({ email: json.error ?? c.errorTextGeneric })
        setSubmitting(false)
        return
      }
      playSealAnimation()
    } catch {
      setErrors({ email: c.errorTextGeneric })
      setSubmitting(false)
    }
  }

  function playSealAnimation() {
    setPhase("sealing")
    const reduced = prefersReducedMotion()
    if (reduced) {
      setPhase("sealed")
      setSubmitting(false)
      return
    }
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("sealed")
        setSubmitting(false)
      },
    })
    if (letterContentRef.current) {
      tl.to(letterContentRef.current, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, 0)
    }
    if (letterRef.current) {
      tl.to(letterRef.current, { y: 40, opacity: 0, scale: 0.96, duration: 0.5, ease: "power2.in" }, 0.15)
    }
    if (flapRef.current) {
      tl.to(flapRef.current, { rotationX: 0, duration: 0.55, ease: "power2.inOut" }, 0.4)
    }
    if (stampRef.current) {
      tl.to(stampRef.current, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.9)
    }
    if (successRef.current) {
      tl.to(successRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 1.05)
    }
  }

  const interactive = phase === "open" && !submitting

  return (
    <section
      ref={sectionRef}
      data-section="envelope-cta"
      className={styles.section}
      aria-labelledby="envelope-cta-headline"
    >
      <div className={cn(styles.ambientOrb, styles.orbLeft)} aria-hidden />
      <div className={cn(styles.ambientOrb, styles.orbRight)} aria-hidden />

      <div className={styles.header}>
        <h2 id="envelope-cta-headline" className={styles.headline}>
          {c.headline}
        </h2>
        <p className={styles.subhead}>{c.subhead}</p>
      </div>

      <div className={styles.envelopeWrap}>
        <div
          ref={letterRef}
          className={styles.letter}
          aria-hidden={phase === "closed" || phase === "sealed"}
        >
          <form
            ref={letterContentRef}
            onSubmit={handleSubmit}
            className={styles.letterContent}
            noValidate
          >
            <p className={styles.salutation}>{c.salutation}</p>

            <p className={styles.prose}>
              <span>{c.nameLeadIn} </span>
              <AutoSizeInput
                id="envelope-name"
                value={name}
                onChange={setName}
                placeholderWidth="8ch"
                autoComplete="name"
                invalid={!!errors.name}
                disabled={!interactive}
                ariaLabel="Name"
              />
              <span>, {c.wantLeadIn} </span>
              <AutoSizeInput
                id="envelope-message"
                value={message}
                onChange={setMessage}
                placeholderWidth="16ch"
                invalid={!!errors.message}
                disabled={!interactive}
                ariaLabel="Message"
              />
              <span>.</span>
            </p>

            <p className={styles.prose}>
              <span>{c.emailLeadIn} </span>
              <AutoSizeInput
                id="envelope-email"
                value={email}
                onChange={setEmail}
                placeholderWidth="12ch"
                type="email"
                inputMode="email"
                autoComplete="email"
                invalid={!!errors.email}
                disabled={!interactive}
                ariaLabel="Email"
              />
              <span>.</span>
            </p>

            <p className={styles.prose}>
              <span>{c.phoneLeadIn} </span>
              <AutoSizeInput
                id="envelope-phone"
                value={phone}
                onChange={setPhone}
                placeholderWidth="10ch"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                disabled={!interactive}
                ariaLabel="Phone (optional)"
              />
              <span className={styles.optional}> ({c.phoneOptionalLabel})</span>
              <span>.</span>
            </p>

            {errors.name || errors.email || errors.message ? (
              <p className={styles.errorNote} role="alert">
                {errors.name || errors.email || errors.message}
              </p>
            ) : null}

            <div className={styles.submitRow}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!interactive}
              >
                {submitting ? c.submittingLabel : c.submitLabel} <span aria-hidden>→</span>
              </button>
            </div>
          </form>

          <div
            ref={successRef}
            className={styles.successText}
            aria-live="polite"
          >
            {c.successText}
          </div>
        </div>

        <div ref={envelopeRef} className={styles.envelope}>
          <div className={styles.envelopeBody}>
            <div className={styles.toLine}>{c.envelopeTo}</div>
            <div className={styles.pocketShadow} aria-hidden />
          </div>
          <div ref={flapRef} className={styles.flap} aria-hidden />
          <div ref={waxRef} className={styles.wax} aria-hidden />
          <div ref={stampRef} className={styles.stamp} aria-hidden>
            <img
              src={c.wordmarkUrl}
              alt=""
              className={styles.stampImg}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
