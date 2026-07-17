import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { BaseOutput } from "@/lib/outputTypes";

// Outbound webhooks: POST a signed JSON payload to every enabled endpoint a user
// has configured. Receivers (Zapier, Make, n8n, custom servers) verify the
// X-Clarix-Signature header = "sha256=" + HMAC_SHA256(secret, rawBody).

export function newWebhookSecret(): string {
  return "whsec_" + crypto.randomBytes(24).toString("hex");
}

export type MeetingWebhookPayload = {
  event: "meeting.completed";
  meetingId: string;
  title: string;
  url: string;
  meetingType: string;
  tldr: string;
  keyDecisions: string[];
  actionItems: { task: string; owner?: string; dueDate?: string; priority?: string }[];
  firedAt: string;
};

export function sign(secret: string, body: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
}

/** Deliver `payload` to all of a user's enabled webhook endpoints. Best-effort:
 *  each delivery is independent, records its HTTP status, and never throws. */
export async function fireMeetingWebhooks(userId: string, payload: MeetingWebhookPayload): Promise<void> {
  const hooks = await prisma.webhookEndpoint.findMany({ where: { userId, enabled: true } });
  if (!hooks.length) return;
  const body = JSON.stringify(payload);

  await Promise.all(
    hooks.map(async (h) => {
      let status = 0;
      try {
        const res = await fetch(h.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "CLARIX-Webhook/1.0",
            "X-Clarix-Event": payload.event,
            "X-Clarix-Signature": sign(h.secret, body),
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });
        status = res.status;
      } catch {
        status = 0; // timeout / DNS / connection failure
      }
      await prisma.webhookEndpoint
        .update({ where: { id: h.id }, data: { lastFiredAt: new Date(), lastStatus: status } })
        .catch(() => {});
    }),
  );
}

/** Build the meeting.completed payload from a processed meeting's output. */
export function buildMeetingPayload(opts: {
  meetingId: string;
  title: string;
  url: string;
  meetingType: string;
  output: BaseOutput;
}): MeetingWebhookPayload {
  const { output } = opts;
  return {
    event: "meeting.completed",
    meetingId: opts.meetingId,
    title: opts.title,
    url: opts.url,
    meetingType: opts.meetingType,
    tldr: output.tldr ?? "",
    keyDecisions: Array.isArray(output.keyDecisions) ? output.keyDecisions : [],
    actionItems: (Array.isArray(output.actionItems) ? output.actionItems : []).map((a) => ({
      task: a.task,
      owner: a.owner,
      dueDate: a.dueDate,
      priority: a.priority,
    })),
    firedAt: new Date().toISOString(),
  };
}
