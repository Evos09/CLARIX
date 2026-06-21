/**
 * CLARIX meeting type registry.
 * Pure data (no React imports) so it can be used in API routes and components.
 * Icons are lucide-react names resolved in components/meetings/MeetingTypeIcon.tsx.
 */

export type MeetingCategory = "GENERAL" | "PRO";
export type Vertical = "HEALTHCARE" | "LEGAL" | "FINANCIAL";
export type BadgeColor =
  | "blue"
  | "teal"
  | "purple"
  | "gold"
  | "orange"
  | "navy"
  | "pink"
  | "green"
  | "gray";

export interface MeetingTypeConfig {
  id: string;
  label: string;
  description: string;
  category: MeetingCategory;
  vertical?: Vertical;
  color: BadgeColor;
  icon: string; // lucide-react icon name
}

export const MEETING_TYPES: MeetingTypeConfig[] = [
  { id: "STANDUP", label: "Team Standup", description: "Who did what, blockers, today's plan", category: "GENERAL", color: "blue", icon: "ListChecks" },
  { id: "ONE_ON_ONE", label: "1:1 Meeting", description: "Discussion points, feedback, growth notes, follow-ups", category: "GENERAL", color: "blue", icon: "UserRound" },
  { id: "ALL_HANDS", label: "All Hands / Town Hall", description: "Announcements, Q&A, key messages", category: "GENERAL", color: "navy", icon: "Megaphone" },
  { id: "PROJECT_KICKOFF", label: "Project Kickoff", description: "Goals, scope, owners, milestones, risks", category: "GENERAL", color: "teal", icon: "Rocket" },
  { id: "SPRINT_PLANNING", label: "Sprint Planning", description: "Story assignments, estimates, sprint goal, dependencies", category: "GENERAL", color: "blue", icon: "CalendarClock" },
  { id: "RETROSPECTIVE", label: "Retrospective", description: "What went well, what didn't, action items", category: "GENERAL", color: "pink", icon: "RefreshCw" },
  { id: "PRODUCT_REVIEW", label: "Product Review", description: "Feature feedback, decisions, next steps", category: "GENERAL", color: "teal", icon: "Package" },
  { id: "CLIENT_MEETING", label: "Client Meeting", description: "Client asks, deliverables promised, next meeting", category: "GENERAL", color: "purple", icon: "Handshake" },
  { id: "SALES_CALL", label: "Sales Call", description: "Pain points, objections, next steps, deal stage", category: "GENERAL", color: "green", icon: "PhoneCall" },
  { id: "DISCOVERY_CALL", label: "Discovery Call", description: "Prospect needs, qualification, follow-up plan", category: "GENERAL", color: "green", icon: "Search" },
  { id: "INTERVIEW", label: "Interview", description: "Candidate answers, evaluation, hire signal", category: "GENERAL", color: "orange", icon: "UserCheck" },
  { id: "BOARD_MEETING", label: "Board Meeting", description: "Decisions, votes, strategic priorities, action items", category: "GENERAL", color: "navy", icon: "Landmark" },
  { id: "INVESTOR_UPDATE", label: "Investor Update", description: "KPIs, asks, follow-ups, commitments", category: "GENERAL", color: "navy", icon: "TrendingUp" },
  { id: "BRAINSTORM", label: "Brainstorm Session", description: "Ideas captured, top picks, next actions", category: "GENERAL", color: "pink", icon: "Lightbulb" },
  { id: "TRAINING_WORKSHOP", label: "Training / Workshop", description: "Key learnings, takeaways, to-dos", category: "GENERAL", color: "teal", icon: "GraduationCap" },
  { id: "VENDOR_CALL", label: "Vendor / Partner Call", description: "Terms discussed, commitments, open questions", category: "GENERAL", color: "purple", icon: "Truck" },
  { id: "PERFORMANCE_REVIEW", label: "Performance Review", description: "Ratings, goals set, improvement areas", category: "GENERAL", color: "orange", icon: "ClipboardCheck" },
  { id: "STRATEGY_SESSION", label: "Strategy Session", description: "Strategic priorities, owners, OKRs drafted", category: "GENERAL", color: "navy", icon: "Target" },
  { id: "GENERAL", label: "General Meeting", description: "Smart summary + action items for anything else", category: "GENERAL", color: "gray", icon: "MessageSquare" },
  // Pro Verticals
  { id: "MEDICAL_APPOINTMENT", label: "Medical Appointment", description: "SOAP note, ICD-10 suggestions, medication extraction", category: "PRO", vertical: "HEALTHCARE", color: "gold", icon: "Stethoscope" },
  { id: "LEGAL_DEPOSITION", label: "Legal Deposition", description: "Key admissions, action items, case timeline, exhibits", category: "PRO", vertical: "LEGAL", color: "gold", icon: "Scale" },
  { id: "FINANCIAL_ADVISORY", label: "Financial Advisory", description: "Goals, risk tolerance, compliance flags, suitability", category: "PRO", vertical: "FINANCIAL", color: "gold", icon: "Banknote" },
];

