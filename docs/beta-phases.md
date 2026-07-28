# Beta Phases Playbook

Manual execution guide for Roundtable beta. Code prerequisites are in [beta-tester-guide.md](./beta-tester-guide.md).

## Phase 0 — Internal (1 week, 5–8 people)

**Roles:** you + 2 prayer team + 1 moderator + 2 seekers (incognito)

**Exit criteria:** zero blocker bugs in pray / discuss / moments flows

### Scripted scenarios

**Prayer:** submit title-only; toggle private; filter tabs; react 🙏; add testimony; infinite scroll (staging with scale seed)

**Discuss:** post in faith + off_topic; reply; report via modal; verify mod queue

**Moments:** submit testimony; react; confirm no comments

**Daily:** verse loads; team override in dashboard

**Edge:** incognito cannot edit others' testimony; 10 rapid posts hits rate limit; mobile prayer wall

---

## Phase 1 — Closed (2–3 weeks, 20–40 testers)

- Invite-only link
- 70% seekers / 30% lurkers
- 1 mod on-call per day (async)
- Weekly feedback form ([beta-feedback-form.md](./beta-feedback-form.md); homepage CTA when `NEXT_PUBLIC_FEEDBACK_FORM_URL` is set)

**Exit:** ≥60% seekers complete one meaningful action; mod queue < 24h

---

## Phase 2 — Open (2–4 weeks, 100–200 users)

- Soft launch (home page, word of mouth)
- Monitor report queue + rate limits
- Counsel labeled "limited availability"

### Metrics

| Metric | Target |
|--------|--------|
| Prayers / week | 15+ |
| Prayers with ≥1 reaction | 40%+ |
| Discuss posts / week | 10+ |
| Report → reviewed | < 24h |
| `/pray/new` bounce | < 50% |

**Exit:** ≥50% closed-beta testers would return; no major safety incident

---

## Pre-launch checklist

- [ ] `npm run unseed:scale` on production
- [ ] Invite email template in Supabase
- [ ] Roles: 1 `prayer_team`, 1 `admin`
- [ ] Feedback form published; `NEXT_PUBLIC_FEEDBACK_FORM_URL` set (local + Vercel) and shared with testers
- [ ] Mod on-call schedule defined
