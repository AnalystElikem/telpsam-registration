-- ==========================================================================
-- TELPSAM Conference — registrations table.
-- Run in your Supabase SQL editor (the same project as the mentorship portal
-- is fine; this table is self-contained). Safe to re-run.
--
-- Privacy model: anyone may INSERT a registration (public form), but NOBODY can
-- read rows through the public/anon key. The admin list reads with the
-- service-role key on the server, which bypasses RLS.
-- ==========================================================================
create table if not exists public.conference_registrations (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),

  full_name               text not null,
  date_of_birth           date,
  gender                  text,
  branch                  text,               -- a branch name, or 'Associate'

  education_level         text,               -- JHS | SHS | Tertiary | Postgraduate
  last_institution        text,
  completion_year         int,

  attendee_type           text,               -- student | worker
  workplace               text,               -- if worker
  job_title               text,               -- if worker

  phone                   text not null,
  email                   text not null,

  emergency_contact_name  text,
  emergency_contact_phone text,
  dietary_medical         text,

  momo_reference          text,
  payment_plan            text,               -- paid_ahead | pay_at_venue
  fee_acknowledged        boolean not null default false
);

create index if not exists conf_reg_created_idx on public.conference_registrations (created_at desc);

alter table public.conference_registrations enable row level security;

-- Anyone (anon) may submit a registration.
do $$ begin
  create policy "anyone can register" on public.conference_registrations
    for insert to anon, authenticated with check (true);
exception when duplicate_object then null; end $$;

-- No SELECT/UPDATE/DELETE policies: the anon key cannot read or change rows.
-- The admin page uses the service-role key server-side to read them.
