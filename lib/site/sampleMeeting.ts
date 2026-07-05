export const SAMPLE_MEETING_DATA = {
  title: "Q3 Product Strategy & Roadmap Sync",
  meetingType: "STRATEGY",
  detectedType: "STRATEGY",
  duration: 312,
  speakerCount: 3,
  language: "en-US",
  status: "COMPLETE",
  rawTranscript: `Sarah: Good morning team, let's kick off our Q3 planning. Mike, what's the status of the auth refactor?
Mike: The code is complete, but I'm waiting on legal sign-off from Daniel for our compliance audit before merging.
Priya: I can finish the design mockups for the new dashboard by Thursday afternoon.
Sarah: Great. Mike, please ping Daniel and let's aim to have the audit done by next Tuesday.`,
  transcriptSegments: [
    { speaker: "Sarah", text: "Good morning team, let's kick off our Q3 planning. Mike, what's the status of the auth refactor?", start: 0, end: 12 },
    { speaker: "Mike", text: "The code is complete, but I'm waiting on legal sign-off from Daniel for our compliance audit before merging.", start: 13, end: 28 },
    { speaker: "Priya", text: "I can finish the design mockups for the new dashboard by Thursday afternoon.", start: 29, end: 40 },
    { speaker: "Sarah", text: "Great. Mike, please ping Daniel and let's aim to have the audit done by next Tuesday.", start: 41, end: 52 }
  ],
  keyPoints: [
    { time: "0:00", point: "Sarah kicked off the Q3 product strategy meeting." },
    { time: "0:13", point: "Mike reported that the auth refactor is done, waiting on legal sign-off." },
    { time: "0:29", point: "Priya committed to finish the dashboard mockups by Thursday." }
  ],
  speakerMap: {
    Sarah: "Sarah (Product)",
    Mike: "Mike (Engineering)",
    Priya: "Priya (Design)"
  },
  structuredOutput: {
    tldr: "Q3 product roadmap is on track. Auth refactor is pending legal approval from Daniel. Design mockups will be complete by Thursday.",
    actionItems: [
      { task: "Ping Daniel on legal team for auth refactor sign-off", owner: "Mike", dueDate: "2026-07-08", priority: "HIGH" },
      { task: "Finish new dashboard design mockups", owner: "Priya", dueDate: "2026-07-09", priority: "MEDIUM" }
    ],
    decisions: [
      { decision: "Target launch date for Q3 features is set for September 15.", rationale: "Aligns with the end of Q3 sales cycle." }
    ]
  }
};
