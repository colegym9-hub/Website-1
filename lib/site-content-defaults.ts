import type {
  AboutBeliefsContent,
  AboutHeroContent,
  AboutMilestonesContent,
  AboutNowContent,
  AboutPhotosContent,
  AboutSlideContent,
  GlobalFooterContent,
  GlobalNavContent,
  HomeEnvelopeContent,
  HomeHeroContent,
  HomeJourneyContent,
  HomeServicesContent,
  SeoMeta,
} from "@/lib/site-content-schema"
import {
  ARC_NODES,
  INNER_ORBIT_IMAGES,
  JOURNEY_HEADSHOTS,
  JOURNEY_LEGENDARY_IMAGES,
  JOURNEY_WATERMARK,
  OUTER_ORBIT_IMAGES,
  TYPEWRITER_WORDS,
} from "@/components/home/content"
import {
  beliefBtsRaw,
  beliefMediaDayHero,
  beliefStrydsCollage,
  circlePortrait,
  collagePhotos,
  pillMilestones,
  profileAsset,
} from "@/lib/about-media"

export const DEFAULT_SEO_HOME: SeoMeta = {
  title: "A.C Media - Athlete Photography",
  description:
    "Cinematic athlete photography experience based in Binghamton, NY. Media days, sportraits, senior portraits. Every athlete has a story worth telling.",
  ogImage: "",
}

export const DEFAULT_SEO_ABOUT: SeoMeta = {
  title: "About - A.C Media",
  description:
    "Cole Warner founded A.C Media to give every athlete an image that reflects the version of themselves they worked to become. Based in Binghamton and Elmira-Corning, NY.",
  ogImage: "",
}

export const DEFAULT_SEO_WORK: SeoMeta = {
  title: "Work - A.C Media",
  description:
    "Selected sportraits, media days, and senior portrait work by A.C Media — cinematic athlete photography in Binghamton and Elmira-Corning, NY.",
  ogImage: "",
}

export const DEFAULT_HOME_HERO: HomeHeroContent = {
  typewriterWords: [...TYPEWRITER_WORDS],
  innerOrbitImages: [...INNER_ORBIT_IMAGES],
  outerOrbitImages: [...OUTER_ORBIT_IMAGES],
}

export const DEFAULT_HOME_JOURNEY: HomeJourneyContent = {
  headlineLine1: "Let's Create Something",
  accentWord: "Legendary",
  paragraph1:
    "I'm not just here to take photos. I'm here to capture the energy, the grit, and the moments that define you and your team. Whether it's the intensity of a media day or the individuality of a senior portrait, my goal is to make you feel confident, hyped, and truly seen.",
  paragraph2:
    "Every session is a collaboration, a chance to showcase your story through powerful imagery.",
  ctaText: "Click Here To Create Something Amazing",
  ctaHref: "/contact",
  pillImage: JOURNEY_LEGENDARY_IMAGES.pill,
  circleImage: JOURNEY_LEGENDARY_IMAGES.circle,
  watermark: JOURNEY_WATERMARK,
  headshotLeft: JOURNEY_HEADSHOTS.left,
  headshotRight: JOURNEY_HEADSHOTS.right,
}

export const DEFAULT_HOME_SERVICES: HomeServicesContent = {
  cards: ARC_NODES.map((n) => ({
    id: n.id,
    title: n.title,
    titleBreak: n.titleBreak,
    description: n.description,
    service: n.service,
    image: n.image,
    bgPosition: n.bgPosition,
  })),
}

export const DEFAULT_HOME_ENVELOPE: HomeEnvelopeContent = {
  headline: "Want to learn more?",
  subhead: "Leave me a line and I'll follow up.",
  envelopeTo: "To Cole",
  salutation: "Hi Cole,",
  nameLeadIn: "My name is",
  wantLeadIn: "and I want to learn more about",
  emailLeadIn: "Email me at",
  phoneLeadIn: "My number is",
  phoneOptionalLabel: "optional",
  submitLabel: "Mail it",
  submittingLabel: "Sending",
  successText: "Sent. Talk soon.",
  errorTextGeneric: "Something went off. Try again?",
  errorTextName: "i need your name",
  errorTextEmail: "i need your email to write back",
  errorTextMessage: "tell me what you want to learn about",
  wordmarkUrl:
    "https://umjucqufenlhkezouejq.supabase.co/storage/v1/object/public/A.C%20Media%20Website%20Photos%201/2nd.HvnArtboard%2034%404x.png",
}

