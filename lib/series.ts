import { prisma } from "@/lib/prisma";
import type { BaseOutput } from "@/lib/outputTypes";

// Cross-meeting "series": recurring meetings (standups, 1:1s, weekly syncs)
// usually share a title that differs only by a date or sequence number. We
// group completed meetings by a normalized key so users can see decisions and
// still-open action items threaded across the whole series.

const MONTHS = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec";

/** Normalize a title into a stable series key by stripping dates, weekdays,
 *  sequence markers, and punctuation. "Weekly Standup #12" and
 *  "Weekly Standup - Jul 3" both collapse to "weekly standup". */
export function seriesKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/\b\d{1,2}[/\-.]\d{1,2}(?:[/\-.]\d{2,4})?\b/g, " ") // 7/3, 07-03-2026
    .replace(new RegExp(`\\b(?:${MONTHS})[a-z]*\\b`, "g"), " ") // month names
    .replace(/\b(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/g, " ") // weekdays
    .replace(/\bq[1-4]\b/g, " ") // quarters
    .replace(/\b(?:week|wk|day|part|session|no|number|vol)\s*#?\d+\b/g, " ")
    .replace(/#\s*\d+/g, " ") // "#12"
    .replace(/\b\d{4}\b/g, " ") // years
    .replace(/\bv\d+\b/g, " ")
    .replace(/[^a-z]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** URL-safe slug for a series key. */
export function seriesSlug(key: string): string {
  return key.replace(/\s+/g, "-");
}

export type SeriesSummary = {
  slug: string; // auto: normalized-title slug · custom: MeetingSeries.id
  title: string; // display title (most recent meeting in the series)
  count: number;
  lastAt: Date;
  firstAt: Date;
  kind: "auto" | "custom";
};

type MeetingWhere = { OR: [{ orgId: string }, { collaborators: { some: { userId: string } } }]; status: "COMPLETE" };
function accessibleWhere(orgId: string, userId: string): MeetingWhere {
  return { OR: [{ orgId }, { collaborators: { some: { userId } } }], status: "COMPLETE" };
}

/** Custom (user-created) series + automatic recurring series (title normalized
 *  to the same key 2+ times, minus any the user deleted), newest first. */
export async function getSeriesList(orgId: string, userId: string): Promise<SeriesSummary[]> {
  const [meetings, custom, dismissed] = await Promise.all([
    prisma.meeting.findMany({
      where: accessibleWhere(orgId, userId),
      select: { title: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.meetingSeries.findMany({
      where: { orgId },
      include: { items: { include: { meeting: { select: { createdAt: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dismissedSeries.findMany({ where: { orgId }, select: { slug: true } }),
  ]);

  const customSummaries: SeriesSummary[] = custom.map((s) => {
    const dates = s.items.map((i) => i.meeting.createdAt);
    const lastAt = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : s.createdAt;
    const firstAt = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : s.createdAt;
    return { slug: s.id, title: s.name, count: s.items.length, lastAt, firstAt, kind: "custom" as const };
  });

  const hidden = new Set(dismissed.map((d) => d.slug));
  const map = new Map<string, SeriesSummary>();
  for (const m of meetings) {
    const key = seriesKey(m.title);
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { slug: seriesSlug(key), title: m.title, count: 1, lastAt: m.createdAt, firstAt: m.createdAt, kind: "auto" });
    } else {
      existing.count += 1;
      if (m.createdAt > existing.lastAt) {
        existing.lastAt = m.createdAt;
        existing.title = m.title; // display the most recent variant
      }
      if (m.createdAt < existing.firstAt) existing.firstAt = m.createdAt;
    }
  }
  const auto = [...map.values()].filter((s) => s.count >= 2 && !hidden.has(s.slug));

  return [...customSummaries, ...auto].sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

export type SeriesMeeting = {
  id: string;
  title: string;
  createdAt: Date;
  meetingType: string;
  tldr: string;
  decisions: string[];
};

export type SeriesActionItem = {
  id: string;
  task: string;
  owner: string | null;
  dueDate: string | null;
  priority: string | null;
  completed: boolean;
  meetingId: string;
  meetingTitle: string;
  meetingAt: Date;
};

export type SeriesDetail = {
  slug: string;
  title: string;
  meetings: SeriesMeeting[];
  openItems: SeriesActionItem[];
  doneCount: number;
  kind: "auto" | "custom";
};

type GroupMeeting = { id: string; title: string; createdAt: Date; meetingType: string; structuredOutput: unknown };

/** Full rollup for one series: its meetings (oldest→newest), open action items
 *  across all of them, and how many have been completed. `slug` is a custom
 *  MeetingSeries.id (tried first) or an auto normalized-title slug (needs 2+
 *  accessible meetings). Returns null if neither matches. */
export async function getSeriesDetail(orgId: string, userId: string, slug: string): Promise<SeriesDetail | null> {
  // Custom series first: hand-picked membership, any size.
  const custom = await prisma.meetingSeries.findFirst({
    where: { id: slug, orgId },
    include: {
      items: {
        include: {
          meeting: { select: { id: true, title: true, createdAt: true, meetingType: true, structuredOutput: true } },
        },
      },
    },
  });

  let group: GroupMeeting[];
  let kind: "auto" | "custom";
  let displayTitle: string;
  if (custom) {
    group = custom.items.map((i) => i.meeting).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    kind = "custom";
    displayTitle = custom.name;
  } else {
    const meetings = await prisma.meeting.findMany({
      where: accessibleWhere(orgId, userId),
      select: { id: true, title: true, createdAt: true, meetingType: true, structuredOutput: true },
      orderBy: { createdAt: "asc" },
    });
    group = meetings.filter((m) => seriesSlug(seriesKey(m.title)) === slug);
    if (group.length < 2) return null;
    kind = "auto";
    displayTitle = group[group.length - 1].title;
  }

  const seriesMeetings: SeriesMeeting[] = group.map((m) => {
    const out = (m.structuredOutput as unknown as BaseOutput | null) ?? null;
    return {
      id: m.id,
      title: m.title,
      createdAt: m.createdAt,
      meetingType: m.meetingType,
      tldr: out?.tldr ?? "",
      decisions: Array.isArray(out?.keyDecisions) ? out.keyDecisions : [],
    };
  });

  const ids = group.map((m) => m.id);
  const titleById = new Map(group.map((m) => [m.id, { title: m.title, at: m.createdAt }]));
  const items = await prisma.actionItem.findMany({
    where: { meetingId: { in: ids } },
    orderBy: { createdAt: "desc" },
  });

  const openItems: SeriesActionItem[] = items
    .filter((it) => !it.completed)
    .map((it) => ({
      id: it.id,
      task: it.task,
      owner: it.owner,
      dueDate: it.dueDate,
      priority: it.priority,
      completed: it.completed,
      meetingId: it.meetingId,
      meetingTitle: titleById.get(it.meetingId)?.title ?? "",
      meetingAt: titleById.get(it.meetingId)?.at ?? it.createdAt,
    }));

  const doneCount = items.filter((it) => it.completed).length;

  // Newest meetings first for the display timeline.
  seriesMeetings.reverse();

  return {
    slug,
    title: displayTitle,
    meetings: seriesMeetings,
    openItems,
    doneCount,
    kind,
  };
}

/** Keep custom series in sync as meetings arrive: when a meeting completes
 *  processing, auto-add it to any custom series in its org whose name
 *  normalizes to the same key as the meeting title. Best-effort. */
export async function syncMeetingIntoSeries(meetingId: string): Promise<void> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { id: true, title: true, orgId: true },
  });
  if (!meeting) return;
  const key = seriesKey(meeting.title);
  if (!key) return;

  const series = await prisma.meetingSeries.findMany({
    where: { orgId: meeting.orgId },
    select: { id: true, name: true },
  });
  const matches = series.filter((s) => seriesKey(s.name) === key);
  if (!matches.length) return;

  await prisma.meetingSeriesItem.createMany({
    data: matches.map((s) => ({ seriesId: s.id, meetingId: meeting.id })),
    skipDuplicates: true,
  });
}
