/**
 * SHOOT DATA — records referenced by the editorial chapters in lib/gallery-chapters.ts.
 * Positioning/sizing is now role-based (hero vs support), determined by the chapter layout.
 */

export type Category = "all" | "sportraits" | "media-days" | "senior-portraits"

export type Shoot = {
  id: string
  title: string
  category: Exclude<Category, "all">
  cover: string
  images: string[]
  isGrayscale?: boolean
  /** CSS object-position for the cover image (e.g. "center 30%") */
  objectPosition?: string
}

export type Testimonial = {
  id: string
  quote: string
  attribution: string
  context: string
}

const px = (hash: string, size: "large" | "xlarge" = "large") =>
  `https://images.pixieset.com/821255111/${hash}-${size}.jpg`

const sb = (name: string) =>
  `https://umjucqufenlhkezouejq.supabase.co/storage/v1/object/public/A.C%20Media%20Website%20Photos%201/${name}`

export const SHOOTS: Shoot[] = [
  {
    id: "jack-nolan",
    title: "Jack Nolan",
    category: "senior-portraits",
    cover: px("91e7a8de3d7234a737043d22f1b2b9fb"),
    images: [px("91e7a8de3d7234a737043d22f1b2b9fb"), px("b779f24bbfb9ebc3914613d3cff21181")],
  },
  {
    id: "session-b",
    title: "Binghamton Lacrosse",
    category: "media-days",
    cover: px("23343af97171ca32f954ecb01edb321f"),
    images: [
      px("23343af97171ca32f954ecb01edb321f"),
      px("1b972055fec2eeebca80f014111dd0b8"),
      px("36886c2bed475cbe95ae792f5c542324"),
    ],
  },
  {
    id: "fletcher-good",
    title: "Fletcher Good",
    category: "sportraits",
    cover: sb("Flecther-Good-Senior-Pictureso-05024.jpg"),
    images: [
      sb("Flecther-Good-Senior-Pictureso-05024.jpg"),
      sb("Flecther-Good-Senior-Pictureso-04907.jpg"),
    ],
  },
  {
    id: "mackenzie-sportraits",
    title: "Mackenzie Chamberlain",
    category: "sportraits",
    cover: sb("Mackenzie-Chamberlain-Sports-Shoot-04394-Edit.jpg"),
    images: [
      sb("Mackenzie-Chamberlain-Sports-Shoot-04394-Edit.jpg"),
      sb("Mackenzie-Chamberlain-Sports-Shoot-04348-Edit.jpg"),
      sb("Mackenzie-Chamberlain-Sports-Shoot-04655.jpg"),
    ],
  },
  {
    id: "binghamton-soccer",
    title: "Binghamton Women's Soccer",
    category: "media-days",
    cover: px("e95fdd852a3054cb26ed1523ce7b0e8e"),
    images: [px("e95fdd852a3054cb26ed1523ce7b0e8e"), px("4b026172c5c67ad9141dcfeb5ad9934d")],
  },
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
  },
  {
    id: "dom-weed",
    title: "Dom Weed",
    category: "sportraits",
    cover: px("f2d121665486d77a7ab3b226921254fb"),
    images: [px("f2d121665486d77a7ab3b226921254fb")],
    isGrayscale: true,
  },
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
  },
  {
    id: "egc-dance",
    title: "EGC Dance",
    category: "media-days",
    cover: px("987e6ce32b37bc16626624495bdc8865"),
    images: [px("987e6ce32b37bc16626624495bdc8865"), px("7db378917e54e197999c4edd8a7bea19")],
  },
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
  },
  {
    id: "binghamton-kickline",
    title: "Binghamton Kickline",
    category: "media-days",
    cover: sb("A_C01358.jpg"),
    images: [sb("A_C01358.jpg")],
    objectPosition: "center 35%",
  },
  {
    id: "elmira-gymnastics",
    title: "Elmira Gymnastics",
    category: "media-days",
    cover: px("574ce72a98e27b772088134390a78de4"),
    images: [px("574ce72a98e27b772088134390a78de4")],
    isGrayscale: true,
  },
  {
    id: "fury-fastpitch",
    title: "Fury Fastpitch Softball",
    category: "media-days",
    cover: px("bcce011fbdcf84835089540e5e9c4cfb"),
    images: [px("bcce011fbdcf84835089540e5e9c4cfb"), px("79c5b71f925c46518718a7045116cb71")],
  },
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
  },
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
  },
  {
    id: "brock-downey",
    title: "Brock Downey",
    category: "senior-portraits",
    cover: px("0dae571b79a4769a7de23b8bd7f4af9a"),
    images: [px("0dae571b79a4769a7de23b8bd7f4af9a")],
  },
  {
    id: "owen-stevens",
    title: "Owen Stevens",
    category: "senior-portraits",
    cover: px("9b5fe59e0efeaecd9b727f4c63be1830"),
    images: [px("9b5fe59e0efeaecd9b727f4c63be1830"), px("3778f3428a2bf164aad18b34bbac8ebc")],
    isGrayscale: true,
  },
  {
    id: "tc3-basketball",
    title: "TC3 Men's Basketball",
    category: "media-days",
    cover: px("195568d10a8ef49a1684257859a246c3"),
    images: [px("195568d10a8ef49a1684257859a246c3")],
  },
  {
    id: "talon-daneglo",
    title: "Talon Daneglo",
    category: "sportraits",
    cover: px("17617b846454f5f264d489b2eded72bf"),
    images: [px("17617b846454f5f264d489b2eded72bf")],
  },
  {
    id: "williamson-soccer",
    title: "Williamson Girls Soccer",
    category: "media-days",
    cover: px("8d53b01ff38315ebba4bf7a56bb21bfd"),
    images: [px("8d53b01ff38315ebba4bf7a56bb21bfd")],
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "jack-nolan-quote",
    quote: "AC is the premier photographer in the area and he won't let you down. He does great work.",
    attribution: "Jack Nolan",
    context: "Senior Portraits",
  },
  {
    id: "skyler-hughes-quote",
    quote: "My favorite part was testing out different methods and seeing how great they turned out.",
    attribution: "Skyler Hughes",
    context: "Gym Sportraits",
  },
  {
    id: "dom-weed-quote",
    quote: "You can clearly see AC took his time on every photo and took pride into every aspect of editing.",
    attribution: "Dom Weed",
    context: "Senior Portraits",
  },
  {
    id: "binghamton-kickline-quote",
    quote: "We are all so grateful. You have serious talent and we know you will go far.",
    attribution: "Binghamton Kickline",
    context: "Media Day 2025",
  },
  {
    id: "mackenzie-quote",
    quote: "I absolutely recommend A.C. Media. He is amazing to work with and beyond talented.",
    attribution: "Mackenzie Chamberlain",
    context: "Senior & Sports Portraits",
  },
]

export const CATEGORY_LABELS: Record<Exclude<Category, "all">, string> = {
  sportraits: "Sportrait",
  "media-days": "Media Day",
  "senior-portraits": "Senior Portraits",
}
