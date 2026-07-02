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

## A. Veo 3.1 prompts — full 8-second segments (Google Flow)

Flow generates clips in **8-second blocks**, so every ad below is a chain of full 8s
segments: Seg 1 = 0:00–0:08, Seg 2 = 0:08–0:16, Seg 3 = 0:16–0:24, Seg 4 = 0:24–0:32.
Generate them in order in one Flow project and use **Scenebuilder → Extend** so each
segment continues from the previous one's last frame.

Tags: `[VEO]` = paste the prompt into Flow. `[SCREEN]` = your real OBS recording of
CLARIX, cut to exactly 8s in CapCut — never generated; no fake UI, ever. `[ARCADS]` =
actor clip from §B. End cards are overlaid in CapCut on the final segment's last 3–4s.

**Continuity trick:** Veo has no memory between prompts, so the recurring character is
described identically in every segment. Reuse this exact sentence wherever "THE LEAD"
appears:

> a professional woman in her early 30s with shoulder-length dark hair, wearing a
> rust-colored blazer over a cream top

**Style block — prepend to every Veo prompt:**

> Vertical 9:16 commercial advertisement footage, cinematic lighting, shallow depth of
> field, premium SaaS brand aesthetic, muted palette with deep ink-black and soft warm
> paper tones and a single violet accent, no on-screen text, no logos, no readable
> screen content.

### Script 1 — "The 12-second demo" (4 × 8s = 32s, trim tail to 30s)

- **Seg 1 · 0:00–0:08 · [VEO]**: "THE LEAD sits at a modern office desk at dusk
  surrounded by scattered handwritten notes, rubbing her eyes, visibly drained; she
  decisively closes her laptop, leans back and exhales with relief; slow push-in from
  medium to close-up, warm window light with city bokeh, calm ambient office sound;
  begins on the chaos of notes, ends on her relaxed face."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: drag an audio file into New Meeting → processing
  spinner → summary begins to appear. (Record long in OBS; speed to exactly 8s.)
- **Seg 3 · 0:16–0:24 · [SCREEN]**: action items + speakers revealed, punch-in zoom,
  then click Export → PDF/DOCX menu.
- **Seg 4 · 0:24–0:32 · [VEO]**: "THE LEAD walks out of a glass office building at
  golden hour holding a coffee, unhurried and smiling faintly, phone away in her pocket;
  camera tracks alongside then slows to let her walk ahead; warm sun flare, relaxed
  end-of-day mood, soft ambient street sound; begins at the door, ends wide as she walks
  into the light." → overlay end card "Start free — no credit card" on final 4s.

### Script 2 — "POV" (3 × 8s = 24s)

- **Seg 1 · 0:00–0:08 · [ARCADS]**: actor hook + first line (§B, Script 2).
- **Seg 2 · 0:08–0:16 · [SCREEN]**: Ask CLARIX chat — type "what did we decide?" →
  answer appears with the citation chip.
- **Seg 3 · 0:16–0:24 · [ARCADS]**: actor close ("It's called CLARIX… free plan covers
  three meetings a month.") → overlay end card "Free plan — 3 meetings/month" on final 3s.

### Script 3 — "The bot that shows up for you" (4 × 8s = 32s, trim to 30s)

- **Seg 1 · 0:00–0:08 · [VEO]**: "THE LEAD stands up mid-discussion in a glass
  conference room full of seated colleagues and walks out calmly and confidently in slow
  motion; sunlight flares through the glass wall as she passes; colleagues keep talking,
  unbothered; empowering cinematic mood, soft whoosh as she crosses the doorway; begins
  seated at the table, ends mid-stride into the bright hallway."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: Settings → Automation → connect calendar →
  auto-join toggle flips ON.
- **Seg 3 · 0:16–0:24 · [SCREEN]**: dashboard filling with completed meetings, action
  items badge counting up, open one recap.
- **Seg 4 · 0:24–0:32 · [VEO]**: "THE LEAD sits at a sunny kitchen table lifting a
  steaming coffee cup, reading nothing, completely at ease; slow lateral dolly, morning
  birdsong and soft piano, relaxed weekend atmosphere; begins on the cup rising, ends on
  her satisfied sip looking out the window." → end card "14-day free trial" on final 4s.

### Script 4 — "Ask your meetings anything" (3 × 8s = 24s)

- **Seg 1 · 0:00–0:08 · [VEO]**: "Macro close-up of a man's hands flipping frantically
  through a messy paper notebook crammed with scribbles and sticky tabs; loose pages
  slide off the desk in slow motion; handheld nervous energy, rustling paper and a
  ticking clock; begins mid-flip, ends on a page drifting to the floor."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: Ask CLARIX — type "What did we promise the client?"
  → answer with citations.
- **Seg 3 · 0:16–0:24 · [SCREEN]**: type "Show all action items due this week" → list
  appears → hover an item. → end card "Start free. Your next meeting is the demo." on
  final 3s.

### Script 5 — "The cost of forgetting" (4 × 8s = 32s, trim to 30s)

- **Seg 1 · 0:00–0:08 · [VEO]**: "A blank sticky note peels off the edge of a computer
  monitor in a dim empty office at night and drifts to the floor in extreme slow motion;
  single dramatic desk-lamp spotlight, dust motes in the beam, one low sustained cello
  note; begins as the corner lifts, ends as it settles on the carpet."
- **Seg 2 · 0:08–0:16 · [SCREEN]**: meeting page → action items extracted with owners
  and due dates highlighted.
- **Seg 3 · 0:16–0:24 · [SCREEN]**: push an action item to Notion → cut to it appearing
  inside Notion.
- **Seg 4 · 0:24–0:32 · [ARCADS]**: actor close ("Teams run on CLARIX Pro. Try it free
  for fourteen days.") → end card "Try Pro free for 14 days" on final 4s.

## B. Arcads / AI-actor scripts (verbatim VO)

**Script 2 — POV (casual, deadpan, 25s):**
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
