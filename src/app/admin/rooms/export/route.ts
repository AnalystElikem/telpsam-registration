import { isAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const floorLabel = (f: string) => (f === "first" ? "First floor" : f === "second" ? "Second floor" : f);
const genderLabel = (g: string) => (g === "female" ? "Ladies" : g === "male" ? "Gentlemen" : g);

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const supabase = createAdminClient();
  const [{ data: roomData }, { data: regData }] = await Promise.all([
    supabase.from("conference_rooms").select("code, floor, gender, beds, sort").order("sort"),
    supabase.from("conference_registrations").select("full_name, room_assigned"),
  ]);
  const rooms = (roomData as { code: string; floor: string; gender: string; beds: number }[]) ?? [];

  const occupants: Record<string, string[]> = {};
  for (const r of (regData as { full_name: string; room_assigned: string | null }[]) ?? []) {
    const code = (r.room_assigned || "").trim();
    if (code) (occupants[code] ??= []).push(r.full_name);
  }

  const headers = ["Room", "Floor", "For", "Beds", "Occupied", "Spaces left", "Occupants"];
  const lines = rooms.map((r) => {
    const names = occupants[r.code] ?? [];
    return [
      r.code, floorLabel(r.floor), genderLabel(r.gender), r.beds, names.length, Math.max(r.beds - names.length, 0), names.join("; "),
    ].map(csvCell).join(",");
  });
  const csv = `﻿${headers.map(csvCell).join(",")}\n${lines.join("\n")}`;

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="conference-rooms-${date}.csv"`,
    },
  });
}