const BY_ID = new Map(MEETING_TYPES.map((t) => [t.id, t]));

export function getMeetingType(id: string): MeetingTypeConfig {
  return BY_ID.get(id) ?? BY_ID.get("GENERAL")!;
}

export const GENERAL_TYPES = MEETING_TYPES.filter((t) => t.category === "GENERAL");
export const PRO_TYPES = MEETING_TYPES.filter((t) => t.category === "PRO");

/** IDs sent to Claude for auto-detection (excludes Pro Verticals). */
export const DETECTABLE_TYPE_IDS = GENERAL_TYPES.map((t) => t.id);

/** Onboarding use-case → suggested default meeting types. */
export const USE_CASES: { id: string; label: string; suggested: string[] }[] = [
  { id: "SALES", label: "Sales Team", suggested: ["SALES_CALL", "DISCOVERY_CALL", "CLIENT_MEETING"] },
  { id: "PRODUCT", label: "Product Team", suggested: ["STANDUP", "SPRINT_PLANNING", "PRODUCT_REVIEW", "RETROSPECTIVE"] },
  { id: "STARTUP", label: "Startup", suggested: ["STANDUP", "INVESTOR_UPDATE", "BOARD_MEETING", "STRATEGY_SESSION"] },
  { id: "AGENCY", label: "Agency", suggested: ["CLIENT_MEETING", "PROJECT_KICKOFF", "BRAINSTORM"] },
  { id: "HEALTHCARE", label: "Healthcare", suggested: ["MEDICAL_APPOINTMENT", "GENERAL"] },
  { id: "LEGAL", label: "Legal", suggested: ["LEGAL_DEPOSITION", "CLIENT_MEETING"] },
  { id: "FINANCIAL", label: "Financial", suggested: ["FINANCIAL_ADVISORY", "CLIENT_MEETING"] },
  { id: "OTHER", label: "Something else", suggested: ["GENERAL", "STANDUP", "ONE_ON_ONE"] },
];

export const BADGE_CLASSES: Record<BadgeColor, string> = {
  blue: "bg-blue-100 text-blue-700 ring-blue-600/20",
  teal: "bg-teal-100 text-teal-700 ring-teal-600/20",
  purple: "bg-purple-100 text-purple-700 ring-purple-600/20",
  gold: "bg-amber-100 text-amber-800 ring-amber-600/20",
  orange: "bg-orange-100 text-orange-700 ring-orange-600/20",
  navy: "bg-slate-200 text-slate-800 ring-slate-600/20",
  pink: "bg-pink-100 text-pink-700 ring-pink-600/20",
  green: "bg-green-100 text-green-700 ring-green-600/20",
  gray: "bg-gray-100 text-gray-600 ring-gray-500/20",
};
