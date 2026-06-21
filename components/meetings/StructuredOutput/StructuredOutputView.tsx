import { UniversalOutput } from "./UniversalOutput";
import { ExtraSections } from "./ExtraSections";
import { RegenerateButton } from "./RegenerateButton";
import type { BaseOutput } from "@/lib/outputTypes";

export function StructuredOutputView({
  meetingId,
  output,
}: {
  meetingId: string;
  output: BaseOutput;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <RegenerateButton meetingId={meetingId} />
      </div>
      <UniversalOutput output={output} />
      <ExtraSections output={output} />
    </div>
  );
}
