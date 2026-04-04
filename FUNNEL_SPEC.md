# A.C Media — Booking Funnel Optimization Spec

Generated: 2026-04-03

---

## Overview

This document captures all planned changes to the `/book` funnel based on the optimization session. It is organized by change type so it can be implemented incrementally.

---

## 1. Path Restructure

### Current paths (before this spec)

| Service | Steps |
|---|---|
| Media Day | who-are-you → service-select → md-sport → md-roster → md-location → md-timeline → md-frame → md-contact → md-rec → thank-you |
| Sportraits | who-are-you → service-select → sp-sports → sp-vision → sp-location → sp-timeline → sp-frame → sp-contact → sp-rec → thank-you |
| Senior Portraits | who-are-you → service-select → sr-welcome → sr-ideology → sr-session → sr-vibe → sr-mood → sr-location → sr-timeline → sr-frame → sr-contact → sr-rec → thank-you |

### Target paths (after this spec)

| Service | Steps |
|---|---|
| Media Day | who-are-you → service-select → md-sport → md-roster → md-location → md-timeline → md-frame → md-contact → md-rec → thank-you |
| Sportraits | who-are-you → service-select → sp-sports → sp-location → sp-timeline → sp-frame → sp-contact → sp-rec → thank-you |
| Senior Portraits | who-are-you → service-select → sr-welcome → sr-frame → sr-session → sr-vibe → sr-location → sr-timeline → sr-contact → sr-rec → thank-you |

### Changes summary

- **Sportraits**: Remove `sp-vision` step entirely (moves to follow-up email)
- **Senior Portraits**: Remove `sr-mood` step (moves to follow-up email), remove `sr-ideology` as a standalone step (merged into `sr-frame`)
- **Contact** sits just before the package rec on all three paths — already implemented

---

## 2. Step Changes

### 2a. Location step — replace pill grid with Google Places autocomplete

**Affected steps:** `md-location`, `sp-location`, `sr-location`

**Current behavior:** 4 hardcoded pill options that don't cover the full service area.

**New behavior:** Text input with Google Places Autocomplete (New) API, biased toward Binghamton, NY.

**Implementation notes:**

- Use the Google Places Autocomplete API (New) — `https://places.googleapis.com/v1/places:autocomplete`
- Bias toward Binghamton, NY using `locationBias` with a circle centered on Binghamton:
  ```json
  "locationBias": {
    "circle": {
      "center": { "latitude": 42.0987, "longitude": -75.9180 },
      "radius": 160000
    }
  }
  ```
  160km (~100 miles) covers Binghamton, Elmira/Corning, Ithaca, Syracuse, Scranton PA, Harrisburg PA.
- Type filter: `"(cities)"` — city-level results only, no street addresses
- Out-of-range warning: if the selected place's state is not `NY` or `PA`, show a soft inline warning below the input:
  > *"We're based in Binghamton, NY and primarily serve NY and PA. We may still be able to work something out — Cole will confirm on follow-up."*
  The Continue button remains enabled regardless.
- Environment variable: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
- The selected value stored in `fd.location` should be the full formatted place name (e.g. `"Elmira, NY, USA"`), not just the city

**API key setup:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Places API (New)**
3. Create an API key → Restrict to your domain
4. Add to `.env.local`: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here`

---

### 2b. Senior Portraits — merge ideology into frame step

**Affected step:** `sr-ideology` (remove), `sr-frame` (replace)

**Current behavior:** `sr-ideology` is a read-only wall of three philosophy cards ("Personality first", "Collaboration over direction", "Cinema-quality, made personal") with no interaction. `sr-frame` then asks "What matters most to you?" as a separate step.

**New behavior:** Single step (`sr-frame`) that sells the experience *through* the interaction. Options are rewritten to feel like identity choices, not abstract descriptions. Each option maps to the same `pkgIdx` as before.

**New `SR_FRAMES` options:**

```ts
const SR_FRAMES: Frame[] = [
  {
    label: "Every shot should feel like me.",
    body: "Personality-forward. We build the session around who you are — your energy, your style, your ideas. Not just where to stand.",
    pkgIdx: 1, // Premium
  },
  {
    label: "No limits. Locations, looks, all of it.",
    body: "Unlimited locations, unlimited outfits. A full day built around every side of you — nothing left out.",
    pkgIdx: 2, // Deluxe
  },
  {
    label: "Portraits + athlete identity in one session.",
    body: "Senior portraits and Sportraits combined. Both sides of who you are, captured in one production.",
    pkgIdx: 3, // The Whole Thing
  },
]
```

**Step copy:**
- Headline: `"What kind of session sounds like you?"`
- Sub: `"This isn't just a package question — it's how we build the whole day."`

**Remove:** `sr-ideology` step entirely. Remove from `StepId` type, path builder, and `renderStep` switch.

---

### 2c. Remove vision / moodboard steps from funnel

**Affected steps:** `sp-vision` (Sportraits), `sr-mood` (Senior Portraits)

**Action:** Remove both steps from `StepId` type, path arrays, and `renderStep` switch. The data fields (`fd.vision`, `fd.moodboard`) can stay in the `FD` interface — they'll be populated via the follow-up email system instead.

---

## 3. Pricing Logic

### Media Day — exact pricing from roster size

**Already implemented.** Confirming correct values:

```ts
function calcMdPrice(base: number, extra: number, count: number): string {
  const total = count <= 12 ? base : base + extra * (count - 12)
  const perAthlete = Math.ceil(total / count)
  return `$${total.toLocaleString()} · ~$${perAthlete}/athlete`
}

