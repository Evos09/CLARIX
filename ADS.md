# CLARIX — Ad Playbook (Base44-style short-form video)

Five ready-to-film scripts + production and campaign setup. Format: **15 seconds**, vertical
9:16, hook in the first 2 seconds, **real screen recording of CLARIX** as the core, big
auto-captions, one CTA. 15s = higher completion rates on Reels/TikTok and fits YouTube's
non-skippable slot. Make 2–3 hook variants per script; kill losers after ~$20 spend.

**Honesty rule (non-negotiable):** every demo shot is the real product doing real things.
No faked speed-ups without a "sped up" label, no invented stats, no fake testimonials.

**Prerequisite:** set `NEXT_PUBLIC_META_PIXEL_ID` (+ optionally `NEXT_PUBLIC_POSTHOG_KEY`)
in Railway so conversions (signup / checkout / subscribe) are measurable. Optimize Meta
campaigns for **CompleteRegistration** first; switch to **Subscribe** once you have volume.

---

## Script 1 — "The 12-second demo" (hero ad, screen-record only)

- **Hook (0–3s)** — text overlay: **"Your meeting notes are already done."** VO: "I haven't
  taken meeting notes in months."
- **Demo (3–18s)** — screen recording: drag an audio file into CLARIX → processing →
  summary, action items, and speakers appear. VO: "Drop in any meeting. CLARIX writes the
  summary, pulls every action item, and tags who said what."
- **Payoff (18–25s)** — click Export → PDF/DOCX; click an action item. VO: "Then it exports
  anywhere you work."
- **CTA (25–30s)** — overlay: **"Start free — no credit card."** VO: "Try it free on your
  next meeting."

## Script 2 — "POV" (UGC / AI-actor talking head)

- **Hook** — actor, deadpan: "POV: you zoned out for the entire meeting and it didn't matter."
- **Body** — cut to screen: CLARIX summary + action items of a real call. Actor VO: "This
  AI listened, wrote the recap, and found the 7 things I was supposed to do."
- **Proof beat** — show Ask CLARIX chat: type "what did we decide?" → answer appears.
- **CTA** — "It's called CLARIX. The free plan covers 3 meetings a month."

## Script 3 — "The bot that shows up for you" (auto-join feature)

- **Hook** — text: **"I sent a robot to my 9am."** VO: "I stopped joining half my meetings."
- **Body** — screen: Settings → connect calendar → auto-join toggle ON. VO: "CLARIX joins
  Zoom, Meet, or Teams for me, records, and writes the recap before I've finished my coffee."
- **Payoff** — dashboard filling with completed meetings + action-item count.
- **CTA** — "Every paid plan starts with a 14-day free trial."

## Script 4 — "Ask your meetings anything" (chat feature)

- **Hook** — text: **"I have a search engine for everything ever said in my meetings."**
- **Body** — screen: Ask CLARIX. Type real questions — "What did we promise the client?" /
  "Show all action items due this week" — answers with citations appear.
- **Payoff** — VO: "It answers from your actual transcripts, with receipts."
- **CTA** — "Start free. Your next meeting is the demo."

## Script 5 — "The cost of forgetting" (pain-first, B2B/LinkedIn angle)

- **Hook** — text: **"That action item you forgot cost you the renewal."** VO: "Most
  follow-ups die in someone's notebook."
- **Body** — screen: meeting → action items extracted → owner + due date → pushed to Notion.
- **Payoff** — VO: "CLARIX catches every commitment in every meeting — automatically."
- **CTA** — "Teams run on CLARIX Pro. Try it free for 14 days."

---

## Production (cheap + fast)

1. **Screen recording:** OBS (free) at 1080p. Record the *live product* on clean demo data.
   Crop to phone-frame in edit. Speed up waits and label "sped up".
2. **Edit:** CapCut — auto-captions on (most viewers are muted), punch-in zooms on the
   summary appearing, sound effect on the action-items count.
3. **UGC actors:** Arcads or Creatify for Script 2/5 variants (script in → actor video out).
   Voiceover: ElevenLabs. Keep every claim matching the live product.
4. **Volume:** 5 scripts × 2–3 hooks = 10–15 creatives. Refresh hooks weekly; keep winners.

## Campaign setup

| | |
|---|---|
| Channels | Meta (Advantage+ / broad) + TikTok first; LinkedIn later for Script 5 |
| Budget | $20–30/day total to start |
| Destination | Homepage (or `/pricing` for Scripts 3/5) with UTMs, e.g. `?utm_source=meta&utm_campaign=demo12s` |
| Optimize for | CompleteRegistration → later Subscribe |
| Kill rule | No signups after ~$20 on a creative → pause it |
| North star | Cost per free signup, then free→trial→paid rate (PostHog funnel) |

