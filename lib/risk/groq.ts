import type { RiskFlag } from "@/lib/riskDetection";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You are a crisis triage classifier for a peer-support counseling chat app.
Output JSON only — no counseling, no advice.

Categories:
- "none": no credible crisis signal
- "self_harm": suicidal ideation, self-injury, wanting to die, imminent self-harm
- "harm_to_others": credible threat or plan to harm another person

Rules:
- Consider the FULL conversation transcript, not only the last line
- Indirect phrases count (e.g. "nobody would miss me", "I can't go on")
- Ignore figures of speech (e.g. "that test killed me")
- When genuinely uncertain about self-harm, choose "self_harm" with moderate confidence
- harm_to_others requires a credible threat, not mere anger

Respond with exactly:
{"risk":"none"|"self_harm"|"harm_to_others","confidence":0.0-1.0,"reason":"brief"}`;

export type GroqRiskResult = {
  risk: RiskFlag;
  confidence: number;
  reason: string;
};

export type GroqTranscriptLine = {
  role: "user" | "assistant";
  content: string;
};

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function groqModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}

export function parseGroqRiskJson(raw: string): GroqRiskResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      risk?: string;
      confidence?: number;
      reason?: string;
    };
    const risk = parsed.risk;
    if (risk !== "none" && risk !== "self_harm" && risk !== "harm_to_others") return null;
    const confidence = Number(parsed.confidence);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) return null;
    return {
      risk,
      confidence,
      reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 200) : "",
    };
  } catch {
    return null;
  }
}

function buildUserPrompt(lines: GroqTranscriptLine[]): string {
  const transcript = lines
    .map((l) => `${l.role === "user" ? "Seeker" : "Volunteer"}: ${l.content}`)
    .join("\n");
  return `Classify this counseling transcript:\n\n${transcript}`;
}

/**
 * Groq chat-completions wrapper. Returns null if unconfigured, timed out, or on API error.
 * Add GROQ_API_KEY to .env — get one free at https://console.groq.com
 */
export async function classifyRiskWithGroq(opts: {
  transcript: GroqTranscriptLine[];
  timeoutMs?: number;
}): Promise<GroqRiskResult | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || opts.transcript.length === 0) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 2500);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: groqModel(),
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(opts.transcript) },
        ],
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return parseGroqRiskJson(content);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
