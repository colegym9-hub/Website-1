# A.C Media Website — Planning Context

Generated: 2026-03-26

---

## Project Overview

**Client:** Cole Warner — A.C Media
**Brand:** Cinematic athlete photography experience
**Markets:** Binghamton, NY (fall–spring) · Elmira–Corning, NY (summer)
**Current site:** www.a-cmedia.com (full replacement, not a redesign)
**New repo:** Next.js 16 + shadcn/ui + Tailwind CSS v4 (already scaffolded)

---

## Visual Inspiration

### regisgrumberg.com
- **What we like:** The tunnel/space zoom effect where images are on the walls of a 3D perspective corridor that spins/moves as you scroll
- **What we're changing:** Remove the "click to enter" gate — the animation auto-plays on load, then opens with a zoom-in animation automatically. No interaction required to start.
- **Application:** Hero entrance animation

### lazy.so
- **What we like:** Sticky scroll feeling — sections "freeze" and update what's happening on screen instead of traditional vertical scrolling. The page stops and content evolves in place.
- **Application:** Pinned GSAP scroll sections on the landing page

### exoape.com
- **What we like:** Images move out horizontally as you scroll in smooth bezier motion. The header text slowly increases in size as you scroll.
- **Application:** "The Work" section on the landing page
- **Easing:** `cubic-bezier(0.165, 0.84, 0.44, 1)`

### Warby Parker Quiz + Lemonade
- **What we like:** Step-by-step full-screen lead funnel. One question at a time, animated forward transitions.
- **Application:** The booking/qualifier funnel on the `/services` page

### Wonders of Wisdom (wondersofwisdom.org)
- **What we like:** Animation structure and layout patterns ONLY (not colors, theme, or content)
  - Fade + skew entrance: elements come in from `opacity: 0, translateY(8rem) skewY(3deg)` → visible
  - Image scale-in: 1.2 → 1
  - Clip-path reveals
  - Asymmetric 2-col grid (45fr / 55fr)
  - Lenis smooth scroll
  - Fluid type with `clamp()`
- **Application:** About page structure and all text entrance animations site-wide

### Current a-cmedia.com/about
- Referenced for content structure on the `/about` page (site was 403-blocked from scraping but user knows it)

---

## Site Architecture

**4 routes:**

| Route | Purpose |
|-------|---------|
| `/` | Landing page — cinematic single-page scroll with all major sections |
| `/about` | Cole's full story, expanded |
| `/portfolio` | Full editorial gallery |
| `/services` | Package details + full booking funnel |

---

## Design System

### Colors

| Role | Hex | Usage |
|------|-----|-------|
| Background primary | `#0A0A0A` | Base. Near-black. |
| Background secondary | `#111111` | Section breaks. |
| Surface / overlay | `#1A1A1A` | Cards, modals. |
| Primary text | `#F0EDE8` | Warm off-white. |
| Secondary text | `#A0A0A0` | Captions, labels. |
| Accent | `#3E6466` | Artboard 50 — deep teal. CTAs, selection, key UI. |
| Accent mid | `#8ABCBF` | Hover text, links, 3D accents, gradient mid stop. |
| Accent hover | `#9BC8CB` | Filled control hover. |
| Accent light | `#E0F7F9` | Rare highlights; gradient high stop. |
| Dividers | `#2A2A2A` | Structural. Barely visible. |

### Typography

- **Primary (headings):** Cooletiva — Adobe Fonts Typekit
  - Embed: `<link rel="stylesheet" href="https://use.typekit.net/xjl1yqv.css">`
  - CSS: `font-family: 'cooletiva', sans-serif;`
  - Default weight: bold. Sentence case always. No decorative type.
- **Body:** Inter (already loaded in project)
- Headlines: take up space on purpose. Body: invisible, never competing with imagery.

### Image Hosting

- Source: Pixieset CDN — `https://acmediaco.pixieset.com/websitehosting/`
- Configure in `next.config.mjs`: `remotePatterns: [{ hostname: 'acmediaco.pixieset.com' }]`
- Use `next/image` for all images
- Photos >20MB — Pixieset serves them; Next.js handles responsive delivery

---

## Tech Stack

### Already in project
- Next.js 16 + React 19
- Tailwind CSS v4
- shadcn/ui (radix-nova style)
- Lucide React icons
- next-themes

### To install
```bash
npm install gsap @gsap/react lenis framer-motion resend react-hook-form zod react-day-picker date-fns googleapis
```

