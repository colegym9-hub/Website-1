/**
 * Default plain-text bodies (A.C Media warm tier) for admin template editor + seed API.
 * Tokens: [[merge:firstName]], {{prepUrl}}, [[link:Label|url]]
 */

import type { SupabaseClient } from "@supabase/supabase-js"

export type WarmTierSeed = { subject: string; body_plain: string }

const MD_E1 = `Hey [[merge:firstName]],

Most programs do a media day and walk away with a folder of headshots. Stiff poses, forced smiles, forgotten by the end of the season.

That's not what I do.

Every media day I run has four parts built around one goal: giving your athletes something they actually want to look at.

The standard shot. Every athlete gets one clean, consistent portrait. Simple, sharp, something their parents will love and the program can use anywhere.

The choice shot. This is where it gets personal. Each athlete picks their own pose. Their personality, their sport, their moment. No two look the same. This is usually the one they post.

Group shots. Teammates together. These are the ones they look back on ten years from now and remember the season by.

The team photo. The whole program, done right. Sometimes traditional, sometimes creative depending on the vibe of the group.

The whole shoot runs like a production, not a portrait session. Athletes move through, energy stays high, and by the end of it the photos actually reflect who they are.

Send this to your athletes before shoot day. These are the tips that will make the day 10x smoother and get them better photos.

[[link:Send your athletes this →|{{prepUrl}}]]

Cole @ A.C Media`

const MD_E2 = `Hey [[merge:firstName]],

As of 2025 the media day content coming out of my shoots has generated over 5 million views across social media.

That number gets asked about a lot. Here's the honest answer.

Media day photography is one of the most niche corners of this industry. Most photographers have never done one. The ones who have usually treat it like a standard portrait session with a jersey on. The result is what you've probably seen before. Flat. Generic. Forgettable.

What I do is different because it has to be. Running 30 athletes through a four hour shoot, keeping energy up, pulling personality out of someone you met four minutes ago, and still producing photos that stop people mid scroll on Instagram requires a completely different skill set than normal portrait work.

That's what 70 media days builds. Not just a process. A specific, rare ability to make athletes look like the version of themselves they actually want people to see.

That's why the photos perform. And that's what your program gets.

[[link:See the work →|{{workUrl}}]]

Cole @ A.C Media`

const MD_E3 = `Hey [[merge:firstName]],

Is a media day this season still on the table?

Yes or no works.

Cole @ A.C Media`

const SR_E1 = `Hey [[merge:firstName]],

Senior portraits done wrong feel like a school photo with a better backdrop. Stiff, forgettable, nothing that actually looks like you.

That's not what we're doing.

Every session I run is collaborative. You bring ideas, references, outfits, locations you're drawn to. I bring the eye, the setup, and the ability to pull out a version of you that actually feels right. We figure it out together as we go.

I was a senior not long ago. I know what it feels like to sit in front of a camera and not know what to do with your hands. That's why I run these differently. The goal isn't to get through a shot list. It's to make something that actually looks like you and feels like something worth keeping.

By the end of it most people are surprised by how natural it felt.

Here's what that actually looks like in practice.

[[link:See the work →|{{workUrl}}]]

Cole @ A.C Media`

const SR_E2 = `Hey [[merge:firstName]],

A couple things past clients have said after their sessions.

"I was blown away when I saw my photos. You can clearly see Cole took his time on every photo and took pride into every aspect of editing." Dom Weed, Senior and Baseball

"AC is the premier photographer in the area and he won't let you down. He does great work." Jack Nolan, Senior Portraits

That's what the goal is every single time. Not just good photos. Photos you're proud of and an experience worth talking about.

If you're still figuring out whether this is the right fit, reply and ask me anything. I'd rather answer your questions now than have you second guess it later.

Cole @ A.C Media`

const SR_E3 = `Hey [[merge:firstName]],

Is a senior portrait session still on your radar?

Yes or no works.

Cole @ A.C Media`

const SP_E1 = `Hey [[merge:firstName]],

The easiest way to explain a Sportraits session is a personalized media day built entirely around one athlete.

No roster to move through. No clock counting down. Just your sport, your personality, and enough time to actually get creative with it.

We do action shots, sport specific setups, individual portraits, whatever makes sense for what you play and how you want to be seen. I bring the lighting, the setup, and the eye. You bring the energy and the ideas. We build the rest together.

This is the session for an athlete who wants photos that actually capture who they are while they're in it. Not a yearbook photo. Not a quick headshot. Something that looks like you at your best in the sport you've given everything to.

Here's what that looks like in practice.

[[link:See the work →|{{workUrl}}]]

Cole @ A.C Media`

