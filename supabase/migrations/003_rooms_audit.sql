-- ==========================================================================
-- TELPSAM Conference — rooms (for allocation) and an edit audit trail.
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- First floor = ladies (female), second floor = gentlemen (male). 6 beds each.
-- Rooms and audit are read/written only via the service-role key (admin), so
-- RLS is on with no policies (anon key has no access).
-- ==========================================================================

-- The physical rooms available for allocation.
create table if not exists public.conference_rooms (
  code    text primary key,       -- e.g. 'D1-448'
  floor   text not null,          -- 'first' | 'second'
  gender  text not null,          -- 'female' (first floor) | 'male' (second floor)
  beds    int  not null default 6,
  sort    int  not null default 0
);

insert into public.conference_rooms (code, floor, gender, beds, sort) values
  ('D1-448','first','female',6,1),
  ('D2-472','first','female',6,2),
  ('D1-450','first','female',6,3),
  ('D1-452','first','female',6,4),
  ('D1-454','first','female',6,5),
  ('D1-455','first','female',6,6),
  ('D1-456','first','female',6,7),
  ('D1-457','first','female',6,8),
  ('D1-458','first','female',6,9),
  ('D1-460','first','female',6,10),
  ('D1-462','first','female',6,11),
  ('D1-463','first','female',6,12),
  ('D1-464','first','female',6,13),
  ('D1-465','first','female',6,14),
  ('D1-468','first','female',6,15),
  ('D1-469','first','female',6,16),
  ('D1-470','first','female',6,17),
  ('D1-471','first','female',6,18),
  ('D2-473','second','male',6,19),
  ('D2-474','second','male',6,20),
  ('D2-475','second','male',6,21),
  ('D2-476','second','male',6,22),
  ('D2-477','second','male',6,23),
  ('D2-479','second','male',6,24),
  ('D2-480','second','male',6,25),
  ('D2-481','second','male',6,26),
  ('D2-482','second','male',6,27),
  ('D2-483','second','male',6,28),
  ('D2-484','second','male',6,29),
  ('D2-486','second','male',6,30),
  ('D2-487','second','male',6,31),
  ('D2-488','second','male',6,32),
  ('D2-489','second','male',6,33),
  ('D2-490','second','male',6,34),
  ('D2-491','second','male',6,35),
  ('D2-494','second','male',6,36),
  ('D2-495','second','male',6,37),
  ('D2-496','second','male',6,38),
  ('D2-497','second','male',6,39)
on conflict (code) do nothing;

-- One row per save, so every edit (and any mistake/correction) is traceable.
create table if not exists public.registration_audit (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid references public.conference_registrations(id) on delete cascade,
  editor          text,              -- the "received by" name entered at save time
  amount_paid     numeric(10,2),
  room_assigned   text,
  payment_note    text,
  created_at      timestamptz not null default now()
);
create index if not exists reg_audit_reg_idx on public.registration_audit (registration_id, created_at desc);

alter table public.conference_rooms   enable row level security;
alter table public.registration_audit enable row level security;
-- No policies: the anon key can't read or write; the admin uses the service-role key.
