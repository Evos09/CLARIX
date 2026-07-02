export type Plan = {
  name: string; description: string; price: { monthly: number | null; annual: number | null };
  unit: string; cta: string; href: string; popular?: boolean; features: string[];
};

export const plans: Plan[] = [
  { name: "Free", description: "For trying CLARIX on your own meetings.", price: { monthly: 0, annual: 0 }, unit: "/month", cta: "Start Free", href: "/sign-up",
    features: ["3 meetings per month", "General meeting type", "Summary and action items", "In-browser recording"] },
  { name: "Starter", description: "For individuals who meet often.", price: { monthly: 19, annual: 15 }, unit: "/user/mo", cta: "Start Free", href: "/sign-up",
    features: ["20 meetings per month", "All standard meeting types", "PDF, DOCX & CSV export", "Auto-join meeting bot (Zoom, Meet, Teams)", "Forever audio library", "Email integration (Gmail)"] },
  { name: "Pro", description: "For teams that run on meetings.", price: { monthly: 49, annual: 39 }, unit: "/user/mo", cta: "Start 14-day trial", href: "/sign-up", popular: true,
    features: ["Unlimited meetings", "All exports (PDF, DOCX, CSV, JSON)", "Ask CLARIX chat (200/mo)", "Auto-join meeting bot", "Forever library + reprocessing", "Google Calendar, Gmail & Notion", "Voice Mode (coming soon)"] },
  { name: "Enterprise", description: "For regulated and large organizations.", price: { monthly: 89, annual: 69 }, unit: "/user/mo", cta: "Talk to Sales", href: "/sign-up",
    features: ["Everything in Pro", "Healthcare, Legal & Financial Verticals", "Salesforce & HubSpot CRM (coming soon)", "EHR / FHIR export", "Custom AI templates", "SSO / SAML (coming soon)", "SLA & priority support"] },
];

export type MeetingType = { name: string; summary: string; extracts: string[] };
export const meetingTypes: MeetingType[] = [
  {
    "name": "Sales Call",
    "summary": "Track the deal from first touch to close.",
    "extracts": [
      "Deal stage",
      "Objections",
      "Buying signals",
      "Next steps",
      "Prospect pain points"
    ]
  },
  {
    "name": "Team Standup",
    "summary": "Keep the whole team aligned in seconds.",
    "extracts": [
      "Yesterday / today per person",
      "Blockers",
      "Team-wide risk flags"
    ]
  },
  {
    "name": "1:1 Meeting",
    "summary": "Never lose track of growth conversations.",
    "extracts": [
      "Feedback given",
      "Goals discussed",
      "Growth notes"
    ]
  },
  {
    "name": "Client Meeting",
    "summary": "Capture every promise and concern.",
    "extracts": [
      "Deliverables promised",
      "Client concerns",
      "Next meeting date"
    ]
  },
  {
    "name": "Interview",
    "summary": "Structured, comparable candidate notes.",
    "extracts": [
      "Candidate strengths",
      "Concerns",
      "Hire signal",
      "Evaluation notes"
    ]
  },
  {
    "name": "Board Meeting",
    "summary": "An auditable record of governance.",
    "extracts": [
      "Motions passed",
      "Strategic priorities",
      "Decisions made"
    ]
  },
  {
    "name": "Discovery Call",
    "summary": "Qualify faster with the right signals.",
    "extracts": [
      "Budget",
      "Timeline",
      "Decision makers",
      "Qualification score"
    ]
  },
  {
    "name": "Retrospective",
    "summary": "Turn reflection into real experiments.",
    "extracts": [
      "What went well",
      "What didn't",
      "Experiments to try next"
    ]
  },
  {
    "name": "Brainstorm",
    "summary": "Nothing good gets lost in the noise.",
    "extracts": [
      "Ideas generated",
      "Top picks",
      "Next steps to explore"
    ]
  },
  {
    "name": "Investor Update",
    "summary": "Keep investors aligned and informed.",
    "extracts": [
      "KPIs reported",
      "Asks",
      "Investor commitments"
    ]
  },
  {
    "name": "Sprint Planning",
    "summary": "A clear, committed plan for the sprint.",
    "extracts": [
      "Story commitments",
      "Sprint goal",
      "Dependencies"
    ]
  },
  {
    "name": "Project Kickoff",
    "summary": "Align everyone before work begins.",
    "extracts": [
      "Goals",
      "Scope",
      "Milestones",
      "Risks",
      "Owners"
    ]
  },
  {
    "name": "Product Review",
    "summary": "Decisions and feedback in one place.",
    "extracts": [
      "Feature feedback",
      "Shipping decisions",
      "Technical debt"
    ]
  },
  {
    "name": "Strategy Session",
    "summary": "From discussion to committed direction.",
    "extracts": [
      "Priorities set",
      "Initiatives approved",
      "OKRs drafted"
    ]
  },
  {
    "name": "Performance Review",
    "summary": "Fair, documented, repeatable reviews.",
    "extracts": [
      "Ratings",
      "Goals achieved",
      "Improvement areas"
    ]
  },
  {
    "name": "Vendor Call",
    "summary": "Compare vendors with confidence.",
    "extracts": [
      "Pricing discussed",
      "Open terms",
      "Recommendation"
    ]
  },
  {
    "name": "All Hands",
    "summary": "Make company updates impossible to miss.",
    "extracts": [
      "Announcements",
      "Audience questions answered",
      "Key messages"
    ]
  },
  {
    "name": "Training Workshop",
    "summary": "Capture learning so it sticks.",
    "extracts": [
      "Key learnings",
      "Attendee takeaways",
      "Resources shared"
    ]
  },
  {
    "name": "General Meeting",
    "summary": "A smart fallback for anything else.",
    "extracts": [
      "Smart summary",
      "Action items",
      "Key decisions"
    ]
  }
];

