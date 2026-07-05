import { ShieldAlert, Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SoapNote {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface MedicalOutputProps {
  meetingId: string;
  output: {
    soap?: SoapNote;
    icdSuggestions?: string[];
    medications?: Medication[];
    allergyFlags?: string[];
    followUpDate?: string;
  };
  isDemo?: boolean;
}

export function MedicalOutput({ output }: MedicalOutputProps) {
  const soap = output.soap ?? {};
  const icdSuggestions = output.icdSuggestions ?? [];
  const medications = output.medications ?? [];
  const allergyFlags = output.allergyFlags ?? [];

  return (
    <div className="space-y-6">
      {/* HIPAA Compliance and Clinical Disclaimer */}
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 text-xs">
        <div className="flex gap-2 text-amber-800">
          <ShieldAlert className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Clinical & Compliance Advisory Notice</p>
            <p className="text-muted-foreground leading-relaxed">
              CLARIX is not currently HIPAA or SOC 2 certified. This template is intended solely for demonstrative or research contexts and must not be used to process, store, or transmit protected health information (PHI) unless a Business Associate Agreement (BAA) has been executed. All structured clinical summaries, ICD-10 suggestions, and extracted medications are AI-generated recommendations and must be verified by a licensed clinician before any medical decision or charting entry.
            </p>
          </div>
        </div>
      </div>

      {/* SOAP Notes 2x2 Quadrant Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
              <span>Subjective (S)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 whitespace-pre-line">
              {soap.subjective || "No subjective description provided."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <span>Objective (O)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 whitespace-pre-line">
              {soap.objective || "No physical examinations/vitals recorded."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <span>Assessment (A)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 whitespace-pre-line">
              {soap.assessment || "No clinical impressions or assessment."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
              <span>Plan (P)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 whitespace-pre-line">
              {soap.plan || "No treatment or follow-up actions recorded."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allergies Alert (if present) */}
      {allergyFlags.length > 0 && (
        <Card className="border border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-destructive">Allergy Warnings Detected</p>
              <div className="flex flex-wrap gap-2">
                {allergyFlags.map((flag, idx) => (
                  <Badge key={idx} className="bg-red-100 text-red-700 ring-red-600/20 font-mono text-xs">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ICD-10 Code Suggestions */}
      {icdSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground" />
              ICD-10 Diagnostic Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {icdSuggestions.map((code, idx) => (
                <Badge key={idx} className="bg-sky-50/50 text-sky-700 ring-sky-600/20 py-1 px-3 text-xs font-semibold">
                  {code}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground italic">
              Disclaimer: Coding recommendations are for clinician verification and audit purposes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Medications Table */}
      {medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Prescriptions & Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    <th className="p-3">Medication Name</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {medications.map((med, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="p-3 font-medium text-foreground">{med.name}</td>
                      <td className="p-3 text-muted-foreground">{med.dosage || "—"}</td>
                      <td className="p-3 text-muted-foreground">{med.frequency || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow Up date */}
      {output.followUpDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4 text-violet-500" />
          <span>Suggested follow up: <strong>{output.followUpDate}</strong></span>
        </div>
      )}
    </div>
  );
}
