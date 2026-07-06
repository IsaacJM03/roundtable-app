# Roundtable

A Next.js application backed by Supabase Auth, Postgres, Row Level Security,
and Realtime.

## Supabase Setup

1. Create a project at [database.new](https://database.new). Save the database
   password in a password manager.
2. Open the project's **Connect** dialog and copy the Project URL and
   Publishable key.
3. Create `.env.local` from `.env.example` and add those values:

```bash
cp .env.example .env.local
```

4. In the Supabase dashboard, open **SQL Editor**, create a new query, paste
   the contents of `supabase/migrations/001_initial_schema.sql`, and run it.
   Then run `002_phase2_features.sql` through `007_session_events.sql` in order.
   This creates the tables, triggers, RLS policies, and Realtime publications.
5. In **Authentication > URL Configuration**, use:

```text
Site URL: http://localhost:3000
Redirect URLs:
  http://localhost:3000/auth/callback
  http://localhost:3000/auth/accept-invite
```

6. In **Authentication > Users**, add the first team user. The database trigger
   creates a `profiles` row with the `member` role. Promote that user in the SQL
   Editor:

```sql
update public.profiles
set role = 'admin', display_name = 'Your name'
where id = (
  select id from auth.users where email = 'you@example.com'
);
```

Valid roles are `admin`, `prayer_team`, `counselor`, and `member`.

## Email (Gmail SMTP + Team Invites)

Team invites are sent by **Supabase Auth**, not the Next.js app. Configure SMTP in
the Supabase dashboard only (not in `.env`).

### Gmail SMTP

In **Authentication → Emails → SMTP Settings**, enable custom SMTP:

| Field | Value |
|-------|--------|
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | Your full Gmail address |
| Password | Your 16-character Google App Password |
| Sender email | Same Gmail address |
| Sender name | `Roundtable` |

Requires 2-Step Verification and an [App Password](https://myaccount.google.com/apppasswords)
on your Google account.

### Invite email template

The default Supabase invite email uses a plain link that email clients (especially
Gmail) may prefetch, burning the one-time token before you click it.

1. Open **Authentication → Emails → Invite user**
2. Set the subject to e.g. `You're invited to Roundtable`
3. Paste the HTML from [`supabase/email-templates/invite.html`](supabase/email-templates/invite.html)

The template links to `/auth/accept-invite` with the verify URL embedded as
`confirmation_url` — the user must click a button on that page to accept, which
avoids Gmail prefetch issues. Re-paste the template after updates.

### Invite flow

1. Admin invites someone from `/dashboard/team`
2. Invitee receives branded email → lands on `/auth/accept-invite`
3. They click **Accept invitation & set password**
4. They set a password on `/auth/set-password` → reach `/dashboard`

### Troubleshooting `otp_expired`

If the invite link shows "expired or invalid":

- **Email prefetching** — use the custom template above (don't use `{{ .ConfirmationURL }}`)
- **Old invite** — delete the user in **Authentication → Users** and resend
- **Redirect URLs** — ensure `/auth/accept-invite` is in the allow list
- **OTP expiry** — increase invite link expiry in Auth settings if available

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

Add the same three environment variables to Vercel, update Supabase's Site URL
to your production domain, and add these allowed redirect URLs:

```text
https://your-domain/auth/callback
https://your-domain/auth/accept-invite
```