export type ProVertical = { name: string; summary: string; extracts: string[] };
export const proVerticals: ProVertical[] = [
  {
    "name": "Medical Appointment",
    "summary": "Compliance-aware clinical documentation.",
    "extracts": [
      "SOAP note structure",
      "ICD-10 code suggestions",
      "Medication list",
      "Follow-up date"
    ]
  },
  {
    "name": "Legal Deposition",
    "summary": "Defensible, structured legal records.",
    "extracts": [
      "Key admissions",
      "Action items",
      "Case timeline",
      "Exhibit references"
    ]
  },
  {
    "name": "Financial Advisory Meeting",
    "summary": "Suitability and compliance, documented.",
    "extracts": [
      "Compliance & suitability flags",
      "Client goals",
      "Risk tolerance",
      "CRM-ready summary"
    ]
  }
];

export type Integration = { name: string; logo: string; category: "Conferencing" | "Calendar" | "Email" | "Workspace" | "CRM"; description: string; soon?: boolean };
export const integrations: Integration[] = [
  {
    "name": "Zoom",
    "logo": "/logos/zoom.svg",
    "category": "Conferencing",
    "description": "A visible bot joins your Zoom calls automatically and records and transcribes them."
  },
  {
    "name": "Google Meet",
    "logo": "/logos/googlemeet.svg",
    "category": "Conferencing",
    "description": "Auto-recording and transcription for every Google Meet call."
  },
  {
    "name": "Microsoft Teams",
    "logo": "/logos/teams.svg",
    "category": "Conferencing",
    "description": "Full Teams integration with automatic bot joining."
  },
  {
    "name": "Google Calendar",
    "logo": "/logos/googlecalendar.svg",
    "category": "Calendar",
    "description": "See upcoming meetings and automatically link recordings to events."
  },
  {
    "name": "Apple Calendar",
    "logo": "/logos/calendar.svg",
    "category": "Calendar",
    "description": "Sync your calendar events directly with CLARIX."
  },
  {
    "name": "Gmail",
    "logo": "/logos/gmail.svg",
    "category": "Email",
    "description": "Send meeting summaries and action items straight from your inbox."
  },
  {
    "name": "Slack",
    "logo": "/logos/slack.svg",
    "category": "Workspace",
    "soon": true,
    "description": "Post meeting summaries and action items to any channel."
  },
  {
    "name": "Notion",
    "logo": "/logos/notion.svg",
    "category": "Workspace",
    "description": "Automatically create structured meeting pages in your workspace."
  },
  {
    "name": "Linear",
    "logo": "/logos/linear.svg",
    "category": "Workspace",
    "soon": true,
    "description": "Turn meeting action items into Linear issues automatically."
  },
  {
    "name": "Salesforce",
    "logo": "/logos/salesforce.svg",
    "category": "CRM",
    "soon": true,
    "description": "Push meeting notes and tasks into Salesforce as activities."
  },
  {
    "name": "HubSpot",
    "logo": "/logos/hubspot.svg",
    "category": "CRM",
    "soon": true,
    "description": "Log meetings and create tasks directly in HubSpot CRM."
  }
];
