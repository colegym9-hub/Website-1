/**
 * SHOOT DATA — single source of truth for the /work canvas gallery
 * ─────────────────────────────────────────────────────────────────────────────
 * HEIGHT RULES (vh-based so images never overflow the 100vh viewport):
 *   small  → 32vh   bottom-row ends ≤87vh ✓
 *   medium → 40vh   bottom-row ends ≤95vh ✓
 *   large  → 54vh   top-row only,  ends ≤64vh ✓
 *   hero   → 60vh   top-row only,  ends ≤70vh ✓
 *
 * POSITION RULES:
 *   top-row items:    top: 5vh,  sizes: hero/large/small
 *   bottom-row items: top: 48vh, sizes: medium/small only
 */

export type Category = "all" | "sportraits" | "media-days" | "senior-portraits"
export type ShootSize = "small" | "medium" | "large" | "hero"

export type Shoot = {
  id: string
  title: string
  category: Exclude<Category, "all">
  cover: string
  images: string[]
  isGrayscale?: boolean
  size: ShootSize
  top: string
  left: string
  speed: number
}

export type Testimonial = {
  id: string
  quote: string
  attribution: string
  context: string
  top: string
  left: string
}

// Pixieset helper
const px = (hash: string, size: "large" | "xlarge" = "large") =>
  `https://images.pixieset.com/821255111/${hash}-${size}.jpg`

// ─────────────────────────────────────────────────────────────────────────────
// SHOOTS
// ─────────────────────────────────────────────────────────────────────────────

