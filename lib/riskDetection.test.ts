import { detectRisk } from "./riskDetection";

const cases: [string, ReturnType<typeof detectRisk>][] = [
  ["I want to kill myself tonight", "self_harm"],
  ["I'm going to hurt someone", "harm_to_others"],
  ["feeling anxious about work", "none"],
  ["in the next 10 minutes I might do something", "self_harm"],
];

for (const [input, expected] of cases) {
  const got = detectRisk(input);
  if (got !== expected) throw new Error(`detectRisk("${input}") = ${got}, want ${expected}`);
}
console.log("riskDetection: all checks passed");
