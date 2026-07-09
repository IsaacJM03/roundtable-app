import { buildTranscript, evaluateSessionRisk } from "./evaluate";
import { hasSoftSignals } from "./softSignals";
import { parseGroqRiskJson } from "./groq";
import { detectRisk } from "@/lib/riskDetection";

// soft signals
if (!hasSoftSignals("I just can't go on like this")) throw new Error("soft signal miss");
if (hasSoftSignals("that exam killed me")) throw new Error("soft signal false positive");

// rules still work
if (detectRisk("I want to kill myself") !== "self_harm") throw new Error("rules regression");

// groq json parser
const parsed = parseGroqRiskJson(
  '{"risk":"self_harm","confidence":0.91,"reason":"suicidal ideation"}'
);
if (!parsed || parsed.risk !== "self_harm" || parsed.confidence < 0.9) {
  throw new Error("groq parse failed");
}

// transcript builder
const transcript = buildTranscript(
  [
    { content: "hi", sender_role: "user" },
    { content: "hello", sender_role: "counselor" },
  ],
  { content: "I can't go on", sender_role: "user" }
);
if (transcript.length !== 3 || transcript[2].content !== "I can't go on") {
  throw new Error("transcript build failed");
}

// evaluate: rules path (no groq needed)
async function runAsyncChecks() {
  const rulesHit = await evaluateSessionRisk({
    currentMessage: "I'm going to hurt someone",
    currentSenderRole: "user",
    recentMessages: [],
  });
  if (rulesHit.risk !== "harm_to_others" || rulesHit.source !== "rules") {
    throw new Error(`rules path: ${JSON.stringify(rulesHit)}`);
  }

  const clean = await evaluateSessionRisk({
    currentMessage: "feeling anxious about work tomorrow",
    currentSenderRole: "user",
    recentMessages: [],
  });
  if (clean.risk !== "none" || clean.source !== "none") {
    throw new Error(`clean path: ${JSON.stringify(clean)}`);
  }

  const prev = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  const skipped = await evaluateSessionRisk({
    currentMessage: "nobody would miss me if I was gone",
    currentSenderRole: "user",
    recentMessages: [],
  });
  if (prev) process.env.GROQ_API_KEY = prev;
  if (skipped.source !== "llm_skipped") {
    throw new Error(`llm_skipped expected, got ${skipped.source}`);
  }
}

runAsyncChecks().then(() => {
  console.log("lib/risk/evaluate: all checks passed");
});