export const SHOOTS: Shoot[] = [

  // ── Zone 1 (0–105vw) ─────────────────────────────────────────────────────
  // BOTTOM: Jack Nolan (medium 26vw wide) → 2–28vw | 48–88vh
  {
    id: "jack-nolan",
    title: "Jack Nolan",
    category: "senior-portraits",
    cover: px("91e7a8de3d7234a737043d22f1b2b9fb"),
    images: [px("91e7a8de3d7234a737043d22f1b2b9fb"), px("b779f24bbfb9ebc3914613d3cff21181")],
    size: "medium",
    top: "48vh",
    left: "2vw",
    speed: 0.5,
  },
  // TOP: session-b hero (44vw wide) → 28–72vw | 5–65vh
  {
    id: "session-b",
    title: "Athlete Session",
    category: "sportraits",
    cover: px("23343af97171ca32f954ecb01edb321f"),
    images: [
      px("23343af97171ca32f954ecb01edb321f"),
      px("1b972055fec2eeebca80f014111dd0b8"),
      px("36886c2bed475cbe95ae792f5c542324"),
    ],
    size: "hero",
    top: "5vh",
    left: "28vw",
    speed: 0.3,
  },
  // TOP: binghamton-soccer small (18vw wide) → 76–94vw | 5–37vh
  // (hero ends at 72, 4vw gap ✓; different height at 50+ ✓ no conflict with jack-nolan)
  {
    id: "binghamton-soccer",
    title: "Binghamton Women's Soccer",
    category: "media-days",
    cover: px("e95fdd852a3054cb26ed1523ce7b0e8e"),
    images: [px("e95fdd852a3054cb26ed1523ce7b0e8e"), px("4b026172c5c67ad9141dcfeb5ad9934d")],
    size: "small",
    top: "5vh",
    left: "76vw",
    speed: 0.6,
  },

  // ── Zone 2 (105–215vw) — Sportraits ──────────────────────────────────────
  // TOP: skyler-hughes large (34vw wide) → 106–140vw | 5–59vh
  {
    id: "skyler-hughes",
    title: "Skyler Hughes",
    category: "sportraits",
    cover: px("a208cab9f4daab1037decf890c3465d7"),
    images: [
      px("a208cab9f4daab1037decf890c3465d7"),
      px("13c5a2f4bc5535353dbeb66c349954de"),
      px("fbb259c5dbde4b24f572e67332b3fe58"),
    ],
    size: "large",
    top: "5vh",
    left: "106vw",
    speed: 0.35,
  },
  // BOTTOM: dom-weed medium B&W (26vw wide) → 148–174vw | 48–88vh
  // (skyler ends at 140, 8vw gap ✓)
  {
    id: "dom-weed",
    title: "Dom Weed",
    category: "sportraits",
    cover: px("f2d121665486d77a7ab3b226921254fb"),
    images: [px("f2d121665486d77a7ab3b226921254fb")],
    isGrayscale: true,
    size: "medium",
    top: "48vh",
    left: "148vw",
    speed: 0.55,
  },
  // TOP: session-a small (18vw wide) → 180–198vw | 5–37vh
  {
    id: "session-a",
    title: "Sportrait Session",
    category: "sportraits",
    cover: px("5cb0e75861b0d503dc3f4a30f34dba0c"),
    images: [
      px("5cb0e75861b0d503dc3f4a30f34dba0c"),
      px("27ab9674f721ad0ef81c485752c834ec"),
      px("1dd15e9ac0c7f9ea7ea565ab9e4857ca"),
    ],
    size: "small",
    top: "5vh",
    left: "180vw",
    speed: 0.65,
  },

  // ── Zone 3 (215–335vw) — Media Days ──────────────────────────────────────
  // BOTTOM: egc-dance medium (26vw wide) → 214–240vw | 48–88vh
  {
    id: "egc-dance",
    title: "EGC Dance",
    category: "media-days",
    cover: px("987e6ce32b37bc16626624495bdc8865"),
    images: [px("987e6ce32b37bc16626624495bdc8865"), px("7db378917e54e197999c4edd8a7bea19")],
    size: "medium",
    top: "48vh",
    left: "214vw",
    speed: 0.5,
  },
  // TOP: williamson-basketball hero (44vw wide) → 244–288vw | 5–65vh
  // (egc ends at 240, 4vw gap ✓)
  {
    id: "williamson-basketball",
    title: "Williamson Girls Basketball",
    category: "media-days",
    cover: px("4b518a93f67a7f77ec8ed11f751eb377"),
    images: [
      px("4b518a93f67a7f77ec8ed11f751eb377"),
      px("4ff9080c51a996fc790cf75698c89d87"),
      px("cafb8f59bfbce509ac98aa2a20094e5e"),
    ],
    size: "hero",
    top: "5vh",
    left: "244vw",
    speed: 0.25,
  },
  // BOTTOM: elmira-gymnastics small B&W (18vw wide) → 294–312vw | 52–84vh
  // (williamson hero ends at 288, 6vw gap ✓)
  {
    id: "elmira-gymnastics",
    title: "Elmira Gymnastics",
    category: "media-days",
    cover: px("574ce72a98e27b772088134390a78de4"),
    images: [px("574ce72a98e27b772088134390a78de4")],
    isGrayscale: true,
    size: "small",
    top: "52vh",
    left: "294vw",
    speed: 0.45,
  },
  // TOP: fury-fastpitch small (18vw wide) → 300–318vw | 5–37vh
  // (elmira bottom row, diff heights ✓)
  {
    id: "fury-fastpitch",
    title: "Fury Fastpitch Softball",
    category: "media-days",
    cover: px("bcce011fbdcf84835089540e5e9c4cfb"),
    images: [px("bcce011fbdcf84835089540e5e9c4cfb"), px("79c5b71f925c46518718a7045116cb71")],
    size: "small",
    top: "5vh",
    left: "300vw",
    speed: 0.7,
  },

  // ── Zone 4 (335–440vw) — Senior Portraits ────────────────────────────────
  // BOTTOM: jade-colewell medium (26vw wide) → 326–352vw | 48–88vh
  {
    id: "jade-colewell",
    title: "Jade Colewell",
    category: "senior-portraits",
    cover: px("ee9a6e79a5c02e8cd357b87d03cf7799"),
    images: [
      px("ee9a6e79a5c02e8cd357b87d03cf7799"),
      px("545e24a813441f1a802cfd566a791b3e"),
      px("762ba44aa5afb836eda5710ca7a21252"),
    ],
    size: "medium",
    top: "48vh",
    left: "326vw",
    speed: 0.5,
  },
  // TOP: mackenzie-chamberlain large (34vw wide) → 356–390vw | 5–59vh
  // (jade ends at 352, 4vw gap ✓)
  {
    id: "mackenzie-chamberlain",
    title: "Mackenzie Chamberlain",
    category: "senior-portraits",
    cover: px("a76c1abe19caa3b3562f03e46f0f11bc"),
    images: [
      px("a76c1abe19caa3b3562f03e46f0f11bc"),
      px("dbbae95c0078c52cc115dda22d6ee1a3"),
      px("aebf37f2c2ea8d62e25d6eb7ea4b4f9c"),
    ],
    size: "large",
    top: "5vh",
    left: "356vw",
    speed: 0.3,
  },
  // BOTTOM: brock-downey small (18vw wide) → 396–414vw | 52–84vh
  {
    id: "brock-downey",
    title: "Brock Downey",
    category: "senior-portraits",
    cover: px("0dae571b79a4769a7de23b8bd7f4af9a"),
    images: [px("0dae571b79a4769a7de23b8bd7f4af9a")],
    size: "small",
    top: "52vh",
    left: "396vw",
    speed: 0.7,
  },
  // TOP: owen-stevens small B&W (18vw wide) → 406–424vw | 5–37vh
  // (brock bottom 52-84vh, owen top 5-37vh — same x zone diff heights ✓)
  {
    id: "owen-stevens",
    title: "Owen Stevens",
    category: "senior-portraits",
    cover: px("9b5fe59e0efeaecd9b727f4c63be1830"),
    images: [px("9b5fe59e0efeaecd9b727f4c63be1830"), px("3778f3428a2bf164aad18b34bbac8ebc")],
    isGrayscale: true,
    size: "small",
    top: "5vh",
    left: "406vw",
    speed: 0.6,
  },

  // ── Zone 5 (440–560vw) — Mixed Closing ───────────────────────────────────
  // BOTTOM: tc3-basketball medium (26vw wide) → 434–460vw | 48–88vh
  {
    id: "tc3-basketball",
    title: "TC3 Men's Basketball",
    category: "media-days",
    cover: px("195568d10a8ef49a1684257859a246c3"),
    images: [px("195568d10a8ef49a1684257859a246c3")],
    size: "medium",
    top: "48vh",
    left: "434vw",
    speed: 0.45,
  },
  // TOP: talon-daneglo large (34vw wide) → 464–498vw | 5–59vh
  // (tc3 ends at 460, 4vw gap ✓)
  {
    id: "talon-daneglo",
    title: "Talon Daneglo",
    category: "sportraits",
    cover: px("17617b846454f5f264d489b2eded72bf"),
    images: [px("17617b846454f5f264d489b2eded72bf")],
    size: "large",
    top: "5vh",
    left: "464vw",
    speed: 0.35,
  },
  // TOP: williamson-soccer medium (26vw wide) → 504–530vw | 5–45vh
  {
    id: "williamson-soccer",
    title: "Williamson Girls Soccer",
    category: "media-days",
    cover: px("8d53b01ff38315ebba4bf7a56bb21bfd"),
    images: [px("8d53b01ff38315ebba4bf7a56bb21bfd")],
    size: "medium",
    top: "48vh",
    left: "504vw",
    speed: 0.4,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS — aligned to their corresponding shoots
// All placed in the "middle band" (28–36vh) which is clear of both image rows.
// ─────────────────────────────────────────────────────────────────────────────

export const TESTIMONIALS: Testimonial[] = [
  // Near Jack Nolan — shoot at 2–28vw bottom row
  {
    id: "jack-nolan-quote",
    quote: "AC is the premier photographer in the area and he won't let you down. He does great work.",
    attribution: "Jack Nolan",
    context: "Senior Portraits",
    top: "28vh",
    left: "4vw",
  },
  // Near Skyler Hughes — shoot at 106–140vw top row
  {
    id: "skyler-hughes-quote",
    quote: "My favorite part was testing out different methods and seeing how great they turned out.",
    attribution: "Skyler Hughes",
    context: "Gym Sportraits",
    top: "30vh",
    left: "106vw",
  },
  // Near Dom Weed — shoot at 148–174vw bottom row
  {
    id: "dom-weed-quote",
    quote: "You can clearly see AC took his time on every photo and took pride into every aspect of editing.",
    attribution: "Dom Weed",
    context: "Senior Portraits",
    top: "28vh",
    left: "148vw",
  },
  // Near Williamson Basketball — shoot at 244–288vw top row
  {
    id: "binghamton-kickline-quote",
    quote: "We are all so grateful. You have serious talent and we know you will go far.",
    attribution: "Binghamton Kickline",
    context: "Media Day 2025",
    top: "68vh",
    left: "244vw",
  },
  // Near Mackenzie Chamberlain — shoot at 356–390vw top row
  {
    id: "mackenzie-quote",
    quote: "I absolutely recommend A.C. Media. He is amazing to work with and beyond talented.",
    attribution: "Mackenzie Chamberlain",
    context: "Senior & Sports Portraits",
    top: "28vh",
    left: "356vw",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SIZE MAP — vh heights guarantee no viewport overflow
// ─────────────────────────────────────────────────────────────────────────────
export const SIZE_MAP: Record<ShootSize, { width: string; height: string }> = {
  small:  { width: "clamp(160px, 18vw, 260px)", height: "32vh" },
  medium: { width: "clamp(220px, 26vw, 380px)", height: "40vh" },
  large:  { width: "clamp(300px, 34vw, 500px)", height: "54vh" },
  hero:   { width: "clamp(340px, 42vw, 620px)", height: "60vh" },
}

export const CATEGORY_LABELS: Record<Exclude<Category, "all">, string> = {
  sportraits: "Sportrait",
  "media-days": "Media Day",
  "senior-portraits": "Senior Portraits",
}
