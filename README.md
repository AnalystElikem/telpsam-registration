# TELPSAM Conference — Registration Portal

A simple, single-page registration-of-intent portal for the TELPSAM Conference.
Public form → stored in Supabase. Password-protected admin list with CSV export
for verification at the venue. Same stack as the mentorship portal (Next.js 15,
Supabase, Tailwind v4), deployed on Vercel at **registration.telpsam.com**.

## Before you deploy — fill in the conference details

Open `src/lib/config.ts` and set the three `TODO` values: **name**, **dates**,
and **venue**. Everything else (fees, MoMo number) is already set.

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Type | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Config | Reuse your existing TELPSAM Supabase project, or a new one. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Config | From Supabase → Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Lets the admin page read all registrations. |
| `ADMIN_PASSWORD` | Secret | Protects `/admin`. Choose a strong value. |
| `NEXT_PUBLIC_APP_URL` | Config | `https://registration.telpsam.com` |

## Database

Run `supabase/migrations/001_registrations.sql` once in the Supabase SQL editor
(the same project as the mentorship portal is fine — the table is self-contained).
Anyone can submit; nobody can read via the public key. The admin page reads with
the service-role key on the server.

## Admin

Go to `/admin`, enter `ADMIN_PASSWORD`, view registrations, and click **Export CSV**
(opens in Excel/Sheets) for venue check-in.

## Domain

In Vercel add `registration.telpsam.com`, then add the CNAME it shows at
Squarespace (Host `registration` → `cname.vercel-dns.com`), exactly like the
mentorship portal.

## Notes

- The raw conference photos in the project root are gitignored (they're ~5MB
  each). The optimized hero lives at `public/hero.jpg`. You can delete the
  originals whenever you like.
- This portal only collects intent + data. Payment confirmation and room
  allocation happen at the venue.
