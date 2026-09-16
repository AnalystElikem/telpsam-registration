import { redirect } from "next/navigation";
import { Download, Search, Wallet } from "lucide-react";
import { isAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { expectedFee } from "@/lib/fees";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Payments" };

type Row = {
  id: string;
  full_name: string;
  phone: string;
  attendee_type: string | null;
  education_level: string | null;
  amount_paid: number | null;
  received_by: string | null;
  updated_at: string | null;
  payment_note: string | null;
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3 text-center">
      <p className="text-2xl font-extrabold text-blue">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { q } = await searchParams;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("conference_registrations")
    .select("id, full_name, phone, attendee_type, education_level, amount_paid, received_by, updated_at, payment_note")
    .order("full_name", { ascending: true });
  const all = (data as Row[]) ?? [];

  const calc = all.map((r) => {
    const expected = expectedFee(r.attendee_type, r.education_level);
    const paid = Number(r.amount_paid) || 0;
    return { ...r, expected, paid, balance: Math.max(expected - paid, 0) };
  });

  const collected = calc.reduce((s, r) => s + r.paid, 0);
  const totalExpected = calc.reduce((s, r) => s + r.expected, 0);
  const outstanding = calc.reduce((s, r) => s + r.balance, 0);
  const fully = calc.filter((r) => r.paid > 0 && r.paid >= r.expected).length;
  const partial = calc.filter((r) => r.paid > 0 && r.paid < r.expected).length;
  const unpaid = calc.filter((r) => r.paid <= 0).length;

  const query = (q || "").trim().toLowerCase();
  const rows = query
    ? calc.filter((r) => [r.full_name, r.phone, r.received_by].some((v) => (v || "").toLowerCase().includes(query)))
    : calc;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Wallet className="h-6 w-6 text-blue" /> Payments
        </h1>
        <a href="/admin/payments/export" className="btn btn-outline !py-2 !text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a href="/admin" className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-blue hover:bg-canvas">Registrations</a>
        <a href="/admin/payments" className="rounded-full bg-blue px-3 py-1 text-xs font-semibold text-white">Payments</a>
        <a href="/admin/rooms" className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-blue hover:bg-canvas">Rooms</a>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Metric label="Collected" value={`GHS ${collected.toLocaleString()}`} />
        <Metric label="Expected" value={`GHS ${totalExpected.toLocaleString()}`} />
        <Metric label="Outstanding" value={`GHS ${outstanding.toLocaleString()}`} />
        <Metric label="Fully paid" value={fully} />
        <Metric label="Partial" value={partial} />
        <Metric label="Unpaid" value={unpaid} />
      </div>

      <form className="mt-5" action="/admin/payments" method="get">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q || ""} placeholder="Search name, phone, received by…" className="field !pl-9" />
        </div>
      </form>
      <p className="mt-2 text-xs text-muted">
        {query ? `${rows.length} match${rows.length === 1 ? "" : "es"}. ` : `${rows.length} registrations. `}
        Amounts are what each person has paid so far.
      </p>

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Received by</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">{query ? "No matches." : "No registrations yet."}</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60">
                  <td className="px-4 py-2.5 font-medium text-ink">{r.full_name}</td>
                  <td className="px-4 py-2.5 capitalize">{r.attendee_type || "—"}</td>
                  <td className="px-4 py-2.5">{r.expected}</td>
                  <td className={`px-4 py-2.5 font-semibold ${r.paid >= r.expected && r.paid > 0 ? "text-success" : r.paid > 0 ? "text-gold-600" : "text-danger"}`}>{r.paid}</td>
                  <td className="px-4 py-2.5">{r.balance > 0 ? r.balance : "—"}</td>
                  <td className="px-4 py-2.5">{r.received_by || "—"}</td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-muted" title={r.payment_note || ""}>{r.payment_note || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
