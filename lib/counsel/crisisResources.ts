import type { RiskFlag } from "@/lib/riskDetection";

const DEFAULT_SELF_HARM =
  "If you're in crisis, you can call or text 988 (US) or your local emergency number. " +
  "You matter. A volunteer will be with you as soon as possible.";

const DEFAULT_HARM_TO_OTHERS =
  "If you or someone else may be in immediate danger, please contact local emergency services. " +
  "A volunteer will join this chat shortly.";

export function crisisResourceMessage(risk: RiskFlag): string {
  if (risk === "self_harm") {
    return (
      process.env.CRISIS_SELF_HARM_MESSAGE?.trim() ||
      process.env.CRISIS_RESOURCES_MESSAGE?.trim() ||
      DEFAULT_SELF_HARM
    );
  }
  if (risk === "harm_to_others") {
    return (
      process.env.CRISIS_HARM_TO_OTHERS_MESSAGE?.trim() ||
      process.env.CRISIS_RESOURCES_MESSAGE?.trim() ||
      DEFAULT_HARM_TO_OTHERS
    );
  }
  return "";
}
