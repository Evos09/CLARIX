"use client";

import { GENERAL_TYPES, PRO_TYPES } from "@/lib/meetingTypes";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function MeetingTypeSelector({
  value,
  autoDetect,
  onChange,
  onAutoDetectChange,
}: {
  value: string;
  autoDetect: boolean;
  onChange: (v: string) => void;
  onAutoDetectChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>Meeting type</Label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={autoDetect}
          onChange={(e) => onAutoDetectChange(e.target.checked)}
          className="size-4 accent-teal-600"
        />
        Auto-detect from the transcript
      </label>
      <select
        value={value}
        disabled={autoDetect}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          autoDetect && "opacity-50",
        )}
      >
        <optgroup label="General">
          {GENERAL_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </optgroup>
        <optgroup label="Pro Verticals (Enterprise)">
          {PRO_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
