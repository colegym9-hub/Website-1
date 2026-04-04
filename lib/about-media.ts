/** Cole-first imagery for /about — Pixieset CDN. */

export const profileAsset = {
  src: "https://images.pixieset.com/821255111/51a600e71d2a173b9af857008b65390d-large.png",
  alt: "Cole Warner, photographer and founder of A.C Media",
} as const

export type AboutPhoto = { src: string; alt: string }

/** Milestone pill rows: label + circular thumb */
export const pillMilestones: { label: string; thumb: AboutPhoto }[] = [
  {
    label: "70+ media days led",
    thumb: {
      src: "https://images.pixieset.com/821255111/751a68d8d98482a311b88e4037a62106-large.jpg",
      alt: "Cole Warner in studio lighting, self portrait",
    },
  },
  {
    label: "150+ sporting events",
    thumb: {
      src: "https://images.pixieset.com/821255111/c01c2f6e2683f115a9cd9d051fb22c33-large.jpg",
      alt: "Cole Warner, athletic portrait",
    },
  },
  {
    label: "30+ senior sessions",
    thumb: {
      src: "https://images.pixieset.com/821255111/37320b21ae1771a5f1b3acb136919a8b-large.jpg",
      alt: "Cole Warner, casual portrait",
    },
  },
  {
    label: "8 years behind the camera",
    thumb: {
      src: "https://images.pixieset.com/821255111/19e9be309ccf604c12a1bffc9b59c540-large.jpg",
      alt: "Cole Warner, profile-style portrait",
    },
  },
]

/** Five-photo collage (center index = hero). */
export const collagePhotos: AboutPhoto[] = [
  {
    src: "https://images.pixieset.com/821255111/2cd806654e1eae9ab3870d0dea95b787-large.jpg",
    alt: "Cole Warner, portrait",
  },
  {
    src: "https://images.pixieset.com/821255111/b122fad21b3f0ff0934e69e4afb7a372-large.jpg",
    alt: "Cole Warner, studio self-portrait",
  },
  {
    src: "https://images.pixieset.com/821255111/f90197961ae8821222210e2ef146d71e-large.jpg",
    alt: "Cole Warner, vertical portrait",
  },
  {
    src: "https://images.pixieset.com/821255111/e62edc3b92148892f0f1107d5ce961f3-large.jpg",
    alt: "Cole Warner, portrait",
  },
  {
    src: "https://images.pixieset.com/821255111/720cfbd94b1219d4690ab0cf997b12a2-large.jpg",
    alt: "Cole Warner, direct gaze portrait",
  },
]

/** What we believe — bento card backgrounds (client / media day work). */
export const beliefMediaDayHero: AboutPhoto = {
  src: "https://images.pixieset.com/821255111/195568d10a8ef49a1684257859a246c3-large.jpg",
  alt: "Men's basketball media day, high-energy studio portrait",
}

/** Grittier frame for authenticity / BTS card (grain + VCR treatment in CSS). */
export const beliefBtsRaw: AboutPhoto = {
  src: "https://images.pixieset.com/821255111/de0405d463218b86434c2c2e6861f8fa-large.jpg",
  alt: "Athlete on set during a media day portrait session",
}

/** Cole circle portrait — transparent background PNG. */
export const circlePortrait: AboutPhoto = {
  src: "https://images.pixieset.com/821255111/d02566c3746a253c02a7886a7fd5f754-xxlarge.png",
  alt: "Cole Warner, portrait",
}

/** Stryds-style overlapping collage on the beliefs section (client work). */
export const beliefStrydsCollage: AboutPhoto[] = [
  beliefMediaDayHero,
  beliefBtsRaw,
  {
    src: "https://images.pixieset.com/821255111/8d53b01ff38315ebba4bf7a56bb21bfd-large.jpg",
    alt: "Soccer media day, athlete in uniform, studio lighting",
  },
  {
    src: "https://images.pixieset.com/821255111/7db378917e54e197999c4edd8a7bea19-large.jpg",
    alt: "Dance media day portrait in performance attire",
  },
  {
    src: "https://images.pixieset.com/821255111/4b518a93f67a7f77ec8ed11f751eb377-large.jpg",
    alt: "Girls basketball media day, confident studio portrait",
  },
]
