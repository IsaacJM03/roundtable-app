import type { RiskFlag } from "@/lib/riskDetection";

export function crisisResourceMessage(risk: RiskFlag): string {
  if (risk === "self_harm") {
    return (
      "If you're in crisis, you can call or text 999 or 911 (local emergency services). " +
      "You matter. A volunteer will be with you as soon as possible."
    );
  }
  if (risk === "harm_to_others") {
    return (
      "If you or someone else may be in immediate danger, please contact local emergency services (999 or 911). " +
      "A volunteer will join this chat shortly."
    );
  }
  return "";
}
