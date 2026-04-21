"use client";

import React from "react"
import Link from "next/link"
import styles from "./home-journey.module.css"
import { cn } from "@/lib/utils"
import type { HomeJourneyContent } from "@/lib/site-content-schema"
import { DEFAULT_HOME_JOURNEY } from "@/lib/site-content-defaults"

export default function HomeJourney({ content }: { content?: HomeJourneyContent }) {
  const j = content ?? DEFAULT_HOME_JOURNEY
  return (
    <section data-section="journey" className={styles.section} id="ac-journey-section">
      <div className={cn(styles.ambientOrb, styles.orbTopLeft)} aria-hidden />
      <div className={cn(styles.ambientOrb, styles.orbBottomRight)} aria-hidden />

      <div className={cn(styles.journeyBlock, styles.legendaryRow)}>
        <div className={styles.abstractGallery}>
          <div
            className={cn(styles.galleryShape, styles.shapePill)}
            style={{ backgroundImage: `url(${j.pillImage})` }}
          />
          <div
            className={cn(styles.galleryShape, styles.shapeCircle)}
            style={{ backgroundImage: `url(${j.circleImage})` }}
          />
        </div>

        <div className={styles.glassCard}>
          <h2 className={styles.journeyHeading}>
            {j.headlineLine1}
            <br />
            <span className={styles.textTeal}>{j.accentWord}</span>
          </h2>
          <p className={styles.journeyParagraph}>{j.paragraph1}</p>
          <p className={styles.journeyParagraph}>{j.paragraph2}</p>
          <Link href={j.ctaHref} className={styles.journeyBtn}>
            {j.ctaText}
          </Link>
        </div>
      </div>

      <div className={cn(styles.journeyBlock, styles.blockAbout)}>
        <div
          className={styles.watermarkLogo}
          style={{ backgroundImage: `url(${j.watermark})` }}
          aria-hidden
        />

        <div
          className={cn(styles.aboutHeadshot, styles.headshotLeft)}
          style={{ backgroundImage: `url(${j.headshotLeft})` }}
          role="img"
          aria-label=""
        />

        <div className={styles.aboutText}>
          <h2 className={styles.journeyHeading}>Why Work<br />With Me?</h2>
          <div className={styles.tealDivider} />
          <p className={styles.journeyParagraph}>
            I believe in the potential of every athlete, every team, and every individual I work with. My
            approach is personalized, ensuring that each shoot reflects your unique style and spirit.
          </p>
          <p className={styles.journeyParagraph}>
            From dynamic action shots to striking portraits, I&apos;m committed to delivering visuals that
            not only look incredible but also resonate with who you are.
          </p>
        </div>

        <div
          className={cn(styles.aboutHeadshot, styles.headshotRight)}
          style={{ backgroundImage: `url(${j.headshotRight})` }}
          role="img"
          aria-label=""
        />
      </div>
    </section>
  )
}
