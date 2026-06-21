import type { BaseOutput } from "@/lib/outputTypes";

/**
 * Minimal HL7 FHIR R4 Bundle for EHR import, built from a healthcare meeting's
 * structured output (SOAP note, ICD-10 suggestions, medications).
 * Falls back to a Composition with the TLDR for non-medical meetings.
 */
export function toFhirBundle(opts: { title: string; date: string; output: BaseOutput }): object {
  const o = opts.output as unknown as Record<string, unknown>;
  const soap = (o.soap ?? {}) as Record<string, string>;
  const meds = (Array.isArray(o.medications) ? o.medications : []) as Array<Record<string, string>>;
  const icds = (Array.isArray(o.icdSuggestions) ? o.icdSuggestions : []) as string[];

  const div = (s: string) => ({ status: "generated", div: `<div xmlns="http://www.w3.org/1999/xhtml">${s || ""}</div>` });

  const entry: object[] = [
    {
      resource: {
        resourceType: "Composition",
        status: "final",
        type: { text: "Clinical note" },
        title: opts.title,
        date: opts.date,
        section: [
          { title: "Subjective", text: div(soap.subjective ?? opts.output.tldr ?? "") },
          { title: "Objective", text: div(soap.objective ?? "") },
          { title: "Assessment", text: div(soap.assessment ?? "") },
          { title: "Plan", text: div(soap.plan ?? "") },
        ],
      },
    },
  ];

  for (const code of icds) {
    entry.push({
      resource: {
        resourceType: "Condition",
        clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
        code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code }], text: code },
      },
    });
  }

  for (const m of meds) {
    entry.push({
      resource: {
        resourceType: "MedicationStatement",
        status: "active",
        medicationCodeableConcept: { text: m.name ?? "" },
        dosage: [{ text: [m.dosage, m.frequency].filter(Boolean).join(" ") }],
      },
    });
  }

  return { resourceType: "Bundle", type: "collection", entry };
}
