import { UniversalOutput } from "./UniversalOutput";
import { ExtraSections } from "./ExtraSections";
import { RegenerateButton } from "./RegenerateButton";
import { MedicalOutput } from "./MedicalOutput";
import { LegalOutput } from "./LegalOutput";
import { FinancialOutput } from "./FinancialOutput";
import type { BaseOutput } from "@/lib/outputTypes";

export function StructuredOutputView({
  meetingId,
  output,
  meetingType,
  isDemo = false,
  canEdit = true,
}: {
  meetingId: string;
  output: any;
  meetingType?: string;
  isDemo?: boolean;
  canEdit?: boolean;
}) {
  const isMed = meetingType === "MEDICAL_APPOINTMENT";
  const isLegal = meetingType === "LEGAL_DEPOSITION";
  const isFin = meetingType === "FINANCIAL_ADVISORY";

  return (
    <div className="space-y-6">
      {!isDemo && canEdit && (
        <div className="flex justify-end">
          <RegenerateButton meetingId={meetingId} />
        </div>
      )}
      {isMed && <MedicalOutput output={output} meetingId={meetingId} isDemo={isDemo} />}
      {isLegal && <LegalOutput output={output} meetingId={meetingId} isDemo={isDemo} />}
      {isFin && <FinancialOutput output={output} meetingId={meetingId} isDemo={isDemo} />}
      {!isMed && !isLegal && !isFin && (
        <>
          <UniversalOutput output={output} />
          <ExtraSections output={output} />
        </>
      )}
    </div>
  );
}


