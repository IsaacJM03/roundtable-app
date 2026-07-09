export type RiskFlag = "none" | "self_harm" | "harm_to_others";

/**
 * Conservative rule-based risk detection (tier 1 — instant).
 * For soft-signal + LLM + session context, see lib/risk/evaluate.ts.
 * Reviewable by non-engineers — edit patterns here, not in routing code.
 */

const SELF_HARM_PHRASES = [
  "kill myself",
  "end my life",
  "want to die",
  "suicide",
  "self-harm",
  "self harm",
  "hurt myself",
  "don't want to live",
  "dont want to live",
];

const HARM_OTHERS_PHRASES = [
  "hurt someone",
  "kill someone",
  "harm others",
  "going to hurt",
  "attack someone",
];

const IMMINENT_PATTERN = /in the next \d+ (minute|minutes|hour|hours)/i;

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function matchesAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => text.includes(p));
}

export function detectRisk(text: string): RiskFlag {
  const n = normalize(text);
  if (!n) return "none";

  if (matchesAny(n, HARM_OTHERS_PHRASES)) return "harm_to_others";
  if (matchesAny(n, SELF_HARM_PHRASES) || IMMINENT_PATTERN.test(n)) return "self_harm";

  return "none";
}
