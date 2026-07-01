# CLARIX — Launch Checklist

Everything here needs **your** accounts/keys, so it can't be done from code. The app, plan
enforcement, and pricing are ready; this is the commercial/operational layer to flip on.

Status legend: ⬜ not done · ✅ done

---

## 1. Production environment variables (Railway → Variables)

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | **everything** | ⬜ Set to your real URL, e.g. `https://app.clarix.com`. Was `localhost`. Breaks Stripe/OAuth/webhooks/email until fixed. |
| `DATABASE_URL` | data | ✅ Supabase **session pooler** string (not direct — direct is IPv6-only). |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | storage | ⬜ URL must NOT have a `/rest/v1/` suffix. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | auth | ✅ Use **production** Clerk instance keys for the live domain. |
| `ASSEMBLYAI_API_KEY` | transcription | ⬜ |
| `ASSEMBLYAI_WEBHOOK_SECRET` | transcription webhooks | ⬜ Needed for the push (vs poll) path; requires public `NEXT_PUBLIC_APP_URL`. |
| `ANTHROPIC_API_KEY` | summaries + Ask CLARIX | ⬜ |
| `ENCRYPTION_KEY` | integration token encryption | ⬜ Generate: `openssl rand -hex 32`. Falls back to `CLERK_SECRET_KEY` but set a dedicated one. |
| `RESEND_API_KEY` | emails (recaps, digests) | ⬜ See §3. |
| `STRIPE_SECRET_KEY` | billing | ⬜ See §2. |
| `STRIPE_WEBHOOK_SECRET` | billing | ⬜ See §2. |
| `STRIPE_STARTER_PRICE_ID` / `STRIPE_PRO_PRICE_ID` / `STRIPE_ENTERPRISE_PRICE_ID` | billing | ⬜ See §2. |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | uploads | Optional. Default `2048`. Lower it if your storage plan is small. |
| `CRON_SECRET` | background jobs | ⬜ Random string (`openssl rand -hex 32`). Guards the digest cron — see §8. |
| Integration keys (optional) | Slack/Notion/Linear/Google/CRM/MeetingBaas | ⬜ Only needed for the features you advertise. Each is dormant until its key is set. |
| `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_POSTHOG_KEY` | ad tracking & product analytics | ⬜ Needed before running paid ads. Fires PageView, CompleteRegistration, InitiateCheckout, Subscribe. See `ADS.md`. |

---

## 2. Stripe (the #1 blocker — no payments without this)

1. ⬜ In the **Stripe Dashboard**, create 3 products with a **monthly recurring price** each:
   - Starter — $19/mo · Pro — $49/mo · Enterprise — $89/mo
2. ⬜ Copy each price's `price_…` id into `STRIPE_STARTER_PRICE_ID` / `STRIPE_PRO_PRICE_ID` / `STRIPE_ENTERPRISE_PRICE_ID`.
3. ⬜ Add `STRIPE_SECRET_KEY` (live mode `sk_live_…`).
4. ⬜ Create a **webhook endpoint** → `https://<your-domain>/api/webhooks/stripe`, subscribe to:
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. ⬜ Turn on **Stripe Tax** + the **Customer Portal** (Billing → cancel/update lives there; the app's
   "Manage billing" button opens it).
6. ⬜ **Test end-to-end** with a real card in live mode: subscribe → confirm the org's plan flips →
   confirm limits change → cancel → confirm downgrade.

> Plan tiers and entitlements live in `lib/stripe.ts` and are enforced server-side (see §6).

---

## 3. Email (Resend)

1. ⬜ Add and **verify your sending domain** in Resend (SPF + DKIM DNS records). Without this,
   recap/digest/welcome emails land in spam or fail.
2. ⬜ Set the `from` address to that domain.
3. ⬜ Send a test recap and confirm inbox delivery (not spam).

---

## 4. Domain, storage, reliability

- ⬜ **Domain:** point a real domain at Railway, enable HTTPS, set it as `NEXT_PUBLIC_APP_URL`.
- ⬜ **Storage:** Supabase free tier caps uploads at ~50 MB. To honor larger uploads, upgrade Supabase
  (or move the audio bucket to S3). The per-file ceiling is `NEXT_PUBLIC_MAX_UPLOAD_MB` and per-plan
  storage caps are in `lib/plan.ts` (`storageLimitBytes`).
