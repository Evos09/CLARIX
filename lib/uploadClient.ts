"use client";

export interface CreateMeetingOpts {
  title: string;
  meetingType: string;
  autoDetect: boolean;
}

function putWithProgress(url: string, file: Blob, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
}

/**
 * Full client upload flow:
 * 1. request a signed upload URL, 2. PUT the file (with progress),
 * 3. create the Meeting row, 4. trigger transcription. Returns the meeting id.
 */
export async function createMeetingFromFile(
  file: File,
  opts: CreateMeetingOpts,
  onProgress: (pct: number) => void,
): Promise<string> {
  const signRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!signRes.ok) throw new Error((await signRes.json()).error ?? "Could not start upload");
  const { path, signedUrl } = await signRes.json();

  await putWithProgress(signedUrl, file, onProgress);

  const createRes = await fetch("/api/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...opts, storagePath: path }),
  });
  if (!createRes.ok) throw new Error((await createRes.json()).error ?? "Could not create meeting");
  const meeting = await createRes.json();

  await fetch(`/api/meetings/${meeting.id}/transcribe`, { method: "POST" });
  return meeting.id as string;
}
