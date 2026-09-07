import { Download, LogOut, Users, Search } from "lucide-react";
import { isAdmin } from "@/lib/adminAuth";
import { loginAdmin, logoutAdmin } from "@/app/actions/admin";
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
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3 text-center">
      <p className="text-2xl font-extrabold text-blue">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const { error, q } = await searchParams;
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
    .select("id, created_at, full_name, phone, email, branch, education_level, attendee_type, payment_plan, momo_reference")
    .order("created_at", { ascending: false });
  const all = (data as Row[]) ?? [];

  // Summary over ALL rows.
  const total = all.length;
  const students = all.filter((r) => r.attendee_type === "student").length;
  const workers = all.filter((r) => r.attendee_type === "worker").length;
  const associates = all.filter((r) => (r.branch || "").startsWith("Associate")).length;
  const paidAhead = all.filter((r) => r.payment_plan === "paid_ahead").length;
  const atVenue = all.filter((r) => r.payment_plan === "pay_at_venue").length;

  // Search filters the displayed rows.
  const query = (q || "").trim().toLowerCase();
  const rows = query
    ? all.filter((r) =>
        [r.full_name, r.phone, r.email, r.branch, r.education_level].some((v) => (v || "").toLowerCase().includes(query))
      )
    : all;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
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
        <Metric label="Associates" value={associates} />
        <Metric label="Paid ahead" value={paidAhead} />
        <Metric label="At venue" value={atVenue} />
      </div>

      {/* Search */}
      <form className="mt-5" action="/admin" method="get">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search name, phone, branch, email…"
            className="field !pl-9"
          />
        </div>
      </form>
      <p className="mt-2 text-xs text-muted">
        {query ? `${rows.length} match${rows.length === 1 ? "" : "es"} for “${q}”. ` : ""}
        Full details are in the CSV export.
      </p>

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">MoMo ref</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">{query ? "No matches." : "No registrations yet."}</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60">
                  <td className="px-4 py-2.5 font-medium text-ink">{r.full_name}</td>
                  <td className="px-4 py-2.5">{r.phone}</td>
                  <td className="px-4 py-2.5">{r.email || "—"}</td>
                  <td className="px-4 py-2.5">{r.branch || "—"}</td>
                  <td className="px-4 py-2.5">{r.education_level || "—"}</td>
                  <td className="px-4 py-2.5 capitalize">{r.attendee_type || "—"}</td>
                  <td className="px-4 py-2.5">{r.payment_plan === "paid_ahead" ? "Paid ahead" : r.payment_plan === "pay_at_venue" ? "At venue" : "—"}</td>
                  <td className="px-4 py-2.5">{r.momo_reference || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
