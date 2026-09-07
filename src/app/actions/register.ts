"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ATTENDEE_TYPES } from "@/lib/config";

export async function registerAttendee(formData: FormData) {
  const g = (k: string) => String(formData.get(k) || "").trim();

  // Honeypot: a hidden field no real person fills. If it has content, it's a
  // bot — pretend success (so it doesn't retry) but save nothing.
  if (g("website")) redirect("/thank-you");

  const full_name = g("full_name");
  const phone = g("phone");
  const email = g("email");
  const attendee_type = g("attendee_type").toLowerCase();
  const isWorker = attendee_type === "worker";
  const workplace = g("workplace");
  const job_title = g("job_title");
  const feeAck = formData.get("fee_acknowledged") === "on";

  // Server-side validation. Phone is required; email is optional (only checked
  // for a valid shape when the person actually enters one).
  const errors: string[] = [];
  if (full_name.split(/\s+/).filter(Boolean).length < 2) {
    errors.push("Please enter at least two names (for example, first and last name).");
  }
  if (!phone) errors.push("A phone number is required.");
  if (!g("branch")) errors.push("Please choose your church branch (or Associate if you're not a member).");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("That email address doesn't look right.");
  if (!ATTENDEE_TYPES.map((t) => t.toLowerCase()).includes(attendee_type)) {
    errors.push("Please indicate whether you are a student or a worker.");
  }
  if (isWorker && (!workplace || !job_title)) {
    errors.push("Workers must give their place of work and position.");
  }
  if (!feeAck) errors.push("Please confirm that you understand the conference fees.");

  if (errors.length) {
    redirect(`/register?error=${encodeURIComponent(errors.join(" "))}#form`);
  }

  // Use the service-role client (server-only): it can read for the duplicate
  // check and isn't affected by any row-level-security misconfiguration.
  const admin = createAdminClient();

  // Friendly duplicate guard: same phone (and name) already registered.
  const { data: existing } = await admin
    .from("conference_registrations")
    .select("id, full_name")
    .eq("phone", phone)
    .ilike("full_name", full_name)
    .limit(1)
    .maybeSingle();
  if (existing) {
    redirect(
      `/register?error=${encodeURIComponent(
        "It looks like this name and phone number are already registered. You only need to register once — no need to submit again."
      )}#form`
    );
  }

  const yearNum = parseInt(g("completion_year"), 10);
  const { error } = await admin.from("conference_registrations").insert({
    full_name,
    date_of_birth: g("date_of_birth") || null,
    gender: g("gender") || null,
    branch: g("branch") || null,
    education_level: g("education_level") || null,
    last_institution: g("last_institution") || null,
    completion_year: Number.isFinite(yearNum) ? yearNum : null,
    attendee_type: isWorker ? "worker" : "student",
    workplace: isWorker ? workplace : null,
    job_title: isWorker ? job_title : null,
    phone,
    email: email || null,
    emergency_contact_name: g("emergency_contact_name") || null,
    emergency_contact_phone: g("emergency_contact_phone") || null,
    dietary_medical: g("dietary_medical") || null,
    momo_reference: g("momo_reference") || null,
    payment_plan: g("payment_plan") || null,
    fee_acknowledged: true,
  });

  if (error) {
    // Surface the real reason so it's diagnosable (e.g. missing table / column).
    redirect(`/register?error=${encodeURIComponent(`Could not save: ${error.message}`)}#form`);
  }

  redirect("/thank-you");
}