| Package | Purpose |
|---------|---------|
| `gsap` + `@gsap/react` | Tunnel hero, sticky scroll (lazy.so), horizontal testimonial scrub |
| `lenis` | Smooth scroll throughout |
| `framer-motion` | Component entrances (fade+skew), page transitions, filtering |
| `resend` | Email notifications to Cole on form submit |
| `react-hook-form` + `zod` | Form state + validation |
| `react-day-picker` + `date-fns` | Multi-date calendar picker in funnel |
| `googleapis` | Google Sheets API for lead logging |

---

## Navigation

- Fixed top bar, `z-50`
- Transparent over hero, dark bg after scroll
- Left: A.C Media wordmark (Cooletiva)
- Right: **"Book" CTA** (accent blue, always visible, persistent) + hamburger icon
- Hamburger → full-screen overlay menu: Work, About, Services
- Mobile: same structure, hamburger only

---

## Landing Page (`/`) — Section Breakdown

### 1. Hero — Tunnel Entrance
- Full-screen 3D perspective tunnel
- Shoot photos positioned as image planes on the tunnel walls
- **Auto-plays on load** — zoom-in animation (0.3 → 1 scale, 2–2.5s ease-out). No click required.
- After zoom settles: headline + CTA fade in
- `ScrollTrigger` scrubs tunnel forward as user scrolls past hero
- Copy: `"The image is the legacy."` (Cooletiva, massive, one line)
- CTA: `"See the work"` (smooth scrolls to Section 3)

### 2. Who We Are (mini)
- Asymmetric 2-col grid (45/55)
- Left: large stat numerals in Cooletiva (`60+`, `150+`)
- Right: 4–5 lines of documentary copy
- Fade + skew entrance (Wonders of Wisdom style)
- Image of Cole at work below, scale-in (1.2 → 1)
- Link: `"Full story →"` → `/about`

### 3. The Work (mini gallery)
- exoape-style horizontal image reveal on scroll
- 4–6 images in staggered horizontal positions
- On scroll: images translate out left/right with `cubic-bezier(0.165, 0.84, 0.44, 1)`
- Headline "The Work" grows from small → massive as scroll progresses (`clamp(3rem, 15vw, 12rem)`)
- GSAP `ScrollTrigger` pins this section
- Link: `"View all work →"` → `/portfolio`

### 4. What It Feels Like
- Full-bleed dramatic shoot photo (smoke + strobes)
- Below: **horizontal scrolling testimonial strip** (GSAP `x` scrubbed by vertical scroll)
- Each testimonial card: name, sport/school, quote
- Real testimonials from Cole (referenced at a-cmedia.com/portfolio)
- Video slot planned for later when footage is edited

### 5. Services Overview
- 3 cards: Premium Media Day · Deluxe Media Day · Senior Portraits
- Package name (Cooletiva) + 3-line description + what's included
- **No pricing visible** on this section
- Each card CTA: `"See details & book"` → `/services`
- Framer Motion stagger entrance

### 6. Footer
- Instagram: `@a_c.media`
- Email: `alternate.creative.media@gmail.com`
- Location: `Binghamton, NY · Elmira–Corning, NY`
- Copyright: `© 2025 A.C Media`
- Thin `#2A2A2A` divider top

---

## About Page (`/about`)

Structure inspired by Wonders of Wisdom layout patterns:

1. **Full-bleed hero image** — Cole at work, scale-in entrance
2. **Brand statement** — `"Every athlete has a story worth telling."` Centered, Cooletiva, large
3. **Stats row** — `60+` media days · `150+` sporting events · `5+` years. Huge Cooletiva numerals, staggered fade-in
4. **Cole's story** — Documentary copy from master doc. 2-col asymmetric. Fade+skew entrances.
5. **Brand beliefs** — Each belief as full-width text block on scroll reveal. Cooletiva statement + Inter explanation.
6. **Shoot energy images** — 2–3 photos in overlapping staggered layout, clip-path reveal

---

## Portfolio Page (`/portfolio`)

- Editorial asymmetric grid (`grid-template-areas`)
- No gallery plugin look — large images, some full-width, some 2-col
- Images from Pixieset via `next/image`
- Hover: scale 1 → 1.03, slight brightness
- Category filter: `All | Media Days | Senior Portraits`
- Framer Motion `AnimatePresence` for filter transitions

---

## Services Page (`/services`)

### Part A — Package Detail Cards (pre-funnel)
- Full breakdown of what each package includes
- Timing, turnaround, effects available
- **No pricing visible** until contact info captured
- CTA: `"Start booking"` → scrolls to funnel

### Part B — Qualifier Funnel (Warby Parker / Lemonade style)

**Step 1 — Contact Info** *(gates everything)*
- Name, Email, Phone, School/Team name

**Step 2 — Service Type**
- Media Day (team) or Senior Portraits (individual)

