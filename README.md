# CLARIX

**Every Meeting. Captured. Understood. Done.**

AI meeting assistant that transcribes, analyzes, and turns any meeting into
structured action items, decisions, and summaries — tailored to 22 meeting types,
plus Pro Verticals (Healthcare / Legal / Financial).

## Stack
- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Prisma 6** + PostgreSQL (Supabase)
- **Clerk** auth · **Stripe** billing · **AssemblyAI** transcription
- **Anthropic Claude** (`claude-sonnet-4-6`) · **Resend** email · **wavesurfer.js** · **recharts**

## Getting started
```bash
npm install
# fill in your keys in .env
npx prisma generate
npx prisma db push              # requires DATABASE_URL (Supabase)
npm run dev
```
The app runs **without any keys** in dev (auth + integrations degrade gracefully). Put your keys in `.env`.
`/api/health` reports live integration status. Minimum to be useful:
`ANTHROPIC_API_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## What's implemented (all 11 phases)
1. **Foundation** — design system, Clerk auth + middleware, dashboard shell, onboarding, landing.
2. **Upload & transcription** — presigned Supabase uploads, in-browser recorder, AssemblyAI (speaker labels, language detection, Healthcare vocab boost), webhook + localhost poll fallback.
3. **Meeting types** — Claude auto-detect, detail tabs.
4. **AI engine** — 22 prompt files + processing engine, structured-output renderer, regenerate.
5. **Ask CLARIX** — chat over transcript + analysis, persisted history.
6. **Transcript viewer** — wavesurfer waveform, search/highlight, timestamp seek, comments.
7. **Dashboard** — recharts stats, meeting-type breakdown, global action-items feed with completion.
8. **Export & billing** — PDF/DOCX/CSV + Claude email/Slack drafts; Stripe checkout/portal/webhook; plan gating.
9. **Team & settings** — org settings, custom AI templates, member list, Resend completion email.
10. **Polish** — error boundary, 404, loading skeletons, robots/sitemap, dynamic OG image.
11. **QA** — strict `tsc` clean, `eslint` clean, `next build` green, zero `any`/TODO leaks.

## Verified
`npx tsc --noEmit --strict` → 0 · `npx eslint .` → 0 · `npm run build` → success.
> Live API round-trips (Claude/AssemblyAI/Stripe/Supabase/Resend) and Vercel deploy
> require real keys/accounts and have not been run.

## Notes
- Stack is newer than the original spec (Next 16 / Tailwind v4 / Prisma 6 vs 14/3/classic).
- Output UI uses one generic data-driven renderer covering all 22 types (not 22 bespoke components).
- Set `ASSEMBLYAI_WEBHOOK_SECRET` + a public `NEXT_PUBLIC_APP_URL` for production webhooks; localhost uses the poll fallback.
