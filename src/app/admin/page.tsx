import { Download, LogOut, Users, Search, CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import { isAdmin } from "@/lib/adminAuth";
import { loginAdmin, logoutAdmin } from "@/app/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFERENCE } from "@/lib/config";
import { expectedFee } from "@/lib/fees";
import PaymentEditForm from "@/components/PaymentEditForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Registrations" };

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string | null;
  branch: string | null;
  gender: string | null;
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
  searchParams: Promise<{ error?: string; q?: string; saved?: string; err?: string; errId?: string }>;
}) {
  const { error, q, saved, err, errId } = await searchParams;
  const ERR: Record<string, string> = {
    conflict: "This record changed since you opened it — reload the page and try again.",
    note: "A note is required when the amount differs from the expected fee.",
    roomfull: "That room is already full (6/6). Please choose another.",
    roomgender: "That room is on the wrong floor for this person's gender.",
    roombad: "That room isn't recognised.",
  };
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
    .select("id, created_at, full_name, phone, email, branch, gender, education_level, attendee_type, payment_plan, momo_reference, amount_paid, room_assigned, received_by, payment_note, updated_at")
    .order("created_at", { ascending: false });
  const all = (data as Row[]) ?? [];

  // Rooms (for the allocation dropdown) and how many people are in each so far.
  const { data: roomData } = await supabase
    .from("conference_rooms")
    .select("code, gender, beds, sort")
    .order("sort");
  const rooms = (roomData as { code: string; gender: string; beds: number; sort: number }[]) ?? [];
  const occupancy: Record<string, number> = {};
  for (const r of all) {
    const c = (r.room_assigned || "").trim();
    if (c) occupancy[c] = (occupancy[c] ?? 0) + 1;
  }

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

  // Edit history for the displayed registrants (every save is logged).
  type Audit = { registration_id: string; editor: string | null; amount_paid: number | null; room_assigned: string | null; created_at: string };
  const ids = rows.map((r) => r.id);
  const { data: auditData } = ids.length
    ? await supabase
        .from("registration_audit")
        .select("registration_id, editor, amount_paid, room_assigned, created_at")
        .in("registration_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] as Audit[] };
  const historyByReg = new Map<string, Audit[]>();
  for (const a of (auditData as Audit[]) ?? []) {
    const list = historyByReg.get(a.registration_id) ?? [];
    list.push(a);
    historyByReg.set(a.registration_id, list);
  }

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

      <div className="mt-3 flex flex-wrap gap-2">
        <a href="/admin" className="rounded-full bg-blue px-3 py-1 text-xs font-semibold text-white">Registrations</a>
        <a href="/admin/payments" className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-blue hover:bg-canvas">Payments</a>
        <a href="/admin/rooms" className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-blue hover:bg-canvas">Rooms</a>
      </div>

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

                <PaymentEditForm
                  id={r.id}
                  q={q || ""}
                  expected={expectedFee(r.attendee_type, r.education_level)}
                  amount={r.amount_paid}
                  room={r.room_assigned}
                  receivedBy={r.received_by}
                  note={r.payment_note}
                  updatedAt={r.updated_at}
                  gender={r.gender}
                  rooms={rooms}
                  occupancy={occupancy}
                />

                {err && errId === r.id && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-danger">
                    <AlertCircle className="h-3.5 w-3.5" /> {ERR[err] || "Couldn't save — please try again."}
                  </p>
                )}
                {saved === r.id && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Saved.
                  </p>
                )}

                {(historyByReg.get(r.id)?.length ?? 0) > 0 && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-muted hover:text-blue">
                      Edit history ({historyByReg.get(r.id)!.length})
                    </summary>
                    <ul className="mt-1 space-y-0.5 border-l-2 border-line pl-3 text-muted">
                      {historyByReg.get(r.id)!.map((h, i) => (
                        <li key={i}>
                          {new Date(h.created_at).toLocaleString()} — {h.editor || "?"} · GHS {h.amount_paid ?? "—"}
                          {h.room_assigned ? ` · ${h.room_assigned}` : ""}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
