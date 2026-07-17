import { prisma } from "@/lib/prisma";
import type { Meeting } from "@prisma/client";
import type { OrgUserContext } from "@/lib/auth";

/**
 * Resolves whether the current user may touch a meeting, honoring per-meeting
 * sharing (see MeetingCollaborator). A meeting is accessible when the user's
 * org owns it OR the user has been added as a collaborator.
 *
 * - `requireEdit: false` (default) → owner org + any collaborator (VIEWER/EDITOR).
 * - `requireEdit: true`            → owner org + EDITOR collaborators only.
 *
 * Returns the full meeting row, or null if not found / not permitted. Use this
 * in place of `prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } })`.
 */
export async function getAccessibleMeeting(
  id: string,
  ctx: OrgUserContext,
  opts: { requireEdit?: boolean } = {},
): Promise<Meeting | null> {
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) return null;

  // Owner org has full access.
  if (meeting.orgId === ctx.orgId) return meeting;

  // Otherwise the user must be a collaborator on this specific meeting.
  const collab = await prisma.meetingCollaborator.findUnique({
    where: { meetingId_userId: { meetingId: id, userId: ctx.userId } },
  });
  if (!collab) return null;
  if (opts.requireEdit && collab.role !== "EDITOR") return null;
  return meeting;
}

/** True if the user owns the meeting's org (as opposed to being a collaborator). */
export function isMeetingOwner(meeting: Pick<Meeting, "orgId">, ctx: OrgUserContext): boolean {
  return meeting.orgId === ctx.orgId;
}
