"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ATTENDEE_TYPES } from "@/lib/config";

export async function registerAttendee(formData: FormData) {
  const g = (k: string) => String(formData.get(k) || "").trim();

  const full_name = g("full_name");
  const phone = g("phone");
  const email = g("email");
  const attendee_type = g("attendee_type").toLowerCase();
  const isWorker = attendee_type === "worker";
  const workplace = g("workplace");
  const job_title = g("job_title");
  const feeAck = formData.get("fee_acknowledged") === "on";

  // Server-side validation (belt-and-braces on top of the form's own checks).
  const errors: string[] = [];
  if (full_name.split(/\s+/).filter(Boolean).length < 2) {
    errors.push("Please enter at least two names (for example, first and last name).");
  }
  if (!phone) errors.push("A phone number is required.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("Please enter a valid email address.");
  if (!ATTENDEE_TYPES.map((t) => t.toLowerCase()).includes(attendee_type)) {
    errors.push("Please indicate whether you are a student or a worker.");
  }
  if (isWorker && (!workplace || !job_title)) {
    errors.push("Workers must give their place of work and position.");
  }
  if (!feeAck) errors.push("Please confirm that you understand the conference fees.");

  if (errors.length) {
    redirect(`/?error=${encodeURIComponent(errors.join(" "))}#form`);
  }

  const yearNum = parseInt(g("completion_year"), 10);
  const supabase = await createClient();
  const { error } = await supabase.from("conference_registrations").insert({
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
    email,
    emergency_contact_name: g("emergency_contact_name") || null,
    emergency_contact_phone: g("emergency_contact_phone") || null,
    dietary_medical: g("dietary_medical") || null,
    momo_reference: g("momo_reference") || null,
    payment_plan: g("payment_plan") || null,
    fee_acknowledged: true,
  });

  if (error) {
    redirect(`/?error=${encodeURIComponent("Sorry, something went wrong saving your registration. Please try again.")}#form`);
  }

  redirect("/thank-you");
}
