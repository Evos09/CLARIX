/**
 * The meeting a stranger sees at /demo before they sign up for anything.
 *
 * It is deliberately a full five minutes of real back-and-forth rather than a
 * four-line stub: the whole point of the page is to let someone judge the
 * output quality for themselves, and a stub proves nothing. Every action item,
 * decision and key point below is genuinely derivable from the transcript —
 * if it weren't, the demo would be a lie about what CLARIX produces.
 */

/** N days from today as YYYY-MM-DD, so the demo never shows overdue work. */
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export const SAMPLE_MEETING_DATA = {
  title: "Q3 Product Strategy & Roadmap Sync",
  meetingType: "STRATEGY_SESSION",
  detectedType: "STRATEGY_SESSION",
  duration: 312,
  speakerCount: 3,
  language: "en-US",
  status: "COMPLETE",
  rawTranscript: `Sarah: Good morning team, let's kick off Q3 planning. Mike, where are we on the auth refactor?
Mike: Code's complete and reviewed. I'm blocked waiting on legal sign-off from Daniel before I can merge it.
Sarah: How long has that been sitting?
Mike: Nine days. I emailed once and haven't chased it since.
Sarah: Okay, that's the thing that worries me most on this list. Ping Daniel directly today, and if you don't hear back by Thursday, escalate to me and I'll take it.
Mike: Will do. Once it merges, deploy is about half a day of work.
Priya: On design — the new dashboard mockups are about eighty percent done. I can have the full set to engineering by Thursday afternoon.
Sarah: Does that include the empty states? Last time we shipped without them and support felt it.
Priya: Yes, empty states and the error variants are both in this pass. I pulled the copy from the support tickets so the wording matches what people actually ask.
Sarah: Good. Let's talk launch date. Marketing wants September fifteenth.
Mike: That's tight but it's real, assuming auth unblocks this week. If it slips past next Friday we lose the buffer.
Priya: Design won't be the constraint. I'd rather commit to the fifteenth and cut the settings redesign than move the date.
Sarah: Agreed — September fifteenth is the date. Settings redesign moves to Q4 if we need the room.
Mike: One more thing. We still have no rollback plan for the auth change. If it goes wrong at scale we're guessing.
Sarah: That's a real gap. Mike, write the rollback runbook before the deploy, not after.
Mike: I'll have it ready alongside the merge.
Sarah: Last item — Priya, can you get the mockups in front of two customers before we build?
Priya: I'll set up two calls next week and bring the notes back to this meeting.
Sarah: Perfect. That's everything.`,
  transcriptSegments: [
    { speaker: "Sarah", text: "Good morning team, let's kick off Q3 planning. Mike, where are we on the auth refactor?", start: 0, end: 9 },
    { speaker: "Mike", text: "Code's complete and reviewed. I'm blocked waiting on legal sign-off from Daniel before I can merge it.", start: 9, end: 21 },
    { speaker: "Sarah", text: "How long has that been sitting?", start: 21, end: 25 },
    { speaker: "Mike", text: "Nine days. I emailed once and haven't chased it since.", start: 25, end: 33 },
    { speaker: "Sarah", text: "Okay, that's the thing that worries me most on this list. Ping Daniel directly today, and if you don't hear back by Thursday, escalate to me and I'll take it.", start: 33, end: 51 },
    { speaker: "Mike", text: "Will do. Once it merges, deploy is about half a day of work.", start: 51, end: 60 },
    { speaker: "Priya", text: "On design — the new dashboard mockups are about eighty percent done. I can have the full set to engineering by Thursday afternoon.", start: 60, end: 78 },
    { speaker: "Sarah", text: "Does that include the empty states? Last time we shipped without them and support felt it.", start: 78, end: 91 },
    { speaker: "Priya", text: "Yes, empty states and the error variants are both in this pass. I pulled the copy from the support tickets so the wording matches what people actually ask.", start: 91, end: 113 },
    { speaker: "Sarah", text: "Good. Let's talk launch date. Marketing wants September fifteenth.", start: 113, end: 126 },
    { speaker: "Mike", text: "That's tight but it's real, assuming auth unblocks this week. If it slips past next Friday we lose the buffer.", start: 126, end: 145 },
    { speaker: "Priya", text: "Design won't be the constraint. I'd rather commit to the fifteenth and cut the settings redesign than move the date.", start: 145, end: 165 },
    { speaker: "Sarah", text: "Agreed — September fifteenth is the date. Settings redesign moves to Q4 if we need the room.", start: 165, end: 184 },
    { speaker: "Mike", text: "One more thing. We still have no rollback plan for the auth change. If it goes wrong at scale we're guessing.", start: 184, end: 205 },
    { speaker: "Sarah", text: "That's a real gap. Mike, write the rollback runbook before the deploy, not after.", start: 205, end: 220 },
    { speaker: "Mike", text: "I'll have it ready alongside the merge.", start: 220, end: 228 },
    { speaker: "Sarah", text: "Last item — Priya, can you get the mockups in front of two customers before we build?", start: 228, end: 245 },
    { speaker: "Priya", text: "I'll set up two calls next week and bring the notes back to this meeting.", start: 245, end: 260 },
    { speaker: "Sarah", text: "Perfect. That's everything.", start: 260, end: 267 },
  ],
  // Shape must match lib/keyPoints.ts KeyPoint: { time: seconds, speaker,
  // description, category } — the categories are the ones in KP_CATEGORY_CLASS.
  keyPoints: [
    { time: 9, speaker: "Mike", description: "The auth refactor is code-complete but blocked on legal sign-off from Daniel.", category: "CONCERN" },
    { time: 25, speaker: "Mike", description: "The block has been sitting nine days with only one follow-up email.", category: "CONCERN" },
    { time: 33, speaker: "Sarah", description: "Escalation path set: chase Daniel today, escalate to Sarah by Thursday if no reply.", category: "DECISION" },
    { time: 91, speaker: "Priya", description: "Mockups now include empty states and error variants, with copy pulled from real support tickets.", category: "INSIGHT" },
    { time: 165, speaker: "Sarah", description: "September 15 confirmed as the launch date; settings redesign is the scope that gets cut if needed.", category: "DECISION" },
    { time: 184, speaker: "Mike", description: "No rollback plan exists for the auth change — a risk nobody had tracked.", category: "CONCERN" },
    { time: 220, speaker: "Mike", description: "Committed to having the rollback runbook ready alongside the merge.", category: "COMMITMENT" },
    { time: 228, speaker: "Sarah", description: "Asked Priya to put the mockups in front of two customers before engineering builds them.", category: "ACTION" },
  ],
  speakerMap: {
    Sarah: "Sarah (Product)",
    Mike: "Mike (Engineering)",
    Priya: "Priya (Design)",
  },
  // Field-for-field the shape lib/prompts/base.ts asks Claude for, plus the
  // STRATEGY_SESSION extras from lib/prompts/strategySession.ts. A visitor
  // comparing this page to their own first meeting should see the same fields.
  structuredOutput: {
    title: "Q3 Product Strategy & Roadmap Sync",
    tldr: "Q3 is on track for a September 15 launch, but the auth refactor has been blocked on legal sign-off for nine days and is now the critical path. The team agreed to cut the settings redesign rather than move the date, and surfaced a missing rollback plan for the auth change. Design is ahead of schedule and will validate the new dashboard with two customers before build.",
    keyDecisions: [
      "September 15 is the committed launch date, chosen over moving the date to fit more scope.",
      "The settings redesign moves to Q4 if the schedule tightens — it is the agreed release valve.",
      "The auth refactor will not deploy without a rollback runbook written first.",
      "Mike escalates the legal sign-off to Sarah if Daniel has not replied by Thursday.",
    ],
    actionItems: [
      { task: "Ping Daniel directly for auth refactor legal sign-off; escalate to Sarah if no reply by Thursday", owner: "Mike", dueDate: inDays(2), priority: "HIGH" },
      { task: "Write the rollback runbook for the auth change before the deploy", owner: "Mike", dueDate: inDays(7), priority: "HIGH" },
      { task: "Deliver the full dashboard mockup set — including empty states and error variants — to engineering", owner: "Priya", dueDate: inDays(2), priority: "MEDIUM" },
      { task: "Book two customer calls to review the dashboard mockups and report back", owner: "Priya", dueDate: inDays(9), priority: "MEDIUM" },
    ],
    followUpDate: inDays(7),
    sentiment: "NEUTRAL",
    topics: ["Auth refactor", "Dashboard redesign", "Q3 launch date", "Release risk"],
    openQuestions: [
      "Will Daniel's legal sign-off land before next Friday, and what happens to the date if it doesn't?",
      "What did the two customer calls say about the new dashboard?",
    ],
    timeHorizon: "Q3 2026, launching September 15",
    prioritiesSet: [
      "Unblock and ship the auth refactor",
      "Land the dashboard redesign with empty and error states",
      "Protect the September 15 date",
    ],
    initiativesApproved: ["Auth refactor (pending legal sign-off)", "Dashboard redesign", "Customer validation calls"],
    initiativesRejected: ["Settings redesign — deferred to Q4 to protect the launch date"],
    okrsDrafted: [
      {
        objective: "Ship Q3 on September 15 without a rollback incident",
        keyResults: [
          "Auth refactor merged and deployed with a written rollback runbook",
          "Dashboard redesign delivered to engineering by Thursday",
          "Two customer validation calls completed before build starts",
        ],
      },
    ],
  },
};
