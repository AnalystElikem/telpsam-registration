import { Download, LogOut, Users, Search, CheckCircle2, Clock3 } from "lucide-react";
import { isAdmin } from "@/lib/adminAuth";
import { loginAdmin, logoutAdmin, updateRegistration } from "@/app/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFERENCE } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Registrations" };

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string | null;
  branch: string | null;
  education_level: string | null;
  attendee_type: string | null;
  payment_plan: string | null;
  momo_reference: string | null;
  amount_paid: number | null;
  room_assigned: string | null;
  received_by: string | null;
  payment_note: string | null;
  updated_at: string | null;
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3 text-center">
      <p className="text-2xl font-extrabold text-blue">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

const paymentLabel = (p: string | null) =>
  p === "paid_ahead" ? "Paid ahead" : p === "pay_at_venue" ? "At venue" : "—";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string; saved?: string }>;
}) {
  const { error, q, saved } = await searchParams;
  const authed = await isAdmin();

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
        <div className="card p-7">
          <h1 className="text-xl font-bold text-ink">Registrations admin</h1>
          <p className="mt-1 text-sm text-body">Enter the admin password to view registrations.</p>
          {error && <p className="mt-3 rounded-lg bg-red-soft p-2 text-sm text-danger">Incorrect password.</p>}
          <form action={loginAdmin} className="mt-4 space-y-3">
            <input name="password" type="password" required className="field" placeholder="Admin password" autoFocus />
            <button className="btn btn-primary w-full">Sign in</button>
          </form>
        </div>
      </main>
    );
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("conference_registrations")
    .select("id, created_at, full_name, phone, email, branch, education_level, attendee_type, payment_plan, momo_reference, amount_paid, room_assigned, received_by, payment_note, updated_at")
    .order("created_at", { ascending: false });
  const all = (data as Row[]) ?? [];

  // Summary over ALL rows.
  const total = all.length;
  const students = all.filter((r) => r.attendee_type === "student").length;
  const workers = all.filter((r) => r.attendee_type === "worker").length;
  const collected = all.reduce((s, r) => s + (Number(r.amount_paid) || 0), 0);
  const paidCount = all.filter((r) => Number(r.amount_paid) > 0).length;
  const roomedCount = all.filter((r) => (r.room_assigned || "").trim() !== "").length;

  // Search filters the displayed rows.
  const query = (q || "").trim().toLowerCase();
  const rows = query
    ? all.filter((r) =>
        [r.full_name, r.phone, r.email, r.branch, r.education_level, r.room_assigned, r.received_by].some((v) =>
          (v || "").toLowerCase().includes(query)
        )
      )
    : all;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Users className="h-6 w-6 text-blue" /> Registrations
        </h1>
        <div className="flex items-center gap-2">
          <a href="/admin/export" className="btn btn-outline !py-2 !text-sm">
            <Download className="h-4 w-4" /> Export CSV
          </a>
          <form action={logoutAdmin}>
            <button className="btn btn-outline !py-2 !text-sm"><LogOut className="h-4 w-4" /> Sign out</button>
          </form>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">{CONFERENCE.name}</p>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Metric label="Total" value={total} />
        <Metric label="Students" value={students} />
        <Metric label="Workers" value={workers} />
        <Metric label="Collected" value={`GHS ${collected.toLocaleString()}`} />
        <Metric label="Paid" value={paidCount} />
        <Metric label="Roomed" value={roomedCount} />
      </div>

      {/* Search */}
      <form className="mt-5" action="/admin" method="get">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search name, phone, branch, room, received by…"
            className="field !pl-9"
          />
        </div>
      </form>
      <p className="mt-2 text-xs text-muted">
        {query ? `${rows.length} match${rows.length === 1 ? "" : "es"} for “${q}”. ` : `${rows.length} registrations. `}
        Search for a person, then record their payment and room below.
      </p>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="card p-6 text-center text-sm text-muted">{query ? "No matches." : "No registrations yet."}</p>
        ) : (
          rows.map((r) => {
            const paid = Number(r.amount_paid) > 0;
            return (
              <div key={r.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-bold text-ink">
                      {r.full_name}
                      {r.attendee_type && (
                        <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold capitalize text-muted">
                          {r.attendee_type}
                        </span>
                      )}
                      {paid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-success">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-soft px-2 py-0.5 text-[11px] font-semibold text-danger">
                          <Clock3 className="h-3 w-3" /> Unpaid
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.phone}
                      {r.email ? ` · ${r.email}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {r.branch || "—"}
                      {r.education_level ? ` · ${r.education_level}` : ""} · {paymentLabel(r.payment_plan)}
                      {r.momo_reference ? ` · MoMo ${r.momo_reference}` : ""}
                    </p>
                    {r.payment_note && (
                      <p className="mt-1.5 rounded-md bg-gold-soft/60 px-2 py-1 text-xs text-ink">
                        Note: {r.payment_note}
                      </p>
                    )}
                  </div>
                  {r.updated_at && r.received_by && (
                    <p className="shrink-0 text-right text-[11px] text-muted">
                      Received by <span className="font-semibold text-ink">{r.received_by}</span>
                      <br />
                      {new Date(r.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <form action={updateRegistration} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="q" value={q || ""} />
                  <div className="grid items-end gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Amount paid (GHS)</label>
                      <input name="amount_paid" type="number" min="0" step="1" defaultValue={r.amount_paid ?? ""} className="field !py-2" placeholder="0" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Room</label>
                      <input name="room_assigned" defaultValue={r.room_assigned ?? ""} className="field !py-2" placeholder="e.g. B12" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Received by</label>
                      <input name="received_by" defaultValue={r.received_by ?? ""} required className="field !py-2" placeholder="Your name" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Note (e.g. reason for a partial payment)</label>
                    <textarea name="payment_note" rows={2} defaultValue={r.payment_note ?? ""} className="field !py-2" placeholder="Optional — e.g. paid GHS 100, balance to be paid at the venue" />
                  </div>
                  <div className="flex justify-end">
                    <button className="btn btn-primary !py-2">Save</button>
                  </div>
                </form>

                {saved === r.id && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Saved.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
