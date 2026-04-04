"use client";

import React from "react"
import Link from "next/link"
import { JOURNEY_HEADSHOTS, JOURNEY_LEGENDARY_IMAGES, JOURNEY_WATERMARK } from "./content"
import styles from "./home-journey.module.css"
import { cn } from "@/lib/utils"

export default function HomeJourney() {
  return (
    <section data-section="journey" className={styles.section} id="ac-journey-section">
      <div className={cn(styles.ambientOrb, styles.orbTopLeft)} aria-hidden />
      <div className={cn(styles.ambientOrb, styles.orbBottomRight)} aria-hidden />

      <div className={cn(styles.journeyBlock, styles.legendaryRow)}>
        <div className={styles.abstractGallery}>
          <div
            className={cn(styles.galleryShape, styles.shapePill)}
            style={{ backgroundImage: `url(${JOURNEY_LEGENDARY_IMAGES.pill})` }}
          />
          <div
            className={cn(styles.galleryShape, styles.shapeCircle)}
            style={{ backgroundImage: `url(${JOURNEY_LEGENDARY_IMAGES.circle})` }}
          />
        </div>

        <div className={styles.glassCard}>
          <h2 className={styles.journeyHeading}>
            Let&apos;s Create Something
            <br />
            <span className={styles.textTeal}>Legendary</span>
          </h2>
          <p className={styles.journeyParagraph}>
            I&apos;m not just here to take photos. I&apos;m here to capture the energy, the grit, and the
            moments that define you and your team. Whether it&apos;s the intensity of a media day or the
            individuality of a senior portrait, my goal is to make you feel confident, hyped, and truly
            seen.
          </p>
          <p className={styles.journeyParagraph}>
            Every session is a collaboration, a chance to showcase your story through powerful imagery.
          </p>
          <Link href="/book" className={styles.journeyBtn}>
            Click Here To Create Something Amazing
          </Link>
        </div>
      </div>

      <div className={cn(styles.journeyBlock, styles.blockAbout)}>
        <div
          className={styles.watermarkLogo}
          style={{ backgroundImage: `url(${JOURNEY_WATERMARK})` }}
          aria-hidden
        />

        <div
          className={cn(styles.aboutHeadshot, styles.headshotLeft)}
          style={{ backgroundImage: `url(${JOURNEY_HEADSHOTS.left})` }}
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
          style={{ backgroundImage: `url(${JOURNEY_HEADSHOTS.right})` }}
          role="img"
          aria-label=""
        />
      </div>
    </section>
  )
}
