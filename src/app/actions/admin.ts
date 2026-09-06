"use server";

import { redirect } from "next/navigation";
import { checkPassword, setAdminCookie, clearAdminCookie } from "@/lib/adminAuth";

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
