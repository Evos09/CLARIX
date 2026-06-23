import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, AUDIO_BUCKET, isSupabaseConfigured, ensureAudioBucket } from "@/lib/supabase";
import { getOrCreateContext } from "@/lib/auth";
import { getOrgPlan, storageLimitBytes, maxUploadBytes, orgStorageUsed } from "@/lib/plan";

const Body = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().optional(),
  size: z.number().int().positive().optional(),
});

const mb = (n: number) => `${Math.round(n / (1024 * 1024))} MB`;

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const ctx = await getOrCreateContext();
  if (!ctx) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const size = parsed.data.size;
  if (size) {
    const max = maxUploadBytes();
    if (size > max) {
      return NextResponse.json(
        { error: `That file is ${mb(size)}. The maximum upload size is ${mb(max)}.` },
        { status: 413 },
      );
    }
    const plan = await getOrgPlan(ctx.orgId);
    const limit = storageLimitBytes(plan);
    if (limit !== null) {
      const used = await orgStorageUsed(ctx.orgId);
      if (used + size > limit) {
        return NextResponse.json(
          { error: `This upload would exceed your ${plan.name} storage limit of ${mb(limit)}. Delete a meeting or upgrade.` },
          { status: 403 },
        );
      }
    }
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
