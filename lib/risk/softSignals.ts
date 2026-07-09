/** Ambiguous wording — not enough for hard rules, worth sending to the LLM. */
const SOFT_PHRASES = [
  "can't go on",
  "cant go on",
  "can't take it",
  "cant take it",
  "don't want to be here",
  "dont want to be here",
  "end it all",
  "end it",
  "better off dead",
  "no point in living",
  "no point anymore",
  "nobody would miss",
  "no one would miss",
  "wish i wasn't",
  "wish i wasnt",
  "wish i were dead",
  "not safe",
  "hurt them",
  "hurt him",
  "hurt her",
  "make them pay",
  "going to do something bad",
];

const SOFT_WORD_PATTERN =
  /\b(die|dying|dead|suicidal|hopeless|worthless|disappear|overdose|cutting|cut myself)\b/i;

export function hasSoftSignals(text: string): boolean {
  const n = text.toLowerCase().trim();
  if (!n) return false;
  if (SOFT_PHRASES.some((p) => n.includes(p))) return true;
  return SOFT_WORD_PATTERN.test(n);
}
