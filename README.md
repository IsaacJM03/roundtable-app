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
   This creates the tables, triggers, RLS policies, and Realtime publications.
5. In **Authentication > URL Configuration**, use:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
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

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

Add the same three environment variables to Vercel, update Supabase's Site URL
to your production domain, and add `https://your-domain/auth/callback` as an
allowed redirect URL.
