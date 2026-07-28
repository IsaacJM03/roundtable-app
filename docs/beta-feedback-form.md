# Roundtable Beta Feedback Form

Ready-to-build package for Google Forms. Paste titles/copy as written. Keep the form short — five core questions plus light optionals.

Wire the published URL into `NEXT_PUBLIC_FEEDBACK_FORM_URL` (see `.env.example`). When set, the homepage shows a **Give feedback** link in the footer.

---

## Form title

**Roundtable — a few minutes of honesty**

## Form description

You're helping shape a quiet corner of the internet where people can bring doubts, prayer, and God-moments without performing.

This form is optional and anonymous by default. No account needed. Be blunt — what confused you, what felt sacred, what you'd cut. We read every response.

If something felt unsafe or urgent, don't use this form for crisis help — contact local emergency services (e.g. **988** in the US).

---

## Theme (Google Forms)

Google Forms themes are limited. Get as close as you can to Roundtable's dark / violet–amber feel:

| Setting | Suggestion |
|---------|------------|
| **Theme color** | Deep violet / indigo (closest to app accents: violet + soft amber) |
| **Background** | Dark gray or near-black if available; otherwise soft charcoal |
| **Header image** | Wide, quiet atmosphere — dim warm light on a table, candle glow, or soft abstract violet→amber gradient. No busy collage, no stock “team smiling.” Prefer stillness over cheer. |
| **Font** | Default or a clean sans; avoid playful display fonts |

Header image tip: ~1600×400 or Forms' recommended banner size, low contrast, plenty of empty space so the title still reads.

---

## Sections & questions

Use one section (or two: Core / Optional). Mark **Required** exactly as noted.

### Core (≤5)

| # | Question | Type | Required | Options / scale |
|---|----------|------|----------|-----------------|
| 1 | Did you feel safe posting anonymously? | Linear scale | Yes | 1 = Not at all → 5 = Completely. Optional label ends: “Not at all” / “Completely” |
| 2 | Was anything confusing? | Paragraph | Yes | Hint: “Screens, wording, where to go next — anything that made you pause.” |
| 3 | Would you come back? Why / why not? | Paragraph | Yes | Hint: “One sentence is enough.” |
| 4 | What felt most meaningful? | Paragraph | Yes | Hint: “A prayer answered vibe, a discuss reply, Daily Drop, a Moment — or something smaller.” |
| 5 | One thing to remove? | Paragraph | Yes | Hint: “Feature, copy, clutter, or ‘nothing.’” |

### Optional

| # | Question | Type | Required | Options / notes |
|---|----------|------|----------|-----------------|
| 6 | Which areas did you try? | Checkboxes | No | Pray · Discuss · Moments · Daily Drop · Just looked around |
| 7 | What device were you mostly on? | Multiple choice | No | Phone · Tablet · Desktop / laptop · Mixed |
| 8 | Screenshot or file (optional) | File upload | No | Allow images/PDF; keep size modest. Remind: strip personal info from screenshots. |
| 9 | Email if we may follow up (optional) | Short answer | No | Hint: “Leave blank to stay fully anonymous.” Do **not** use Forms “Collect email addresses.” |

---

## Confirmation message (after submit)

**Thank you — we heard you.**

Your honesty helps Roundtable stay a safe, meaningful place. Go gently. If you want to keep exploring: pray, discuss, share a moment, or sit with today's Daily Drop.

Grace and peace.

---

## Share settings

1. **Send** → **Link** → copy the published URL  
2. Access: **Anyone with the link** can respond  
3. Settings → Responses: **Collect email addresses** = **Off**  
4. Limit to 1 response = Off (testers may submit weekly)  
5. Show progress bar = optional (nice for longer forms; this one is short)  
6. Paste the URL into `NEXT_PUBLIC_FEEDBACK_FORM_URL` locally and in Vercel, then redeploy so the homepage CTA appears

---

## Invite blurb (email / DM)

```
Quick ask: when you've spent a little time on Roundtable, would you fill this short feedback form?

[PASTE_FORM_LINK]

Anonymous by default — five questions, a few minutes. There's also a "Give feedback" link on the homepage once we flip the form live. Thank you for helping us get this right.
```

Replace `[PASTE_FORM_LINK]` with the published Google Form URL.
