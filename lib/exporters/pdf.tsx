import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { BaseOutput } from "@/lib/outputTypes";
import { extraKeys } from "@/lib/outputTypes";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#1e293b", fontFamily: "Helvetica" },
  brand: { fontSize: 18, color: "#0b0b14", fontFamily: "Helvetica-Bold" },
  brandAccent: { color: "#6d28d9" },
  meta: { fontSize: 9, color: "#64748b", marginBottom: 16 },
  h2: { fontSize: 13, color: "#0b0b14", marginTop: 16, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  tldr: { backgroundColor: "#e6faf7", padding: 10, borderRadius: 4, marginBottom: 8 },
  item: { marginBottom: 4 },
  bullet: { marginBottom: 3, paddingLeft: 8 },
});

function renderExtraValue(val: unknown): React.ReactNode {
  if (val === null || val === undefined) return null;

  if (Array.isArray(val)) {
    return (
      <View>
        {val.map((item, idx) => {
          if (typeof item === "object" && item !== null) {
            const parts = Object.entries(item)
              .filter(([_, v]) => v !== null && v !== undefined && typeof v !== "object")
              .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()}: ${v}`);
            return parts.length ? <Text key={idx} style={s.bullet}>• {parts.join(" · ")}</Text> : null;
          }
          return <Text key={idx} style={s.bullet}>• {String(item)}</Text>;
        })}
      </View>
    );
  }

  if (typeof val === "object") {
    const parts = Object.entries(val)
      .filter(([_, v]) => v !== null && v !== undefined && typeof v !== "object")
      .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()}: ${v}`);
    return parts.length ? <Text style={s.bullet}>{parts.join(" · ")}</Text> : null;
  }

  return <Text style={s.item}>{String(val)}</Text>;
}

export async function meetingPdf(opts: {
  title: string;
  typeLabel: string;
  date: string;
  output: BaseOutput;
}): Promise<Buffer> {
  const { output } = opts;
  const actionItems = output.actionItems ?? [];
  const decisions = output.keyDecisions ?? [];
  const questions = output.openQuestions ?? [];
  const extras = extraKeys(output);

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>
          CLAR<Text style={s.brandAccent}>IX</Text>
        </Text>
        <Text style={{ fontSize: 16, marginTop: 8 }}>{opts.title}</Text>
        <Text style={s.meta}>
          {opts.typeLabel} · {opts.date}
        </Text>

        {output.tldr ? (
          <View style={s.tldr}>
            <Text>{output.tldr}</Text>
          </View>
        ) : null}

        {actionItems.length ? (
          <View>
            <Text style={s.h2}>Action Items</Text>
            {actionItems.map((a, i) => (
              <Text key={i} style={s.item}>
                • {a.task}
                {a.owner ? ` — ${a.owner}` : ""}
                {a.dueDate ? ` (due ${a.dueDate})` : ""}
                {a.priority ? ` [${a.priority}]` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        {decisions.length ? (
          <View>
            <Text style={s.h2}>Key Decisions</Text>
            {decisions.map((d, i) => (
              <Text key={i} style={s.bullet}>• {d}</Text>
            ))}
          </View>
        ) : null}

        {questions.length ? (
          <View>
            <Text style={s.h2}>Open Questions</Text>
            {questions.map((q, i) => (
              <Text key={i} style={s.bullet}>• {q}</Text>
            ))}
          </View>
        ) : null}

        {extras.map((k) => (
          <View key={k}>
            <Text style={s.h2}>{k.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase())}</Text>
            {renderExtraValue(output[k])}
          </View>
        ))}
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