**Before spending a dollar:** custom domain live, Stripe live (checkout tested), pixel firing
(check Meta Events Manager), and one full happy-path test as a brand-new user.

---
---

# Copy-paste production assets

## A. Veo 3.1 prompts — 15-second ads (Google Flow · no humans, screen-and-motion only)

Every ad is **exactly 15 seconds**, built from two segments:

- **Seg 1 · 0:00–0:08 · [VEO]** — one full 8-second Flow generation (Veo's native block).
- **Seg 2 · 0:08–0:15 · [SCREEN]** — your real OBS recording of CLARIX, cut to 7s in
  CapCut — never generated; no fake UI, ever (that's why the Veo laptop screens are
  always described as an unreadable glow).
- **End card** — overlaid in CapCut on the final 3s of Seg 2 (violet #6D28D9 bar or full
  card, logo, CTA) — no third clip needed.

**No people anywhere.** Every visual is either the computer itself, objects on the desk,
or abstract motion graphics. Voice comes from ElevenLabs VO (§B), not on-camera actors.

**Continuity trick:** Veo has no memory between prompts, so the recurring environment is
described identically in every segment. Reuse this exact sentence wherever "THE SETUP"
appears:

> a slim dark laptop centered on a minimal light-oak desk in a dark studio, deep
> ink-black background, one warm desk lamp on the left, a soft violet accent glow coming
> from the laptop screen

**Style block — prepend to every Veo prompt:**

> Vertical 9:16 commercial advertisement footage, premium SaaS motion-design aesthetic,
> cinematic studio lighting, shallow depth of field, palette of deep ink-black and warm
> paper-white with a single violet accent (#6D28D9 feel), no people, no hands, no faces,
> no on-screen text, no logos, no readable screen content.

### Script 1 — "The 12-second demo" (15s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the mess lifts*: "THE SETUP, but the desk is buried
  under dozens of crumpled paper notes, sticky notes and tangled pen scribbles
  surrounding the closed laptop; a slow half-orbit around the desk while single sheets
  lift off and float upward in slow motion as if gravity is reversing, pages tumbling
  gently like leaves; the closed laptop glows faintly violet along its seam, and in the
  final second the lid cracks open one inch, violet light spilling out as the last page
  floats away; macro details of ink on crumpled paper; quiet room tone with soft paper
  rustle and a low rising synth hum; begins on the chaotic pile, ends on the opening lid."
- **Seg 2 · 0:08–0:15 · [SCREEN]**: real recording, sped to 7s — drag an audio file into
  New Meeting → processing → summary and action items appear; punch-in zoom on the
  action-item count. → end card **"Start free — no credit card"** over the final 3s.

### Script 2 — "What did we decide?" (15s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *voice becomes order*: "A luminous violet audio
  waveform ripples horizontally through a deep ink-black void like a living sound wave,
  chaotic and spiky as overlapping muffled meeting chatter plays; the camera tracks along
  the wave as it untangles, spikes smoothing and separating into five clean horizontal
  glowing lines stacked like a tidy list, each line locking into place with a soft tick
  as the chatter falls silent; particles of light drift off the wave as it organizes;
  begins on the chaos of sound, ends on a perfectly aligned stack of glowing lines."
- **Seg 2 · 0:08–0:15 · [SCREEN]**: real recording, 7s — Ask CLARIX chat: type "what did
  we decide?" → the answer streams in with its citation chip; zoom on the citation.
  → end card **"Free plan — 3 meetings/month"** over the final 3s.

### Script 3 — "The bot that shows up for you" (15s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the empty chair*: "An empty modern conference room in
  soft morning light, ten empty chairs around a long table; at the head of the table a
  slim dark laptop opens by itself with smooth deliberate motion, its screen waking to an
  unreadable soft violet glow, a small violet dot breathing on its lid like a listening
  indicator; slow dolly forward down the length of the table toward the laptop as faint
  muffled meeting audio fades in; begins wide on the empty room, ends close on the
  glowing, listening laptop."
- **Seg 2 · 0:08–0:15 · [SCREEN]**: real recording, 7s — Settings → Automation →
  auto-join toggle flips ON → quick cut to the dashboard with completed meetings and the
  action-items badge counting up. → end card **"14-day free trial"** over the final 3s.

### Script 4 — "Ask your meetings anything" (15s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the archive collapses*: "A towering, precarious stack
  of paper notebooks, legal pads and sticky notes in a dark studio under a single hard
  spotlight; the tower leans and collapses in extreme slow motion, pages exploding
  outward and hanging frozen in mid-air, ink scribbles visible but unreadable; a slow
  vertical crane up through the suspended pages as they dissolve into fine violet
  particles streaming down into a slim dark laptop at the base, its screen glowing
  softly; deep sub-bass rumble on the collapse, then airy silence with a rising shimmer;
  begins on the teetering tower, ends on particles funneling into the laptop."
- **Seg 2 · 0:08–0:15 · [SCREEN]**: real recording, 7s — Ask CLARIX: type "What did we
  promise the client?" → cited answer streams in.
  → end card **"Start free. Your next meeting is the demo."** over the final 3s.

### Script 5 — "The cost of forgetting" (15s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the forgotten note*: "A single blank sticky note on
  the edge of a dark computer monitor in a dim, empty office at night; the note's corner
  slowly peels, releases, and the note drifts to the carpet in extreme slow motion,
  tumbling once through a hard desk-lamp spotlight with dust motes hanging in the beam;
  macro tracking shot following the note down; one low sustained cello note over the
  faint hum of sleeping electronics; begins as the corner lifts, ends as the note settles
  face-down and the monitor's standby light blinks once."
- **Seg 2 · 0:08–0:15 · [SCREEN]**: real recording, 7s — meeting page: action items with
  owners and due dates highlighted → push one to Notion → it appears in Notion.
  → end card **"Try Pro free for 14 days"** over the final 3s.

## B. Voiceover scripts — 15 seconds each (ElevenLabs — no on-camera humans)

Voiceover only, laid over the Veo segment (0:00–0:08) and screen segment (0:08–0:15).
One consistent ElevenLabs voice across all ads; conversational read, small pause at
[beat]. ~35 words ≈ 15 seconds — don't add more.

**Script 1:** "Stop taking meeting notes. [beat] Drop any meeting into CLARIX — the
summary, the action items, who said what… done in seconds. [beat] Start free. No credit
card."

**Script 2:** "Zoned out for the whole meeting? Doesn't matter. [beat] Ask CLARIX 'what
did we decide?' — and it answers. With receipts. [beat] Free for three meetings a month."

**Script 3:** "Stop showing up to meetings. [beat] CLARIX joins Zoom, Meet, or Teams for
you — and the recap is written before it ends. [beat] Try it free for fourteen days."

**Script 4:** "Everything ever said in your meetings — searchable. [beat] Ask what you
promised, what's due, what was decided. It answers with proof. [beat] Start free. Your
next meeting is the demo."

**Script 5:** "That action item you forgot cost you the renewal. [beat] CLARIX catches
every commitment — owner, deadline — and pushes it to Notion automatically. [beat] Try
Pro free for fourteen days."

Hook variants (swap the first sentence, keep the rest):
- S1: "Your meeting notes are already done."
- S2: "Nobody at work knows I haven't taken a note since March."
- S3: "I sent a robot to my 9am."
- S5: "Your client remembers what you promised. Do you?"

## C. Google Ads — Search campaign (start here on Google, not video)

**Campaign:** Search · conversion goal = sign-ups (CompleteRegistration) · start $15–20/day.

**Keywords (phrase match):** "ai meeting notes", "ai note taker", "meeting transcription
software", "ai meeting assistant", "meeting summary ai", "zoom meeting transcription",
"otter alternative", "fireflies alternative", "automatic meeting minutes".
**Negative keywords:** jobs, salary, course, tutorial, "how to become".

**Headlines (≤30 chars each — Google enforces this):**
1. AI Meeting Notes in Seconds
2. Never Take Meeting Notes Again
3. Your Meetings, Handled
4. Summary + Action Items, Fast
5. Auto-Join Bot for Zoom & Meet
6. Ask AI About Any Meeting
7. Free AI Meeting Assistant
8. Meeting Recaps on Autopilot
9. From Audio to Action Items
10. Start Free — 3 Meetings/Mo
11. 14-Day Free Trial on Pro
12. Stop Writing Meeting Notes

**Descriptions (≤90 chars each):**
1. Upload any meeting. Get a summary, action items & speakers in seconds. Start free.
2. CLARIX transcribes, summarizes & extracts every commitment. Free plan, no card needed.
3. Auto-join bot for Zoom, Meet & Teams. Recaps ready before you're back at your desk.
4. Ask AI anything about your meetings — decisions, owners, deadlines. Try it free.

**Final URL:** homepage with `?utm_source=google&utm_medium=cpc&utm_campaign=search-core`.