const SP_E2 = `Hey [[merge:firstName]],

Two things past clients have said after their sessions.

"I was blown away when I saw my photos. You can clearly see Cole took his time on every photo and took pride into every aspect of editing." Dom Weed, Senior and Baseball

"I kept saying omg that's my favorite but then the photos just kept getting better and better and they were all my favorites, we were amazed." Mackenzie Chamberlain, Track and Lifting

That's the standard every session gets held to.

Both Dom and Mackenzie did The Whole Thing package, which combines a Sportraits session with senior portraits across two shoot days. If you're a senior athlete who wants both, it's worth knowing that option exists.

[[link:See Mackenzie's full session →|{{mackenzieUrl}}]]

Cole @ A.C Media`

const SP_E3 = `Hey [[merge:firstName]],

Is a Sportraits session still on your radar?

Yes or no works.

Cole @ A.C Media`

const RECYCLE = `Hey [[merge:firstName]],

Just checking in — is this still something you're thinking about?

A quick yes or no is totally fine.

Cole @ A.C Media`

export const WARM_TIER_SEEDS: Record<string, WarmTierSeed> = {
  "media-day::md_email1": {
    subject: "What your athletes actually walk away with.",
    body_plain: MD_E1,
  },
  "media-day::md_email2": {
    subject: "Most media day photos get ignored. Here's why mine don't.",
    body_plain: MD_E2,
  },
  "media-day::md_email3": {
    subject: "Still thinking it over?",
    body_plain: MD_E3,
  },
  "media-day::recycle_checkin": { subject: "Still on your radar?", body_plain: RECYCLE },

  "senior-portraits::sr_email1_parent": {
    subject: "What your session actually feels like.",
    body_plain: SR_E1,
  },
  "senior-portraits::sr_email1_senior": {
    subject: "What your session actually feels like.",
    body_plain: SR_E1,
  },
  "senior-portraits::sr_email2": {
    subject: "What other seniors have said.",
    body_plain: SR_E2,
  },
  "senior-portraits::sr_email3": {
    subject: "Still thinking it over?",
    body_plain: SR_E3,
  },
  "senior-portraits::recycle_checkin": { subject: "Still on your radar?", body_plain: RECYCLE },

  "sportraits::sp_email1": {
    subject: "What a Sportraits session actually is.",
    body_plain: SP_E1,
  },
  "sportraits::sp_email2": {
    subject: "What other athletes have said.",
    body_plain: SP_E2,
  },
  "sportraits::sp_email3": {
    subject: "Still thinking it over?",
    body_plain: SP_E3,
  },
  "sportraits::recycle_checkin": { subject: "Still on your radar?", body_plain: RECYCLE },
}

export function warmTierSeedKey(service: string, template_key: string): string {
  return `${service}::${template_key}`
}

export function getWarmTierSeed(service: string, template_key: string): WarmTierSeed | null {
  return WARM_TIER_SEEDS[warmTierSeedKey(service, template_key)] ?? null
}

export function allWarmTierSeedRows(): Array<
  WarmTierSeed & { service: string; template_key: string }
> {
  return Object.entries(WARM_TIER_SEEDS).map(([k, v]) => {
    const [service, template_key] = k.split("::") as [string, string]
    return { service, template_key, ...v }
  })
}

/**
 * Seeds DB rows that are missing body content (insert or update empty rows only; never overwrites non-empty bodies).
 */
export async function ensureWarmTierSeedsInDatabase(admin: SupabaseClient): Promise<void> {
  const now = new Date().toISOString()
  for (const row of allWarmTierSeedRows()) {
    const { data: existing } = await admin
      .from("email_templates")
      .select("id, body_plain, body_html")
      .eq("service", row.service)
      .eq("template_key", row.template_key)
      .maybeSingle()

    const hasContent = Boolean(existing?.body_plain?.trim() || existing?.body_html?.trim())
    if (hasContent) continue

    const payload = {
      subject: row.subject,
      body_plain: row.body_plain,
      body_html: "",
      active: true,
      updated_at: now,
    }

    if (existing?.id) {
      await admin.from("email_templates").update(payload).eq("id", existing.id)
    } else {
      await admin.from("email_templates").insert({
        service: row.service,
        template_key: row.template_key,
        ...payload,
      })
    }
  }
}
