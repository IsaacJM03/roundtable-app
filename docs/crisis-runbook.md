# Crisis response runbook (draft — review with legal/compliance)

## How risk is detected

Three layers (see `lib/risk/evaluate.ts`):

1. **Hard rules** — instant keyword/pattern match on the new message and recent user lines (`lib/riskDetection.ts`).
2. **Soft signals** — ambiguous phrasing triggers an LLM review only when needed (`lib/risk/softSignals.ts`).
3. **Groq LLM** — classifies the last ~5 messages as a transcript when soft signals fire. Set `GROQ_API_KEY` in `.env`. Without it, layers 1–2 still run.

Flag if rules match **or** LLM returns `self_harm` / `harm_to_others` with confidence ≥ 0.72.

## Self-harm (`risk_flag: self_harm`)

1. System auto-surfaces 999 / emergency resources in chat (automated message, not volunteer).
2. Session is prioritized in the volunteer queue.
3. Volunteer: listen, don't diagnose. Encourage professional help if imminent risk.
4. **Do not** promise confidentiality if someone is at imminent risk — follow your org's policy.

## Harm to others (`risk_flag: harm_to_others`)

1. Same automated resource surfacing and queue escalation as self-harm.
2. **No automatic reporting to authorities** is implemented in software.
3. Volunteer protocol (TBD by compliance):
   - What volunteers may say
   - When to involve a supervisor
   - Whether/when to contact emergency services
   - Log retention for flagged sessions

## Retention

Configured via environment (see `lib/config/retention.ts`):

- `CHAT_RETENTION_DAYS` — default 90
- `FLAGGED_CHAT_RETENTION_DAYS` — default 365

Cleanup is manual/SQL cron until automated purge is approved.

## External reporting

Any obligation to report to authorities is **not** encoded in app logic. Document decisions here after legal review.
