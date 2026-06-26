import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, AUDIO_BUCKET, isSupabaseConfigured, ensureAudioBucket } from "@/lib/supabase";
import { getOrCreateAnonymousContext } from "@/lib/auth";

const Body = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().optional(),
  size: z.number().int().positive().optional(),
});

const mb = (n: number) => `${Math.round(n / (1024 * 1024))} MB`;
const MAX_DEMO_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const ctx = await getOrCreateAnonymousContext();
  if (!ctx) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const size = parsed.data.size;
  if (size && size > MAX_DEMO_SIZE) {
    return NextResponse.json(
      { error: `That file is ${mb(size)}. The maximum demo upload size is 15 MB. Please sign up to upload larger files.` },
      { status: 413 },
    );
  }

  await ensureAudioBucket();
  const safe = parsed.data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  const path = `${ctx.orgId}/${crypto.randomUUID()}-${safe}`;

  const { data, error } = await getSupabaseAdmin()
    .storage.from(AUDIO_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create upload URL" }, { status: 500 });
  }
  return NextResponse.json({ path: data.path, token: data.token, signedUrl: data.signedUrl });
}