- ⬜ **DB backups:** confirm automated Postgres backups are on (Supabase) and test a restore.
- ⬜ **Error monitoring:** add Sentry (or similar) — you currently have no alerting if processing fails
  for a paying customer.
- ⬜ **Uptime monitoring:** add a pinger (e.g. UptimeRobot) on `/` and `/api/...`.

---

## 5. Legal & trust

- ⬜ Have a lawyer review `/privacy` and `/terms` (currently honest **templates**, not legal advice).
- ⬜ Add a **DPA** if selling B2B; consider recording-consent language for two-party-consent regions.
- ⬜ Do **not** re-add SOC 2 / HIPAA claims until you actually hold those (all such claims were removed).

---

## 6. What's already handled in code ✅

- Plan limits enforced **server-side**: monthly meeting cap (`canCreateMeeting`) on both the upload
  path (`/api/meetings`) and the live-bot path (`/api/bot/create`); meeting-type gating (`canUseType`);
  Ask CLARIX message caps (403 when locked, 429 at limit) in `/api/chat/sessions/*`.
- Upload **file-size + storage caps** enforced before issuing a signed URL (`/api/upload`), with clear
  errors; `audioSize`/`audioFilename` now persisted so storage usage is tracked accurately.
- All authenticated routes protected in `middleware.ts` (incl. `/chat`, `/analytics`, `/action-items`, `/audio`).
- Pricing copy matches real entitlements; misinformation (fake logos/testimonials/stats, uncertified
  compliance badges) removed; `/privacy` + `/terms` pages exist and are linked.
- Per-meeting page titles; desktop download buttons show "Coming soon" instead of 404.

---

## 8. Background jobs / cron

### Action-item digest (built ✅ — needs a scheduler)
The digest email is live. To turn it on:
1. ⬜ Set `CRON_SECRET` (Railway) and `RESEND_API_KEY` (§3).
2. ⬜ Have users enable it in **Settings → Automation** (Daily or Weekly).
3. ⬜ Point a scheduler at the endpoint (daily is fine; it self-throttles per user):
   ```
   POST https://<your-domain>/api/cron/digest
   Header: Authorization: Bearer <CRON_SECRET>
   ```
   Use Railway Cron, GitHub Actions, or cron-job.org. The endpoint returns `{ sent, skipped, evaluated }`.

### Calendar auto-join (built ✅ — needs MeetingBaas + a scheduler)
"Connect calendar → CLARIX auto-joins your meetings" — the highest-impact capture feature. The code,
the `autoJoin` DB column (✅ applied), and the **Settings → Automation** toggle are all in place. To run it:
1. ✅ DB column applied (`CalendarConnection.autoJoin`).
2. ⬜ Set a **MeetingBaas API key** (`MEETING_BAAS_API_KEY`) — the bot that joins Zoom/Meet/Teams.
3. ⬜ Users connect a calendar and flip **Settings → Automation → Auto-join** on.
4. ⬜ Point a scheduler at the endpoint every ~2–5 min:
   ```
   POST https://<your-domain>/api/cron/auto-join
   Header: Authorization: Bearer <CRON_SECRET>
   ```
   It finds calendar events starting within 10 min that have a Zoom/Meet/Teams link, dispatches a bot
   (respecting plan limits), and links the resulting meeting so it never double-joins. Returns
   `{ considered, joined, skipped }`.

---

## 7. Minimal go-live sequence

1. Fill every ⬜ env var in Railway (§1) and redeploy.
2. Complete Stripe setup + a live test purchase (§2).
3. Verify Resend domain + send a test email (§3).
4. Point the domain, set `NEXT_PUBLIC_APP_URL`, re-test OAuth + webhooks (§4).
5. Lawyer-review legal (§5).
6. Run a full happy-path test as a brand-new user: sign up → upload → transcript/summary →
   Ask CLARIX → export → subscribe → cancel.
7. Turn on monitoring + backups, then announce.
