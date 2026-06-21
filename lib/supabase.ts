import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const AUDIO_BUCKET = process.env.SUPABASE_AUDIO_BUCKET ?? "clarix-audio";

let admin: SupabaseClient | null = null;

/** Normalizes a Supabase project URL: strips trailing slashes and a stray /rest/v1. */
function normalizeSupabaseUrl(u: string): string {
  return u.replace(/\/+$/, "").replace(/\/rest\/v1$/, "").replace(/\/+$/, "");
}

/** Server-side Supabase client using the service role key. */
export function getSupabaseAdmin(): SupabaseClient {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) {
    throw new Error("Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) not set");
  }
  if (!admin) {
    admin = createClient(normalizeSupabaseUrl(rawUrl), key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let bucketReady = false;

/** Creates the audio bucket (private) if it does not already exist. */
export async function ensureAudioBucket(): Promise<void> {
  if (bucketReady) return;
  const sb = getSupabaseAdmin();
  const { data } = await sb.storage.getBucket(AUDIO_BUCKET);
  if (!data) {
    await sb.storage.createBucket(AUDIO_BUCKET, { public: false });
  }
  bucketReady = true;
}
