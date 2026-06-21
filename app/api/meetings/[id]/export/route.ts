import { NextResponse } from "next/server";
import { format as fmtDate } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getOrgPlan, canExportFormat } from "@/lib/plan";
import { getMeetingType } from "@/lib/meetingTypes";
import { isClaudeConfigured } from "@/lib/claude";
import type { BaseOutput } from "@/lib/outputTypes";
import { meetingPdf } from "@/lib/exporters/pdf";
import { meetingDocx } from "@/lib/exporters/docx";
import { meetingCsv } from "@/lib/exporters/csv";
import { generateDraft } from "@/lib/exporters/drafts";
import { toFhirBundle } from "@/lib/exporters/fhir";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "meeting";
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const format = (new URL(req.url).searchParams.get("format") ?? "pdf").toLowerCase();
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = await getOrgPlan(ctx.orgId);
  const output = (meeting.structuredOutput as unknown as BaseOutput | null) ?? null;
  const typeLabel = getMeetingType(meeting.meetingType).label;
  const date = fmtDate(meeting.createdAt, "MMM d, yyyy");
  const name = slug(meeting.title);

  if (format === "email" || format === "slack") {
    if (!plan.askClarix) return NextResponse.json({ error: "Upgrade to Pro to generate drafts." }, { status: 403 });
    if (!isClaudeConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    if (!meeting.rawTranscript) return NextResponse.json({ error: "No transcript" }, { status: 409 });
    const text = await generateDraft({ kind: format, title: meeting.title, transcript: meeting.rawTranscript, structured: output });
    return NextResponse.json({ text });
  }

  const FMT = format.toUpperCase();
  if (!canExportFormat(plan, FMT)) {
    return NextResponse.json({ error: `${FMT} export is not available on the ${plan.name} plan.` }, { status: 403 });
  }
  if (!output) return NextResponse.json({ error: "No analysis to export yet." }, { status: 409 });

  if (format === "json") {
    return new Response(JSON.stringify(output, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="${name}.json"` },
    });
  }
  if (format === "ehr_hl7" || format === "ehr") {
    const bundle = toFhirBundle({ title: meeting.title, date, output });
    return new Response(JSON.stringify(bundle, null, 2), {
      headers: { "Content-Type": "application/fhir+json", "Content-Disposition": `attachment; filename="${name}-fhir.json"` },
    });
  }
  if (format === "csv") {
    return new Response(meetingCsv(output), {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${name}.csv"` },
    });
  }
  if (format === "docx") {
    const buf = await meetingDocx({ title: meeting.title, typeLabel, date, output });
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${name}.docx"`,
      },
    });
  }
  const buf = await meetingPdf({ title: meeting.title, typeLabel, date, output });
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}.pdf"` },
  });
}
