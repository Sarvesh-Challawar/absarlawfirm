# Supabase — Knowledge Center Documents Table

Run this SQL once in your Supabase project's **SQL Editor** to create the
`kc_documents` table used for public document listing.

## Why this is needed

Microsoft Graph API requires authentication to list the contents of an OneDrive
folder — even when the folder is shared as "Anyone with the link". There is no
unauthenticated REST API that returns folder children for personal OneDrive accounts.

The solution: when an admin uploads a PDF via the Knowledge Center, the app
automatically creates a per-file anonymous share link and saves the file metadata
to Supabase. Public users then read from Supabase with the anon key, with no
OneDrive login required.

---

## 1. Create the table

```sql
CREATE TABLE kc_documents (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  onedrive_id  text        NOT NULL UNIQUE,
  name         text        NOT NULL,
  size         bigint,
  share_url    text        NOT NULL,
  uploaded_at  timestamptz DEFAULT now()
);
```

## 2. Enable Row Level Security

```sql
ALTER TABLE kc_documents ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public listing for website visitors)
CREATE POLICY "Public read"
  ON kc_documents FOR SELECT
  TO public
  USING (true);

-- Anyone can insert (the admin password gate in the UI is the access control layer)
CREATE POLICY "Anon insert"
  ON kc_documents FOR INSERT
  TO public
  WITH CHECK (true);

-- Anyone can delete (same reasoning — UI is password-gated)
CREATE POLICY "Anon delete"
  ON kc_documents FOR DELETE
  TO public
  USING (true);
```

## 3. Wire up the environment variables

In `.env.local`:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-public-anon-key>
```

Both values are in your Supabase project under **Settings → API**.

---

## Flow summary

| Action         | What happens                                                         |
|---------------|----------------------------------------------------------------------|
| Admin uploads | PDF → OneDrive (`uploadPDF`) → anonymous share link created → row inserted into `kc_documents` |
| Admin deletes | PDF removed from OneDrive → row deleted from `kc_documents`         |
| Public visits | `listPDFsPublic()` queries `kc_documents` → renders PDF card grid   |
