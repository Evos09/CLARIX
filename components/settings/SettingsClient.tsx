"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GENERAL_TYPES, PRO_TYPES } from "@/lib/meetingTypes";

interface Template {
  id: string;
  name: string;
  meetingType: string;
  promptOverride: string;
}

export function SettingsClient({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [tName, setTName] = useState("");
  const [tType, setTType] = useState("GENERAL");
  const [tPrompt, setTPrompt] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/templates").then((r) => (r.ok ? r.json() : [])).then(setTemplates).catch(() => {});
  }, []);

  async function saveName() {
    setSavingName(true);
    await fetch("/api/org", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => {});
    setSavingName(false);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 1500);
  }

  async function addTemplate() {
    if (!tName.trim() || !tPrompt.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tName, meetingType: tType, promptOverride: tPrompt }),
      });
      if (res.ok) {
        const created = await res.json();
        setTemplates((t) => [...t, created]);
        setTName("");
        setTPrompt("");
      }
    } finally {
      setAdding(false);
    }
  }

  async function remove(id: string) {
    setTemplates((t) => t.filter((x) => x.id !== id));
    await fetch(`/api/templates?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="orgName">Name</Label>
            <div className="flex gap-2">
              <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
              <Button variant="accent" onClick={saveName} disabled={savingName}>
                {savingName ? <Loader2 className="size-4 animate-spin" /> : savedName ? <Check className="size-4" /> : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Custom AI instructions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Override how CLARIX analyzes a meeting type for your organization.
          </p>
          {templates.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.name} <span className="text-xs text-muted-foreground">- {t.meetingType}</span></p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.promptOverride}</p>
              </div>
              <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <div className="space-y-2 rounded-md border border-dashed border-border p-3">
            <div className="flex gap-2">
              <Input placeholder="Template name" value={tName} onChange={(e) => setTName(e.target.value)} />
              <select value={tType} onChange={(e) => setTType(e.target.value)} className="h-10 rounded-md border border-input bg-card px-3 text-sm">
                <optgroup label="General">{GENERAL_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>
                <optgroup label="Pro">{PRO_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>
              </select>
            </div>
            <textarea
              placeholder="e.g. Always extract budget figures and flag compliance concerns."
              value={tPrompt}
              onChange={(e) => setTPrompt(e.target.value)}
              className="h-20 w-full rounded-md border border-input bg-card p-2 text-sm"
            />
            <Button variant="outline" size="sm" onClick={addTemplate} disabled={adding}>
              {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add instruction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