// Premium: base $900, +$75/athlete over 12
// Deluxe:  base $1,500, +$125/athlete over 12
```

**Pending:** Hide the per-athlete line when count ≤ 12, since the flat rate is what applies and dividing it across a small roster produces a misleadingly high per-athlete number.

```ts
function calcMdPrice(base: number, extra: number, count: number): string {
  if (count <= 12) return `$${base.toLocaleString()}`
  const total = base + extra * (count - 12)
  const perAthlete = extra // per-athlete rate is fixed above 12
  return `$${total.toLocaleString()} · $${perAthlete}/athlete`
}
```

---

## 4. Follow-up Email (Client-Facing)

### Overview

After form submission, send a confirmation email to the client's email address via Resend. This runs alongside the existing notification email already sent to Cole.

### Trigger

`POST /api/book` — after successful validation, send two emails:
1. **Existing:** Notification to `alternate.creative.media@gmail.com` (Cole)
2. **New:** Confirmation to `finalFd.email` (client)

### Client email content

**Subject:** `Your A.C Media booking request — [Service]`

**Body structure:**

```
[Name],

We've got your request. Cole will be in touch within 24 hours to confirm details and lock in a date.

Here's what you submitted:
- Session: [Service + Package]
- Location: [Location]
- Timeline: [Timeline]

---

One last thing — if you have any inspiration for the session, reply to this email with a link,
a Pinterest board, or even just describe the feeling you're going for. No pressure at all —
we can build the whole vision together on the call.

In the meantime, check out more of the work:
→ instagram.com/a_c.media

— Cole
A.C Media
```

**Notes:**
- For Media Day: skip the inspo prompt — coaches don't need it
- For Sportraits/Senior Portraits: include the inspo invite
- Use `react-email` or a plain HTML string template in `route.ts`
- Subject line should include the service: e.g. `"Your A.C Media booking request — Media Day"`

### Environment variables needed

Already present:
```
RESEND_API_KEY=
```

Ensure `from` address is a verified Resend sender domain, not Gmail. The reply-to should be set to `alternate.creative.media@gmail.com` so client replies land in Cole's inbox.

---

## 5. Leave Dialog — Button Fix

**Already implemented.** Confirming:
- "Keep going" = accent color button (dominant, safe action)
- "Leave" = flat/muted button (de-emphasized, destructive)

---

## 6. Services Overview — Marginal Pricing Text

**Already implemented.** Confirming:
- "Media days from $900" — `text-[11px]`, `text-[#555]`, below body copy
- "Senior portraits from $350" — same style
- Not shown for Sportraits (pricing is straightforward and shown in the funnel)

---

## 7. Implementation Order

Recommended order to minimize rework:

1. Remove `sp-vision`, `sr-mood`, `sr-ideology` from funnel *(path cleanup)*
2. Rewrite `SR_FRAMES` with new copy and merged ideology *(one constant update)*
3. Fix `calcMdPrice` to hide per-athlete line under 12 *(one function update)*
4. Set up Google Places API key → build `LocationAutocomplete` component *(new component)*
5. Swap location step to use new component across all three paths *(three step replacements)*
6. Build client-facing confirmation email in `app/api/book/route.ts` *(API route update)*

---

## 8. Open Questions / Not Yet Decided

- **Sportraits frame copy** — `SP_FRAMES` options haven't been rewritten yet. Same opportunity as SR to make them feel like identity choices rather than abstract descriptions.
- **Thank-you screen** — currently shows a summary card and "View our work →". Consider adding the Instagram follow prompt and setting stronger expectation copy ("Cole will reach out within 24 hours — check your email").
- **Progress bar** — with shorter paths, the bar segments are wider and look less like a progress indicator. May want to revisit the visual once paths are trimmed.
