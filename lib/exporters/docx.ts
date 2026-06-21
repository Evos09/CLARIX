import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import type { BaseOutput } from "@/lib/outputTypes";
import { extraKeys } from "@/lib/outputTypes";

export async function meetingDocx(opts: {
  title: string;
  typeLabel: string;
  date: string;
  output: BaseOutput;
}): Promise<Buffer> {
  const { output } = opts;
  const children: Paragraph[] = [
    new Paragraph({ text: "CLARIX", heading: HeadingLevel.TITLE }),
    new Paragraph({ text: opts.title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ children: [new TextRun({ text: `${opts.typeLabel} · ${opts.date}`, italics: true, color: "64748B" })] }),
  ];

  if (output.tldr) {
    children.push(new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ text: output.tldr }));
  }
  if (output.actionItems?.length) {
    children.push(new Paragraph({ text: "Action Items", heading: HeadingLevel.HEADING_2 }));
    for (const a of output.actionItems) {
      const bits = [a.task, a.owner && `— ${a.owner}`, a.dueDate && `(due ${a.dueDate})`, a.priority && `[${a.priority}]`].filter(Boolean);
      children.push(new Paragraph({ text: bits.join(" "), bullet: { level: 0 } }));
    }
  }
  if (output.keyDecisions?.length) {
    children.push(new Paragraph({ text: "Key Decisions", heading: HeadingLevel.HEADING_2 }));
    for (const d of output.keyDecisions) children.push(new Paragraph({ text: d, bullet: { level: 0 } }));
  }
  if (output.openQuestions?.length) {
    children.push(new Paragraph({ text: "Open Questions", heading: HeadingLevel.HEADING_2 }));
    for (const q of output.openQuestions) children.push(new Paragraph({ text: q, bullet: { level: 0 } }));
  }
  for (const k of extraKeys(output)) {
    children.push(new Paragraph({ text: k.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase()), heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ text: JSON.stringify(output[k], null, 2) }));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
