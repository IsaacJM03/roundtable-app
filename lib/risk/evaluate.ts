import { detectRisk, type RiskFlag } from "@/lib/riskDetection";
import { classifyRiskWithGroq, isGroqConfigured, type GroqTranscriptLine } from "./groq";
import { hasSoftSignals } from "./softSignals";

export type RiskSource =
  | "none"
  | "rules"
  | "rules_context"
  | "llm"
  | "llm_skipped";

export type SessionMessage = {
  content: string;
  sender_role: string;
};

export type RiskEvaluation = {
  risk: RiskFlag;
  source: RiskSource;
  confidence?: number;
  reason?: string;
};

/** ponytail: fixed window; upgrade path is token-budget summarization for long sessions */
const CONTEXT_LIMIT = 5;
const LLM_CONFIDENCE_THRESHOLD = 0.72;

function userTexts(messages: SessionMessage[], extra?: string): string[] {
  const fromHistory = messages
    .filter((m) => m.sender_role === "user")
    .map((m) => m.content);
  return extra ? [...fromHistory, extra] : fromHistory;
}

function rulesScan(texts: string[]): RiskFlag {
  for (const t of texts) {
    const r = detectRisk(t);
    if (r !== "none") return r;
  }
  return "none";
}

export function buildTranscript(
  recent: SessionMessage[],
  current: { content: string; sender_role: string }
): GroqTranscriptLine[] {
  const merged = [...recent];
  const last = merged[merged.length - 1];
  if (!last || last.content !== current.content || last.sender_role !== current.sender_role) {
    merged.push(current);
  }

  return merged
    .filter((m) => m.sender_role !== "system")
    .slice(-CONTEXT_LIMIT)
    .map((m) => ({
      role: m.sender_role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));
}

/**
 * Hybrid risk evaluation:
 * A) hard rules on current + recent user lines (instant)
 * B) LLM only when soft/ambiguous signals appear (saves calls)
 * C) LLM sees last N messages as transcript context
 */
export async function evaluateSessionRisk(opts: {
  currentMessage: string;
  currentSenderRole: "user" | "counselor";
  recentMessages: SessionMessage[];
}): Promise<RiskEvaluation> {
  const { currentMessage, currentSenderRole, recentMessages } = opts;

  const direct = detectRisk(currentMessage);
  if (direct !== "none") {
    return { risk: direct, source: "rules" };
  }

  const users = userTexts(
    recentMessages.slice(-CONTEXT_LIMIT),
    currentSenderRole === "user" ? currentMessage : undefined
  );

  const fromContext = rulesScan(users);
  if (fromContext !== "none") {
    return { risk: fromContext, source: "rules_context" };
  }

  const ambiguous = users.some(hasSoftSignals);
  if (!ambiguous) {
    return { risk: "none", source: "none" };
  }

  if (!isGroqConfigured()) {
    return { risk: "none", source: "llm_skipped" };
  }

  const transcript = buildTranscript(recentMessages, {
    content: currentMessage,
    sender_role: currentSenderRole,
  });

  const llm = await classifyRiskWithGroq({ transcript });
  if (!llm) {
    return { risk: "none", source: "llm_skipped" };
  }

  if (llm.risk !== "none" && llm.confidence >= LLM_CONFIDENCE_THRESHOLD) {
    return {
      risk: llm.risk,
      source: "llm",
      confidence: llm.confidence,
      reason: llm.reason,
    };
  }

  return {
    risk: "none",
    source: "llm",
    confidence: llm.confidence,
    reason: llm.reason,
  };
}
