# CLARIX — Ad Playbook (Base44-style short-form video)

Five ready-to-film scripts + production and campaign setup. Format: 15–30s vertical video
(9:16), hook in the first 3 seconds, **real screen recording of CLARIX** as the core, big
auto-captions, one CTA. Make 2–3 hook variants per script; kill losers after ~$20 spend.

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

## A. Veo 3.1 prompts — full 8-second segments (Google Flow · no humans, screen-and-motion only)

Flow generates clips in **8-second blocks**, so every ad below is a chain of full 8s
segments: Seg 1 = 0:00–0:08, Seg 2 = 0:08–0:16, Seg 3 = 0:16–0:24, Seg 4 = 0:24–0:32.
Generate them in order in one Flow project and use **Scenebuilder → Extend** so each
segment continues from the previous one's last frame.

**No people anywhere.** Every visual is either the computer itself, objects on the desk,
or abstract motion graphics. Voice comes from ElevenLabs VO (§B), not on-camera actors.

Tags: `[VEO]` = paste the prompt into Flow. `[SCREEN]` = your real OBS recording of
CLARIX, cut to exactly 8s in CapCut — never generated; no fake UI, ever (that's why the
Veo laptop screens are always described as an unreadable glow). End cards are overlaid
in CapCut on the final segment's last 3–4s.

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

### Script 1 — "The 12-second demo" (4 × 8s = 32s, trim tail to 30s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the mess*: "THE SETUP, but the desk is buried under
  dozens of crumpled paper notes, sticky notes and tangled pen scribbles surrounding the
  closed laptop; a slow 180-degree orbit around the desk while single sheets lift off and
  float upward in slow motion as if gravity is reversing, pages tumbling gently like
  leaves; the closed laptop begins to glow faintly violet along its seam; macro details
  of ink on crumpled paper as they rise; quiet room tone with soft paper rustle and a low
  rising synth hum; begins on the chaotic pile, ends with the last page floating away and
  the laptop lid cracking open one inch, violet light spilling out."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: real recording — drag an audio file into New Meeting
  → upload bar → processing spinner → the summary starts to appear. (Record long in OBS,
  speed to exactly 8s, punch-in on the drop moment.)
- **Seg 3 · 0:16–0:24 · [SCREEN]**: real recording — action items and speakers reveal,
  slow zoom on the action-item count, then open Export → PDF/DOCX menu.
- **Seg 4 · 0:24–0:32 · [VEO]** — *the calm*: "THE SETUP, now on a perfectly clean desk,
  not a single paper left; the laptop closes itself with a soft, satisfying motion and
  the violet seam-glow pulses once like a heartbeat, then settles; the desk lamp dims
  slightly as dusk-blue window light rises in the background; extremely slow push-in
  toward the glowing seam; one soft piano note and a gentle 'click' as the lid closes;
  begins mid-close, ends on a still, glowing, minimal composition with negative space at
  the top for text." → overlay end card "Start free — no credit card" on final 4s.

### Script 2 — "What did we decide?" (3 × 8s = 24s, VO-driven)

- **Seg 1 · 0:00–0:08 · [VEO]** — *voice becomes order*: "A luminous violet audio
  waveform ripples horizontally through a deep ink-black void like a living sound wave,
  chaotic and spiky as overlapping meeting chatter plays faintly; the camera tracks along
  the wave as it gradually untangles, the spikes smoothing and separating into five clean
  horizontal glowing lines stacked like a tidy list, each line locking into place with a
  soft tick; particles of light drift off the wave as it organizes; begins on chaos of
  sound, ends on a perfectly aligned stack of glowing lines."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: real recording — Ask CLARIX chat: type "what did we
  decide?" → the answer streams in with its citation chip; slow zoom on the citation.
- **Seg 3 · 0:16–0:24 · [VEO]** — *night confidence*: "THE SETUP at night, the room
  darker; a steady stream of small glowing violet checkmarks rises slowly from the laptop
  keyboard like fireflies, drifting upward and fading near the top of frame; the screen
  glow breathes softly; static tripod shot, macro depth of field, dust motes in the lamp
  beam; ambient night room tone with a soft chime each time a checkmark leaves the
  keyboard; begins with the first checkmark lifting, ends on three rising together into
  clean negative space." → overlay end card "Free plan — 3 meetings/month" on final 3s.

### Script 3 — "The bot that shows up for you" (4 × 8s = 32s, trim to 30s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the empty chair*: "An empty modern conference room at
  soft morning light, ten empty chairs around a long table; at the head of the table a
  slim dark laptop opens by itself with smooth deliberate motion, its screen waking to an
  unreadable soft violet glow; a small pulsing violet dot of light breathes on its lid
  like a listening indicator; slow dolly forward down the length of the table toward the
  laptop; faint muffled meeting audio begins as the lid opens; begins wide on the empty
  room, ends close on the glowing, listening laptop."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: real recording — Settings → Automation → connect
  calendar → the auto-join toggle flips ON; zoom on the toggle.
