# Supabase Setup Guide

This project uses [Supabase](https://supabase.com) to store Knowledge Center articles in a cloud database so they are accessible from any device.

---

## Step 1 — Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project**.
2. Sign in with GitHub (recommended) or create an email account.
3. Click **New project**.
4. Choose your organisation, give the project a name (e.g. `absar-law`), set a database password, and pick the closest region (e.g. `ap-south-1` for Mumbai).
5. Wait ~2 minutes for the project to provision.

---

## Step 2 — Create the `articles` Table

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query** and paste the following SQL:

```sql
-- Create the articles table
create table articles (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default timezone('utc', now()),
  category    text        not null,
  title       text        not null,
  date        text        not null,
  excerpt     text,
  body        text,
  author      text,
  url         text
);

-- Enable Row Level Security
alter table articles enable row level security;

-- Allow anyone to read articles (public knowledge center)
create policy "Public read"
  on articles for select
  using (true);

-- Allow inserts (admin panel uses anon key)
create policy "Anon insert"
  on articles for insert
  with check (true);

-- Allow deletes (admin panel uses anon key)
create policy "Anon delete"
  on articles for delete
  using (true);
```

3. Click **Run** (or press `Ctrl+Enter`). You should see "Success. No rows returned."

---

## Step 3 — Get Your API Keys

1. In the left sidebar, click **Project Settings** (gear icon) → **API**.
2. Copy the following two values:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - ** https://sexcayctxgruvhbcsgdd.supabase.co
   - **anon / public key** — a long JWT string
   - ** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleGNheWN0eGdydXZoYmNzZ2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDU0NTEsImV4cCI6MjA4NzY4MTQ1MX0.jyg4Qbt3E9uLi_CsQ4cQUH3G6iEOslhPUdWOy9CzepY

---

## Step 4 — Add Keys to `.env.local`

Open the file `.env.local` at the root of the project. It currently has placeholder values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholders with your real values:

```
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DONE
```

> ⚠️ `.env.local` is already listed in `.gitignore` — it will **never** be committed to git. Keep your keys safe.

---

## Step 5 — Run the Dev Server

```bash
npm run dev
```

Visit the Knowledge Center page. The status badge in the top-right will now show:

> **● Live (Supabase)**

---

## Step 6 — Populate Initial Articles

The first time you connect, the database will be empty. To populate it with the default seed articles:

1. Click the **Manage Articles** button on the Knowledge Center page.
2. Enter the admin password.
3. Scroll to the bottom and click **Reset to default articles** → **Yes, reset**.

This will insert all 6 seed articles into your Supabase database. From now on, any articles you add or delete will be stored in Supabase and visible from every device.

---

## Article Types

When adding articles via the admin panel you can choose between:

| Type | Behaviour |
|---|---|
| **Internal Article** | Full article stored in Supabase; opens in an in-page reader modal |
| **External Link** | Stores a URL; card button says "Read article ↗" and opens the link in a new tab |

External links are useful for sharing OneDrive documents, published pieces on other websites, or PDF reports.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Status badge shows "Local (configure Supabase)" | Check that `.env.local` has the correct keys and restart `npm run dev` |
| Articles not saving | Check the Supabase RLS policies were created correctly (Step 2) |
| "Could not load articles" error banner | The Supabase project may be paused (free tier pauses after 1 week of inactivity) — visit the dashboard and click **Restore project** |
| Want to reset everything | Use "Manage Articles → Reset to default articles" in the admin panel |
