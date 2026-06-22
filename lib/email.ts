import { Resend } from "resend";

let client: Resend | null = null;

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getResend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = process.env.EMAIL_FROM ?? "CLARIX <onboarding@resend.dev>";

/** Best-effort "your meeting is ready" notification. Never throws. */
export async function sendMeetingComplete(opts: { to: string; title: string; meetingId: string }): Promise<void> {
  if (!isResendConfigured() || !opts.to) return;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    await getResend().emails.send({
      from: FROM,
      to: [opts.to],
      subject: `✅ ${opts.title} is ready`,
      html: `<div style="font-family:Inter,sans-serif">
        <h2 style="color:#0a1628">CLAR<span style="color:#00c8b4">IX</span></h2>
        <p>Your meeting <strong>${opts.title}</strong> has been transcribed and analyzed.</p>
        <p><a href="${base}/meetings/${opts.meetingId}" style="color:#00c8b4">View the summary →</a></p>
      </div>`,
    });
  } catch {
    // best-effort
  }
}

/** Sends a pre-rendered HTML email via Resend. Throws on failure. */
export async function sendHtml(opts: { to: string[]; subject: string; html: string }): Promise<{ id?: string }> {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}