- **Seg 3 · 0:16–0:24 · [SCREEN]**: real recording — dashboard filling with completed
  meetings, the action-items badge counting up, open one finished recap.
- **Seg 4 · 0:24–0:32 · [VEO]** — *work done by itself*: "THE SETUP at sunrise, warm
  golden window light sweeping slowly across the desk; beside the laptop a neat stack of
  paper settles perfectly into alignment on its own, corner by corner, and a steaming
  coffee cup sits untouched, steam curling in the light; the laptop's violet seam-glow
  gives one calm pulse; locked-off tripod shot, time-lapse feel on the moving light but
  slow motion on the steam; soft morning ambience and one warm piano chord; begins on the
  light entering frame, ends on the serene finished composition." → end card "Every paid
  plan starts with a 14-day free trial" on final 4s.

### Script 4 — "Ask your meetings anything" (3 × 8s = 24s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the archive collapses*: "A towering, precarious stack
  of paper notebooks, legal pads and sticky notes in a dark studio, lit by a single hard
  spotlight; the tower slowly leans and collapses in extreme slow motion, pages exploding
  outward and hanging in mid-air like a frozen blast, ink scribbles visible but
  unreadable; the camera performs a slow vertical crane up through the suspended pages;
  as it rises the pages begin dissolving into fine violet particles that stream downward
  toward a slim dark laptop resting at the base, its screen glowing softly; deep
  sub-bass rumble on the collapse, then airy silence with a rising shimmer; begins on the
  teetering tower, ends on particles funneling into the glowing laptop."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: real recording — Ask CLARIX: type "What did we
  promise the client?" → cited answer streams in.
- **Seg 3 · 0:16–0:24 · [SCREEN]**: real recording — type "Show all action items due
  this week" → the list appears → hover an item. → end card "Start free. Your next
  meeting is the demo." on final 3s.

### Script 5 — "The cost of forgetting" (4 × 8s = 32s, trim to 30s)

- **Seg 1 · 0:00–0:08 · [VEO]** — *the forgotten note*: "A single blank sticky note on
  the edge of a dark computer monitor in a dim, empty office at night; the note's corner
  slowly peels, releases, and the note drifts to the carpet in extreme slow motion,
  tumbling once; a hard single desk-lamp spotlight cuts through darkness, dust motes
  hanging in the beam; macro tracking shot following the note down; one low sustained
  cello note and the faint hum of sleeping electronics; begins as the corner lifts, ends
  as the note settles face-down on the floor and the monitor's standby light blinks."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: real recording — meeting page → action items with
  owners and due dates highlighted; slow zoom across the owner names.
- **Seg 3 · 0:16–0:24 · [SCREEN]**: real recording — push an action item to Notion → cut
  to it appearing inside Notion.
- **Seg 4 · 0:24–0:32 · [VEO]** — *nothing falls anymore*: "A grid of small glowing
  paper-white task cards floats in a deep ink-black void, slightly scattered and tilted;
  one by one they snap into a perfect aligned grid with soft magnetic clicks, and as each
  locks in, a violet checkmark blooms on its face; the final card pulses brighter and the
  whole grid gently recedes into clean negative space; precise, minimal motion-design
  feel, satisfying tactile click sounds over a calm synth pad; begins on the scattered
  cards, ends on the completed glowing grid centered in frame." → end card "Try Pro free
  for 14 days" on final 4s.

## B. Voiceover scripts (ElevenLabs — no on-camera humans)

The ads are human-free, so these run as **voiceover only** over the Veo motion segments
and screen recordings. Generate in ElevenLabs (pick one consistent voice for the whole
brand; conversational read, small pauses at [beat]).

**Script 2 — "What did we decide?" (casual, deadpan, 24s):**
"POV: you zoned out for the entire meeting… and it didn't matter. [beat] This AI listened
to the whole thing, wrote the recap, and found the seven things I was supposed to do.
[cut to real screen demo] I just asked it 'what did we decide?' — and it answered. With
receipts. [beat] It's called CLARIX. The free plan covers three meetings a month. Try it
on your next call."

Hook variants (swap first line, keep body):
- "I stopped paying attention in meetings and my boss thinks I got promoted-level organized."
- "Nobody at work knows I haven't taken a note since March."

**Script 5 — B2B pain (serious, direct, 30s):**
"That action item you forgot? It cost you the renewal. [beat] Most follow-ups die in
someone's notebook. [cut to real screen demo] CLARIX catches every commitment in every
meeting — who owns it, when it's due — and pushes it straight into Notion. Automatically.
[beat] Teams run on CLARIX Pro. Try it free for fourteen days."

Hook variants:
- "Your client remembers what you promised. Do you?"
- "The most expensive sentence in business: 'I thought someone else was handling that.'"

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