**Step 3a — Media Day: Team Size**
- Slider (1–50+)
- Reveals immediately on move:
  - Recommended package
  - Total price
  - Price per athlete

**Pricing logic:**
```
Premium Media Day:
  ≤12 athletes: $900 total / count = per-athlete price (total stays $900)
  >12 athletes: $900 + ($75 × (count − 12)) = new total

Deluxe Media Day:
  ≤12 athletes: $1,500 total / count = per-athlete price (total stays $1,500)
  >12 athletes: $1,500 + ($125 × (count − 12)) = new total
```

**Step 3b — Senior Portraits**
- Package grid with prices displayed (Basic $350 / Premium $500 / Deluxe $600 / The Whole Thing $750)

**Step 4 — Preferred Dates**
- Multi-select calendar (up to 5 dates)
- Note: "This isn't confirmed — we'll follow up to lock one in"

**Step 5 — Notes**
- Optional textarea
- Submit button

**On Submit:**
- Validate with Zod
- `POST /api/book`
- Resend → formatted email to `alternate.creative.media@gmail.com`
- Google Sheets → append row
- Success screen: `"We've got your info. Expect a reply within 24 hours."`

---

## API Route — `/api/book`

**File:** `app/api/book/route.ts`

**Google Sheet columns:**
`Timestamp | Name | Email | Phone | School/Team | Service Type | Team Size | Package | Total Price | Preferred Dates | Notes`

**Environment variables:**
```
RESEND_API_KEY=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
```

Google Sheet setup: from scratch (no existing sheet)

---

## Smooth Scroll Setup

**File:** `components/smooth-scroll-provider.tsx`

Lenis instance synced with GSAP:
```js
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

Wrap the entire app with this provider in `layout.tsx`.

---

## Mobile Strategy

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Tunnel hero | Full GSAP animation | Simplified fade-in |
| Sticky scroll sections | GSAP pinned | Normal vertical scroll |
| Horizontal testimonial scrub | GSAP scroll-triggered | Standard overflow scroll |
| exoape image reveal | GSAP | Simplified Framer Motion |
| Booking funnel | Full experience | Full experience (works naturally) |
| Nav | Logo + Book + hamburger | Same |

Breakpoint: `window.innerWidth > 768` guards all GSAP effects.

---

## File Structure

```
app/
  layout.tsx                    ← Typekit link, Lenis provider, design tokens
  globals.css                   ← Design token CSS variables
  page.tsx                      ← Landing page
  about/page.tsx
  portfolio/page.tsx
  services/page.tsx
  api/
    book/route.ts               ← Resend + Google Sheets

components/
  nav.tsx
  footer.tsx
  smooth-scroll-provider.tsx
  hero/
    tunnel.tsx                  ← GSAP 3D tunnel entrance
  sections/
    who-we-are.tsx
    the-work.tsx
    what-it-feels-like.tsx
    services-overview.tsx
  about/
    stats-row.tsx
    beliefs.tsx
  portfolio/
    editorial-grid.tsx
    category-filter.tsx
  services/
    package-cards.tsx
    funnel/
      funnel.tsx
      steps/
        step-1.tsx              ← Contact info
        step-2.tsx              ← Service type
        step-3a.tsx             ← Team size slider + pricing
        step-3b.tsx             ← Senior portrait packages
        step-4.tsx              ← Date picker
        step-5.tsx              ← Notes + submit
      pricing-slider.tsx
      date-picker.tsx
```

---

## Build Order

1. Design tokens in `globals.css` + Typekit font in `layout.tsx`
2. `next.config.mjs` — Pixieset image domain
3. `smooth-scroll-provider.tsx` — Lenis + GSAP integration
4. `nav.tsx` + `footer.tsx`
5. Landing page — all 6 sections
6. `/about` page
7. `/portfolio` page
8. `/services` — package cards + full funnel
9. `app/api/book/route.ts` — Resend + Sheets
10. Mobile optimizations
11. Polish: easing, timing, micro-interactions

---

## Brand Voice Reference

**Sounds like:**
- "The season ends. The image stays."
- "Prepared clients get dramatically better results. That is not a suggestion."
- "This is what it actually looks like when you're trying to build something."

**Never sounds like:**
- "Chase your dreams."
- "We are passionate about your journey."
- "Amazing results guaranteed."
- Motivational clichés of any kind.

Short lines. Observational. Warm but never soft.

---

## Contact / Social

| | |
|-|-|
| Instagram | @a_c.media |
| Lead email | alternate.creative.media@gmail.com |
| Markets | Binghamton, NY · Elmira–Corning, NY |
| Brand | A24 × Apple × ESPN energy |
