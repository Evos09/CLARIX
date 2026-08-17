# Launch-day measurement (PostHog)

The point of instrumenting the launch is to answer one question by the end of
the day: **where do strangers fall out?** Everything below exists to separate
the failure modes, because they demand opposite responses.

- Lots of visitors, few open the demo → **the pitch is wrong.** Fix the hero.
- Lots open the demo, few sign up → **the demo doesn't convince.** Fix the output or the CTA.
- Lots sign up, few upload a meeting → **onboarding is broken.** Fix the empty state.

Without the funnel you will only know "the launch got N visitors", which tells
you nothing you can act on.

---

## What already fires

**Client-side** (`lib/tracking.ts`, wired in `components/tracking/Tracking.tsx`):

| Event | Fires when |
|---|---|
| `$pageview` | every route change, including `/demo` |
| `demo_engaged` | a visitor clicks any tab on the public demo — first sign of real interest, not a bounce |
| `CompleteRegistration` | new signup lands on `/dashboard?welcome=1` |
| `InitiateCheckout` | a plan button is clicked on the pricing table |
| `Subscribe` | Stripe checkout returns to `/settings/billing?status=success` |
| `Purchase` | chat-pack purchase returns to `/chat?pack=success` |

**Server-side** (`lib/tracking-server.ts`):

| Event | Fires when |
|---|---|
| `meeting_processed` | any meeting finishes analysis |
| `first_meeting_processed` | an org's **first** completed meeting — this is activation |
| `meeting_processing_failed` | analysis failed |
| `upgraded_to_paid_plan` | Stripe subscription created |
| `bought_chat_pack` | chat pack bought |

Client and server events are now stitched: `components/tracking/IdentifyUser.tsx`
calls `posthog.identify()` with the internal User cuid — the same distinct id the
server uses — so an anonymous visitor who signs up and activates is one person,
not three.

---

## Build these three insights before Tuesday

### 1. Launch funnel (the one that matters)

New insight → **Funnel**, steps in order:

1. `$pageview` where `Current URL` **contains** `/demo`
2. `demo_engaged`
3. `CompleteRegistration`
4. `first_meeting_processed`

Conversion window: **3 days** (people come back). Breakdown by **`utm_source`**.

Read it as: step 1→2 is whether the demo holds attention, 2→3 is whether it
convinces, 3→4 is whether onboarding works.

### 2. Traffic by channel

New insight → **Trends**, event `$pageview`, breakdown by **`utm_source`**.

Every launch link is tagged (see below), so this separates Product Hunt from X
from Hacker News instead of one undifferentiated spike. Add a second series
broken down by `$referring_domain` to catch untagged traffic.

### 3. Landing-page drop-off

New insight → **Trends**, event `$pageview`, breakdown by **`$current_url`**.

Shows whether people who land on `/` ever reach `/demo`. If they don't, the
homepage is the problem, not the product.

**Optional but useful:** turn on **session replay** for launch day. Twenty
recordings of strangers using the demo will teach you more than any dashboard.

---

## Link tagging (already applied)

Every link in `producthunt-launch.md` and `launch-day-posts.md` now carries a
channel tag:

| Channel | `utm_source` |
|---|---|
| Product Hunt | `producthunt` |
| X | `x` |
| LinkedIn | `linkedin` |
| Indie Hackers | `indiehackers` |
| Show HN | `hackernews` |
| Slack / Discord | `community` |

Referrer alone is not enough — t.co hides the source, native apps strip the
referrer, and a lot of launch traffic arrives with none at all. If you post
anywhere not listed here, add
`?utm_source=<name>&utm_medium=social&utm_campaign=launch` by hand, or that
traffic lands in an unattributable bucket.

The Product Hunt listing's own **website field** should point at the tagged
demo URL too, not the bare domain.

---

## Reading it on the night

Rough expectations for a small launch — to calibrate, not to hit:

- **demo open rate** (visitors → `/demo`): under ~20% means the homepage isn't selling the click.
- **demo engagement** (`/demo` → `demo_engaged`): under ~40% means people look and leave — the output isn't landing in ten seconds.
- **signup** (`demo_engaged` → `CompleteRegistration`): the real verdict on whether anyone wants this.
- **activation** (signup → `first_meeting_processed`): under ~50% is an onboarding bug, not a demand problem.

Whatever the numbers, write them down the same night with the date. They are the
first real baseline the product has ever had — every account before this launch
was placed by hand, so nothing prior is comparable.

## Known gap

`upgraded_to_paid_plan` is captured server-side with the **org** id as its
distinct id (`app/api/webhooks/stripe/route.ts`), while every other event uses
the **user** id. Revenue events therefore attach to a separate PostHog person
and won't join the funnel above. It doesn't affect launch day — nobody converts
to paid in the first 24 hours — but it needs fixing before you measure
signup → paid.
