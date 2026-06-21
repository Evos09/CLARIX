import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BaseOutput } from "@/lib/outputTypes";
import { extraKeys } from "@/lib/outputTypes";
import { humanize, isPlainObject } from "./format";

function Primitive({ value }: { value: unknown }) {
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (value === "" || value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  return <span>{String(value)}</span>;
}

function ObjectRows({ obj }: { obj: Record<string, unknown> }) {
  return (
    <div className="space-y-1 text-sm">
      {Object.entries(obj).map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <span className="shrink-0 font-medium text-muted-foreground">{humanize(k)}:</span>
          {Array.isArray(v) ? (
            <span>{v.map((x) => (isPlainObject(x) ? Object.values(x).join(" — ") : String(x))).join(", ")}</span>
          ) : isPlainObject(v) ? (
            <span>{Object.values(v).map(String).join(" — ")}</span>
          ) : (
            <Primitive value={v} />
          )}
        </div>
      ))}
    </div>
  );
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <p className="text-sm text-muted-foreground">None</p>;
    if (value.every((v) => !isPlainObject(v))) {
      return (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {value.map((v, i) => <li key={i}><Primitive value={v} /></li>)}
        </ul>
      );
    }
    return (
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ObjectRows obj={v as Record<string, unknown>} />
          </div>
        ))}
      </div>
    );
  }
  if (isPlainObject(value)) return <ObjectRows obj={value} />;
  return <p className="text-sm"><Primitive value={value} /></p>;
}

/** Renders the type-specific (non-base) fields of any meeting's structured output. */
export function ExtraSections({ output }: { output: BaseOutput }) {
  const keys = extraKeys(output).filter((k) => {
    const v = output[k];
    return !(Array.isArray(v) && v.length === 0) && v !== "" && v !== null && v !== undefined;
  });
  if (keys.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {keys.map((k) => (
        <Card key={k}>
          <CardHeader><CardTitle className="text-base">{humanize(k)}</CardTitle></CardHeader>
          <CardContent>{renderValue(output[k])}</CardContent>
        </Card>
      ))}
    </div>
  );
}
