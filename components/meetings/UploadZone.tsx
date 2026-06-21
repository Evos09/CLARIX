"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPT = ".mp3,.mp4,.m4a,.wav,.webm,audio/*,video/*";
const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

export function UploadZone({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handle(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("File exceeds the 2GB limit.");
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors",
          dragging ? "border-teal bg-teal/5" : "border-border hover:bg-muted/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <UploadCloud className="size-8 text-teal-600" />
        <span className="font-medium">Drag &amp; drop audio or video</span>
        <span className="text-sm text-muted-foreground">or click to browse · MP3, MP4, M4A, WAV, WEBM · up to 2GB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
