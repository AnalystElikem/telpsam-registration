-- ==========================================================================
-- TELPSAM Conference — payment & room fields, filled in by coordinators.
-- Run in the Supabase SQL editor (same project). Safe to re-run.
--
-- These are edited only via the admin page (service-role key server-side), so
-- no new RLS policies are needed — the anon key still can't read or change rows.
-- ==========================================================================
alter table public.conference_registrations
  add column if not exists amount_paid    numeric(10,2),
  add column if not exists room_assigned  text,
  add column if not exists received_by    text,        -- name of who took the payment / made the update
  add column if not exists payment_note   text,        -- e.g. reason for a partial payment
  add column if not exists updated_at      timestamptz; -- when those details were last changed
