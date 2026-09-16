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

const sameStamp = (a: string, b: string) => {
  if (!a && !b) return true;
  const ta = a ? new Date(a).getTime() : NaN;
  const tb = b ? new Date(b).getTime() : NaN;
  return ta === tb;
};

// A coordinator records a registrant's payment and room. Every save:
//  • requires a note when the amount differs from the expected fee,
//  • is rejected if the record changed since the form loaded (no silent overwrite),
//  • enforces the room's gender-floor and 6-bed capacity,
//  • is written to registration_audit so every edit is traceable.
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
  const expected_updated_at = String(formData.get("expected_updated_at") || "").trim();
  const q = String(formData.get("q") || "").trim();
  const qs = q ? `&q=${encodeURIComponent(q)}` : "";
  const fail = (code: string): never => redirect(`/admin?err=${code}&errId=${id}${qs}`);

  const supabase = createAdminClient();

  const { data: reg } = await supabase
    .from("conference_registrations")
    .select("attendee_type, education_level, gender, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!reg) redirect("/admin");

  // Reject a stale save (someone edited this record after the form loaded).
  if (!sameStamp(expected_updated_at, reg.updated_at ?? "")) fail("conflict");

  // A note is mandatory whenever the amount differs from the expected fee.
  const expected = expectedFee(reg.attendee_type, reg.education_level);
  if ((amount_paid ?? -1) !== expected && !payment_note) fail("note");

  // Room rules: right floor for the person's gender, and not already full.
  if (room_assigned) {
    const { data: roomRow } = await supabase
      .from("conference_rooms")
      .select("code, gender, beds")
      .eq("code", room_assigned)
      .maybeSingle();
    if (!roomRow) return fail("roombad");
    const rg = (reg.gender || "").toLowerCase();
    if ((rg === "male" || rg === "female") && roomRow.gender !== rg) return fail("roomgender");
    const { count } = await supabase
      .from("conference_registrations")
      .select("*", { count: "exact", head: true })
      .eq("room_assigned", room_assigned)
      .neq("id", id);
    if ((count ?? 0) >= (roomRow.beds ?? 6)) fail("roomfull");
  }

  // Record the edit (history), then apply it.
  await supabase.from("registration_audit").insert({
    registration_id: id,
    editor: received_by,
    amount_paid,
    room_assigned,
    payment_note,
  });

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
  redirect(`/admin?saved=${id}${qs}`);
}

// Clear a registrant's payment/room entry (e.g. a record entered by mistake).
// Resets the fields and logs the clear so it's still traceable.
export async function clearRegistration(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin");
  const received_by = String(formData.get("received_by") || "").trim() || null;
  const expected_updated_at = String(formData.get("expected_updated_at") || "").trim();
  const q = String(formData.get("q") || "").trim();
  const qs = q ? `&q=${encodeURIComponent(q)}` : "";

  const supabase = createAdminClient();
  const { data: reg } = await supabase
    .from("conference_registrations")
    .select("updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!reg) redirect("/admin");
  if (!sameStamp(expected_updated_at, reg.updated_at ?? "")) redirect(`/admin?err=conflict&errId=${id}${qs}`);

  await supabase.from("registration_audit").insert({
    registration_id: id,
    editor: received_by,
    amount_paid: null,
    room_assigned: null,
    payment_note: "Cleared",
  });
  await supabase
    .from("conference_registrations")
    .update({ amount_paid: null, room_assigned: null, received_by: null, payment_note: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin");
  redirect(`/admin?cleared=${id}${qs}`);
}

// --- Room management (rebalance ladies/gentlemen, add or remove rooms) --------

async function roomOccupied(supabase: ReturnType<typeof createAdminClient>, code: string): Promise<boolean> {
  const { count } = await supabase
    .from("conference_registrations")
    .select("*", { count: "exact", head: true })
    .eq("room_assigned", code);
  return (count ?? 0) > 0;
}

// Switch an EMPTY room between ladies (female) and gentlemen (male).
export async function setRoomGender(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const code = String(formData.get("code") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  if (!code || (gender !== "male" && gender !== "female")) redirect("/admin/rooms");

  const supabase = createAdminClient();
  if (await roomOccupied(supabase, code)) redirect("/admin/rooms?err=occupied");
  await supabase.from("conference_rooms").update({ gender }).eq("code", code);
  revalidatePath("/admin/rooms");
  redirect("/admin/rooms?done=switched");
}

// Add a new room.
export async function createRoom(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const floor = String(formData.get("floor") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const bedsRaw = Number(String(formData.get("beds") || "6"));
  const beds = Number.isFinite(bedsRaw) && bedsRaw >= 1 && bedsRaw <= 20 ? Math.floor(bedsRaw) : 6;
  if (!code || (floor !== "first" && floor !== "second") || (gender !== "male" && gender !== "female")) {
    redirect("/admin/rooms?err=roombad");
  }

  const supabase = createAdminClient();
  const { data: maxRow } = await supabase
    .from("conference_rooms")
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = (((maxRow?.sort as number) ?? 0) + 1) as number;
  const { error } = await supabase.from("conference_rooms").insert({ code, floor, gender, beds, sort });
  if (error) redirect("/admin/rooms?err=dupe");
  revalidatePath("/admin/rooms");
  redirect("/admin/rooms?done=added");
}

// Remove an EMPTY room (e.g. one added by mistake).
export async function deleteRoom(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const code = String(formData.get("code") || "").trim();
  if (!code) redirect("/admin/rooms");

  const supabase = createAdminClient();
  if (await roomOccupied(supabase, code)) redirect("/admin/rooms?err=occupied");
  await supabase.from("conference_rooms").delete().eq("code", code);
  revalidatePath("/admin/rooms");
  redirect("/admin/rooms?done=removed");
}
