import { isAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS: { key: string; header: string }[] = [
  { key: "created_at", header: "Registered at" },
  { key: "full_name", header: "Full name" },
  { key: "date_of_birth", header: "Date of birth" },
  { key: "gender", header: "Gender" },
  { key: "branch", header: "Branch" },
  { key: "education_level", header: "Education level" },
  { key: "last_institution", header: "Last institution" },
  { key: "completion_year", header: "Completion year" },
  { key: "attendee_type", header: "Student/Worker" },
  { key: "workplace", header: "Workplace" },
  { key: "job_title", header: "Job title" },
  { key: "phone", header: "Phone" },
  { key: "email", header: "Email" },
  { key: "emergency_contact_name", header: "Emergency contact" },
  { key: "emergency_contact_phone", header: "Emergency phone" },
  { key: "dietary_medical", header: "Dietary/medical" },
  { key: "payment_plan", header: "Payment plan" },
  { key: "momo_reference", header: "MoMo reference" },
  { key: "fee_acknowledged", header: "Fee acknowledged" },
];

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("conference_registrations")
    .select("*")
    .order("created_at", { ascending: true });
  const rows = data ?? [];

  const header = COLUMNS.map((c) => csvCell(c.header)).join(",");
  const body = rows
    .map((r) => COLUMNS.map((c) => csvCell((r as Record<string, unknown>)[c.key])).join(","))
    .join("\n");
  const csv = `﻿${header}\n${body}`; // BOM so Excel reads UTF-8 correctly

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="conference-registrations-${date}.csv"`,
    },
  });
}
