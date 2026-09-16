"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, setAdminCookie, clearAdminCookie, isAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { expectedFee } from "@/lib/fees";

export async function loginAdmin(formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (checkPassword(pw)) {
    await setAdminCookie();
    redirect("/admin");
  }
  redirect("/admin?error=1");
}

export async function logoutAdmin() {
  await clearAdminCookie();
  redirect("/admin");
}

// A coordinator records a registrant's payment and room. "Received by" is the
// name of whoever took the money / made the update, stamped with the time — a
// lightweight record without needing separate admin accounts.
export async function updateRegistration(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin");

  const amountRaw = String(formData.get("amount_paid") || "").trim();
  const parsed = amountRaw === "" ? null : Number(amountRaw);
  const amount_paid = parsed !== null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;

  const room_assigned = String(formData.get("room_assigned") || "").trim() || null;
  const received_by = String(formData.get("received_by") || "").trim() || null;
  const payment_note = String(formData.get("payment_note") || "").trim().slice(0, 500) || null;
  const q = String(formData.get("q") || "").trim();

  const supabase = createAdminClient();

  // A note is mandatory whenever the amount differs from the expected fee
  // (less, more, or 0). Re-checked here in case the browser validation is bypassed.
  const { data: reg } = await supabase
    .from("conference_registrations")
    .select("attendee_type, education_level")
    .eq("id", id)
    .maybeSingle();
  const expected = expectedFee(reg?.attendee_type, reg?.education_level);
  if ((amount_paid ?? -1) !== expected && !payment_note) {
    redirect(`/admin?noteReq=${id}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
  }

  await supabase
    .from("conference_registrations")
    .update({
      amount_paid,
      room_assigned,
      received_by,
      payment_note,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin");
  redirect(`/admin?saved=${id}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
}
