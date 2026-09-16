import { isAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { expectedFee } from "@/lib/fees";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("conference_registrations")
    .select("full_name, phone, attendee_type, education_level, amount_paid, received_by, payment_note, updated_at")
    .order("full_name", { ascending: true });
  const rows = data ?? [];

  const headers = ["Name", "Phone", "Type", "Level", "Expected (GHS)", "Paid (GHS)", "Balance (GHS)", "Received by", "Note", "Updated at"];
  const lines = rows.map((r) => {
    const rec = r as Record<string, unknown>;
    const expected = expectedFee(rec.attendee_type as string, rec.education_level as string);
    const paid = Number(rec.amount_paid) || 0;
    const balance = Math.max(expected - paid, 0);
    return [
      rec.full_name, rec.phone, rec.attendee_type, rec.education_level,
      expected, paid, balance, rec.received_by, rec.payment_note, rec.updated_at,
    ].map(csvCell).join(",");
  });
  const csv = `﻿${headers.map(csvCell).join(",")}\n${lines.join("\n")}`;

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="conference-payments-${date}.csv"`,
    },
  });
}
