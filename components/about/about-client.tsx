"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import gsap from "gsap"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AboutNowSlide } from "@/components/about/about-now-slide"
import { AboutScrollStack } from "@/components/about/about-scroll-stack"
import { BeliefsBentoPartA, BeliefsBentoPartB } from "@/components/about/beliefs-bento"
import { profileAsset, pillMilestones, collagePhotos, circlePortrait } from "@/lib/about-media"

const nowSlideHeadline = "Now, every shoot is built around you"

const nowSlideParagraphs = [
  "Now, every shoot is built around the athlete. I'm not just showing up to take pictures. I'm there to build something with you. The camera is only part of it; the rest is how we run the day, read the room, and keep the bar high without making you perform for it.",
  "I'm creating an environment where athletes can express who they are, with lighting, atmosphere, and direction that actually brings that out. We slow down when you need breath, push when you want edge, and keep the set honest so the frames feel like you. Not a version of you stitched together in post.",
  "The goal is always the same: to create something that feels real, something you're proud of, not just something that looks good. Those images are going to follow your career. I treat them that way from the first frame to the last.",
]

const beliefs = [
  {
    label: "Athlete first",
    title: "The athlete comes first.",
    body: "Every decision, from the lighting to the direction, is made around you. Not the other way around.",
  },
  {
    label: "Raw frame",
    title: "Authenticity over polish.",
    body: "The best sports portraits aren't the most perfect ones. They're the ones that feel real.",
  },
  {
    label: "On set",
    title: "Confidence is built on the set.",
    body: "The environment matters. We create a space where you can relax, push, and become the subject.",
  },
  {
    label: "Built to last",
    title: "The image should last.",
    body: "These photos will follow your career. We build them to hold up.",
  },
]

const glassPanelClass =
  "rounded-[2.5rem] border border-white/20 bg-[#0f0f0f]/80 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]"

const eyebrowClass =
  "mb-5 block text-[0.7rem] font-medium uppercase tracking-[0.3em] text-[var(--ac-accent-mid)]"

/** Stagger for mobile fallback entrance animations */
const mobileCard = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const mobileItem = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.165, 0.84, 0.44, 1] } },
}