export const DEFAULT_ABOUT_HERO: AboutHeroContent = {
  profileSrc: profileAsset.src,
  profileAlt: profileAsset.alt,
  headline: "Every athlete has a story worth telling.",
  stats: [
    { number: "70+", label: "media days led" },
    { number: "150+", label: "sporting events" },
    { number: "30+", label: "senior sessions" },
  ],
}

export const DEFAULT_ABOUT_SLIDE_BEGINNING: AboutSlideContent = {
  eyebrow: "The beginning",
  headline: "Obsession over a business plan.",
  body: "It started on the sidelines in 7th grade, capturing real moments. No strategy. Just an obsession to make every single frame better than the last.",
}

export const DEFAULT_ABOUT_SLIDE_WORK: AboutSlideContent = {
  eyebrow: "The work",
  headline: "I found my edge.",
  body: "150+ sporting events and 30+ senior sessions later, I found my true edge. Today, after leading 70+ media days, A.C Media is built on one standard: creating images that go far beyond standard photos.",
}

export const DEFAULT_ABOUT_NOW: AboutNowContent = {
  headline: "Now, every shoot is built around you",
  paragraphs: [
    "Now, every shoot is built around the athlete. I'm not just showing up to take pictures. I'm there to build something with you. The camera is only part of it; the rest is how we run the day, read the room, and keep the bar high without making you perform for it.",
    "I'm creating an environment where athletes can express who they are, with lighting, atmosphere, and direction that actually brings that out. We slow down when you need breath, push when you want edge, and keep the set honest so the frames feel like you. Not a version of you stitched together in post.",
    "The goal is always the same: to create something that feels real, something you're proud of, not just something that looks good. Those images are going to follow your career. I treat them that way from the first frame to the last.",
  ],
}

export const DEFAULT_ABOUT_BELIEFS: AboutBeliefsContent = {
  cards: [
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
  ],
}

export const DEFAULT_ABOUT_MILESTONES: AboutMilestonesContent = {
  pills: pillMilestones.map((p) => ({
    label: p.label,
    thumbSrc: p.thumb.src,
    thumbAlt: p.thumb.alt,
  })),
}

export const DEFAULT_ABOUT_PHOTOS: AboutPhotosContent = {
  collage: collagePhotos.map((p) => ({ src: p.src, alt: p.alt })),
  beliefStrydsCollage: beliefStrydsCollage.map((p) => ({ src: p.src, alt: p.alt })),
  circlePortrait: { src: circlePortrait.src, alt: circlePortrait.alt },
  beliefMediaDayHero: { src: beliefMediaDayHero.src, alt: beliefMediaDayHero.alt },
  beliefBtsRaw: { src: beliefBtsRaw.src, alt: beliefBtsRaw.alt },
}

export const DEFAULT_GLOBAL_FOOTER: GlobalFooterContent = {
  eyebrow: "Let's build it",
  headlineLine1: "Ready to build",
  headlineLine2: "your image?",
  ctaText: "Book a shoot",
  ctaHref: "/contact",
  brandLine: "A.C Media",
  links: [
    { label: "@a_c.media", href: "https://instagram.com/a_c.media" },
    { label: "alternate.creative.media@gmail.com", href: "mailto:alternate.creative.media@gmail.com" },
  ],
  locationLine: "Binghamton, NY · Elmira-Corning, NY",
  copyrightName: "A.C Media",
}

export const DEFAULT_GLOBAL_NAV: GlobalNavContent = {
  brandLabel: "A.C Media",
  links: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
  ],
  ctaText: "Book Now",
  ctaHref: "/contact",
  sheetSocialLabel: "@a_c.media",
  sheetSocialHref: "https://instagram.com/a_c.media",
}

export const DEFAULT_CONTENT_BY_ID: Record<string, unknown> = {
  "home:hero": DEFAULT_HOME_HERO,
  "home:journey": DEFAULT_HOME_JOURNEY,
  "home:services": DEFAULT_HOME_SERVICES,
  "about:hero": DEFAULT_ABOUT_HERO,
  "about:slide-beginning": DEFAULT_ABOUT_SLIDE_BEGINNING,
  "about:slide-work": DEFAULT_ABOUT_SLIDE_WORK,
  "about:now": DEFAULT_ABOUT_NOW,
  "about:beliefs": DEFAULT_ABOUT_BELIEFS,
  "about:milestones": DEFAULT_ABOUT_MILESTONES,
  "about:photos": DEFAULT_ABOUT_PHOTOS,
  "global:footer": DEFAULT_GLOBAL_FOOTER,
  "global:nav": DEFAULT_GLOBAL_NAV,
  "seo:home": DEFAULT_SEO_HOME,
  "seo:about": DEFAULT_SEO_ABOUT,
  "seo:work": DEFAULT_SEO_WORK,
}
