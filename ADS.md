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

## A. Veo 3.1 prompts — segmented shot list (every clip ≤8s)

Veo generates max-8-second clips, so each ad below is broken into numbered segments.
`[VEO]` = generate with the prompt (written as a complete 8-second arc; trim to the listed
length in CapCut). `[SCREEN]` = your real OBS recording — never Veo; no fake UI, ever.
`[CARD]` = end card built in CapCut (violet #6D28D9, logo, CTA text).

Prepend this style block to **every** Veo prompt (each generation is independent):

> Vertical 9:16 commercial advertisement footage, cinematic lighting, shallow depth of
> field, premium SaaS brand aesthetic, muted palette with deep ink-black and soft warm
> paper tones and a single violet accent, no text, no logos, no visible screen content.

### Script 1 — "The 12-second demo" (30s total)

- **Seg 1 · 0–3s · [VEO]** (generate 8s, trim to 3): "8-second shot: slow push-in on a
  tired professional at a modern office desk at dusk; they close their laptop, lean back
  and exhale with relief; warm window light, city bokeh behind, calm ambient office sound;
  begins mid-push-in, ends on their relaxed face."
- **Seg 2 · 3–11s · [SCREEN]**: drag audio file into New Meeting → processing spinner.
- **Seg 3 · 11–18s · [SCREEN]**: summary + action items + speakers appear; punch-in zoom.
- **Seg 4 · 18–23s · [SCREEN]**: click Export → PDF/DOCX menu; click an action item.
- **Seg 5 · 23–26s · [VEO]** (generate 8s, trim to 3): "8-second overhead shot of a clean
  desk: steaming coffee cup, closed notebook with pen never opened; morning light slides
  slowly across the desk; subtle ticking clock, serene mood; static camera, no people."
- **Seg 6 · 26–30s · [CARD]**: "Start free — no credit card."

### Script 2 — "POV" (25s total, Arcads actor carries it)

- **Seg 1 · 0–6s · [ARCADS]**: actor hook line (see §B).
- **Seg 2 · 6–9s · [VEO]** (generate 8s, trim to 3): "8-second medium shot of a bored
  professional in a video-call meeting nodding politely while their eyes slowly drift to
  the window; soft office lighting, gentle comedic tone, muffled meeting chatter; begins
  on the nod, ends on the distant stare."
- **Seg 3 · 9–17s · [SCREEN]**: Ask CLARIX chat — type "what did we decide?" → answer.
- **Seg 4 · 17–23s · [ARCADS]**: actor close ("It's called CLARIX…").
- **Seg 5 · 23–25s · [CARD]**: "Free plan — 3 meetings/month."

### Script 3 — "The bot that shows up for you" (30s total)

- **Seg 1 · 0–5s · [VEO]** (generate 8s, trim to 5): "8-second slow-motion shot of a
  confident professional standing up and walking out of a glass conference room while
  colleagues remain seated in discussion; sunlight flares through the glass as they pass;
  empowering cinematic mood, soft whoosh; begins seated, ends mid-stride out the door."
- **Seg 2 · 5–13s · [SCREEN]**: Settings → connect calendar → auto-join toggle ON.
- **Seg 3 · 13–20s · [SCREEN]**: dashboard with completed meetings + action-item badge.
- **Seg 4 · 20–26s · [VEO]** (generate 8s, trim to 6): "8-second close-up of a steaming
  coffee cup being lifted and sipped at a sunny kitchen table; relaxed weekend-morning
  atmosphere, birdsong and soft piano; begins on the cup at rest, ends mid-sip."
- **Seg 5 · 26–30s · [CARD]**: "Every paid plan starts with a 14-day free trial."

### Script 4 — "Ask your meetings anything" (25s total)

- **Seg 1 · 0–4s · [VEO]** (generate 8s, trim to 4): "8-second macro shot of hands
  flipping frantically through a messy paper notebook full of scribbles; loose pages slide
  off the desk; frustrated energy, quick handheld movement, rustling paper sound; begins
  mid-flip, ends as a page falls."
- **Seg 2 · 4–12s · [SCREEN]**: Ask CLARIX — "What did we promise the client?" → answer.
- **Seg 3 · 12–20s · [SCREEN]**: "Show all action items due this week" → cited answer.
- **Seg 4 · 20–25s · [CARD]**: "Start free. Your next meeting is the demo."

### Script 5 — "The cost of forgetting" (30s total)

- **Seg 1 · 0–4s · [VEO]** (generate 8s, trim to 4): "8-second slow-motion shot of a blank
  sticky note peeling off the edge of a computer monitor and drifting to the office floor;
  dramatic single spotlight in a dim office, quiet tension, one low cello note; begins as
  the corner lifts, ends as it lands."
- **Seg 2 · 4–12s · [SCREEN]**: meeting page → action items with owners extracted.
- **Seg 3 · 12–20s · [SCREEN]**: push action item to Notion → it appears in Notion.
- **Seg 4 · 20–26s · [ARCADS]** (or VO over screen): "Teams run on CLARIX Pro…"
- **Seg 5 · 26–30s · [CARD]**: "Try Pro free for 14 days."

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