export default function AboutClient() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroImgRef = useRef<HTMLDivElement>(null)
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null)


  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroImgRef.current) {
        gsap.from(heroImgRef.current, {
          scale: 1.08,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
        })
      }
      if (heroHeadlineRef.current) {
        gsap.fromTo(
          heroHeadlineRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 1,
            ease: "power3.out",
            delay: 0.55,
          }
        )
      }
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const collageLayout = [
    { i: 0, className: "left-[2%] top-[4%] z-10 w-[28%] -rotate-[11deg]" },
    { i: 1, className: "right-[4%] top-[2%] z-20 w-[26%] rotate-[9deg]" },
    { i: 2, className: "left-1/2 top-1/2 z-30 w-[42%] -translate-x-1/2 -translate-y-1/2 rotate-0 scale-[1.08]" },
    { i: 3, className: "left-[6%] bottom-[6%] z-20 w-[30%] rotate-[7deg]" },
    { i: 4, className: "right-[2%] bottom-[8%] z-10 w-[28%] -rotate-[8deg]" },
  ] as const

  return (
    <div ref={containerRef} className="bg-[var(--ac-bg)]">
      {/* Hero */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-16 pt-8 md:pb-24"
        style={{ background: "var(--ac-bg)" }}
      >
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
          <div
            ref={heroImgRef}
            className="mx-auto mb-8 md:mb-10"
            style={{ width: "clamp(280px, 48vw, 560px)" }}
          >
            <Image
              src={profileAsset.src}
              alt={profileAsset.alt}
              width={600}
              height={400}
              className="h-auto w-full object-contain"
              unoptimized
              priority
            />
          </div>
          <h1
            ref={heroHeadlineRef}
            className="max-w-[700px] text-center font-heading text-[var(--ac-text)]"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              clipPath: "inset(0 100% 0 0)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Every athlete has a story worth telling.
          </h1>

          <Card className={cn(glassPanelClass, "mt-12 w-full max-w-3xl py-10 shadow-none ring-0 md:mt-16 md:py-14")}>
            <CardContent className="flex flex-row flex-wrap justify-center gap-x-10 gap-y-8 px-4 md:gap-x-16">
              {[
                { number: "70+", label: "media days led" },
                { number: "150+", label: "sporting events" },
                { number: "30+", label: "senior sessions" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center text-center">
                  <span
                    className="font-heading leading-none text-[var(--ac-text)]"
                    style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}
                  >
                    {stat.number}
                  </span>
                  <span className="mt-2 text-[0.7rem] uppercase tracking-[0.25em] text-[var(--ac-text-muted)]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center md:bottom-10">
          <motion.span
            className="select-none text-2xl text-[var(--ac-text-muted)]"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓
          </motion.span>
        </div>
      </section>

      {/* Pinned scroll stack */}
      <AboutScrollStack>

        {/* Slide 1: The Beginning */}
        <div className="flex h-full w-full items-center justify-center px-2 sm:px-4 md:px-8">
          <div className={cn(glassPanelClass, "flex w-full max-w-6xl flex-col gap-8 p-6 sm:p-8 md:p-12 lg:flex-row lg:items-center lg:gap-16")}>
            <div className="flex flex-1 flex-col justify-center">
              <span className={eyebrowClass}>The beginning</span>
              <h2 className="mb-6 font-heading text-4xl leading-tight text-[var(--ac-text)] md:text-5xl lg:text-6xl">
                Obsession over a business plan.
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-[#D4D0CA] md:text-lg">
                It started on the sidelines in 7th grade, capturing real moments. No strategy. Just an obsession to make every single frame better than the last.
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-3 md:gap-4 lg:max-w-[45%]">
              {pillMilestones.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-4 rounded-full border border-white/20 bg-[#0f0f0f]/80 p-2 pe-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] backdrop-blur-2xl md:pe-8"
                >
                  <Avatar className="size-14 shrink-0 border-2 border-transparent md:size-16">
                    <AvatarImage src={row.thumb.src} alt={row.thumb.alt} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white/50">CW</AvatarFallback>
                  </Avatar>
                  <span className="font-heading text-base text-[var(--ac-text)] md:text-lg">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide 2: The Work */}
        <div className="flex h-full w-full items-center justify-center px-2 sm:px-4 md:px-8">
          <div className={cn(glassPanelClass, "flex w-full max-w-6xl flex-col-reverse gap-10 p-6 sm:p-8 md:p-12 lg:flex-row lg:items-center lg:gap-16")}>
            <div className="relative mx-auto aspect-[4/3] w-full min-h-[240px] max-w-lg md:aspect-[5/4] md:max-w-xl lg:mx-0 lg:flex-1">
              {collageLayout.map(({ i, className }) => {
                const photo = collagePhotos[i]
                return (
                  <motion.div
                    key={photo.src}
                    className={cn(
                      "absolute overflow-hidden rounded-2xl border border-white/20 bg-[#0f0f0f]/80 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
                      className
                    )}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={480}
                      height={720}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </motion.div>
                )
              })}
            </div>
            <div className="flex flex-1 flex-col justify-center lg:max-w-[45%]">
              <span className={eyebrowClass}>The work</span>
              <h2 className="mb-6 font-heading text-4xl leading-tight text-[var(--ac-text)] md:text-5xl lg:text-6xl">
                I found my edge.
              </h2>
              <p className="text-base leading-relaxed text-[#D4D0CA] md:text-lg">
                150+ sporting events and 30+ senior sessions later, I found my true edge. Today, after leading 70+ media days, A.C Media is built on one standard: creating images that go far beyond standard photos.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 3: Beliefs Part A */}
        <div className="flex h-full w-full items-center justify-center px-2 sm:px-4 md:px-8">
          <div className="w-full max-w-6xl">
            <BeliefsBentoPartA beliefs={beliefs} motionMode="static" />
          </div>
        </div>

        {/* Slide 4: Beliefs Part B */}
        <div className="flex h-full w-full items-center justify-center px-2 sm:px-4 md:px-8">
          <div className="w-full max-w-6xl">
            <BeliefsBentoPartB beliefs={beliefs} motionMode="static" />
          </div>
        </div>

        {/* Slide 5: Now */}
        <div className="flex h-full w-full items-center justify-center px-2 sm:px-4 md:px-8">
          <div className={cn(glassPanelClass, "w-full max-w-6xl overflow-hidden")}>
            <AboutNowSlide
              headline={nowSlideHeadline}
              paragraphs={nowSlideParagraphs}
              primaryPhoto={circlePortrait}
              secondaryPhoto={collagePhotos[1]!}
            />
          </div>
        </div>

      </AboutScrollStack>

      {/* Footer CTA — appears after pinned section exits */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <motion.div
          className="mt-4 w-full border-t border-[var(--ac-divider)] px-2 pb-10 pt-12 text-center md:mt-6 md:pb-12 md:pt-14"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.165, 0.84, 0.44, 1] }}
        >
          <h2
            className="mb-8 font-heading leading-none text-[var(--ac-text)] md:mb-10"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            Ready to build your image?
          </h2>
          <Button asChild size="lg" className="rounded-lg px-10 py-6 text-base">
            <Link href="/book">Book a shoot →</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
