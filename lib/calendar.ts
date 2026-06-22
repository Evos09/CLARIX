import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { listGoogleEvents, refreshAccess, type GoogleEvent } from "@/lib/google";

const MEETING_RE = /meeting|call|sync|standup|review|1:1|interview|kickoff/i;

interface NormalizedEvent {
  externalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  description?: string;
}

function looksLikeMeeting(e: NormalizedEvent): boolean {
  return e.attendees.length >= 2 || MEETING_RE.test(e.title);
}

async function upsertEvents(userId: string, events: NormalizedEvent[]): Promise<{ synced: number }> {
  let synced = 0;
  for (const e of events.filter(looksLikeMeeting)) {
    await prisma.calendarEvent.upsert({
      where: { userId_externalId: { userId, externalId: e.externalId } },
      update: { title: e.title, startTime: e.startTime, endTime: e.endTime, attendees: e.attendees, location: e.location, description: e.description },
      create: { userId, externalId: e.externalId, title: e.title, startTime: e.startTime, endTime: e.endTime, attendees: e.attendees, location: e.location, description: e.description },
    });
    synced++;
  }
  return { synced };
}

function mapGoogle(e: GoogleEvent): NormalizedEvent {
  const start = e.start?.dateTime ?? e.start?.date ?? new Date().toISOString();
  const end = e.end?.dateTime ?? e.end?.date ?? start;
  return {
    externalId: e.id,
    title: e.summary ?? "(no title)",
    startTime: new Date(start),
    endTime: new Date(end),
    attendees: (e.attendees ?? []).map((a) => a.email ?? "").filter(Boolean),
    location: e.location,
    description: e.hangoutLink ? `Google Meet: ${e.hangoutLink}\n${e.description ?? ""}` : e.description,
  };
}

/** Parses one VEVENT iCal blob into a normalized event. */
function parseICS(data: string): NormalizedEvent | null {
  const line = (k: string) => data.match(new RegExp(`^${k}[^:\r\n]*:(.*)$`, "m"))?.[1]?.trim();
  const uid = line("UID");
  if (!uid) return null;
  const parseDt = (v?: string): Date => {
    if (!v) return new Date();
    const m = v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
    if (!m) return new Date(v);
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0)));
  };
  const attendees = [...data.matchAll(/^ATTENDEE[^:]*:mailto:(.+)$/gim)].map((m) => m[1].trim());
  const start = parseDt(line("DTSTART"));
  return {
    externalId: uid,
    title: line("SUMMARY") ?? "(no title)",
    startTime: start,
    endTime: parseDt(line("DTEND")) ?? start,
    attendees,
    location: line("LOCATION"),
    description: line("DESCRIPTION"),
  };
}

/** Syncs the next 30 days of events for a user from their connected calendar. */
export async function syncCalendar(userId: string): Promise<{ synced: number }> {
  const conn = await prisma.calendarConnection.findUnique({ where: { userId } });
  if (!conn || !conn.connected) return { synced: 0 };

  const now = new Date();
  const to = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (conn.provider === "GOOGLE") {
    let accessToken = conn.accessToken ? decryptToken(conn.accessToken) : "";
    if (conn.refreshToken) {
      const t = await refreshAccess(decryptToken(conn.refreshToken));
      accessToken = t.accessToken;
      await prisma.calendarConnection.update({
        where: { userId },
        data: { accessToken: encryptToken(t.accessToken), syncedAt: now },
      });
    }
    const events = await listGoogleEvents(accessToken, now.toISOString(), to.toISOString());
    const result = await upsertEvents(userId, events.map(mapGoogle));
    await prisma.calendarConnection.update({ where: { userId }, data: { syncedAt: now } });
    return result;
  }

  if (conn.provider === "APPLE" && conn.calDavUrl && conn.calDavUser && conn.calDavPass) {
    const { createDAVClient } = await import("tsdav");
    const client = await createDAVClient({
      serverUrl: conn.calDavUrl,
      credentials: { username: conn.calDavUser, password: decryptToken(conn.calDavPass) },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });
    const calendars = await client.fetchCalendars();
    const normalized: NormalizedEvent[] = [];
    for (const cal of calendars.slice(0, 5)) {
      const objects = await client.fetchCalendarObjects({
        calendar: cal,
        timeRange: { start: now.toISOString(), end: to.toISOString() },
      });
      for (const o of objects) {
        const e = typeof o.data === "string" ? parseICS(o.data) : null;
        if (e) normalized.push(e);
      }
    }
    const result = await upsertEvents(userId, normalized);
    await prisma.calendarConnection.update({ where: { userId }, data: { syncedAt: now } });
    return result;
  }

  return { synced: 0 };
}

export interface CalDavInput {
  appleId: string;
  appPassword: string;
}

/** Verifies Apple CalDAV credentials work; returns the discovered server URL. */
export async function verifyAppleCalDav(input: CalDavInput): Promise<string> {
  const { createDAVClient } = await import("tsdav");
  const serverUrl = "https://caldav.icloud.com";
  const client = await createDAVClient({
    serverUrl,
    credentials: { username: input.appleId, password: input.appPassword },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });
  await client.fetchCalendars();
  return serverUrl;
}
