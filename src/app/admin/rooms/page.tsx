import { redirect } from "next/navigation";
import { Download, BedDouble, Plus, ArrowLeftRight, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { isAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { setRoomGender, createRoom, deleteRoom } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Rooms" };

type RoomRow = { code: string; floor: string; gender: string; beds: number; sort: number };
type Reg = { full_name: string; room_assigned: string | null; gender: string | null };

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3 text-center">
      <p className="text-2xl font-extrabold text-blue">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

const genderLabel = (g: string) => (g === "female" ? "Ladies" : g === "male" ? "Gentlemen" : g);
const FLOORS = [
  { key: "first", title: "First floor" },
  { key: "second", title: "Second floor" },
];

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; err?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { done, err } = await searchParams;

  const supabase = createAdminClient();
  const [{ data: roomData }, { data: regData }] = await Promise.all([
    supabase.from("conference_rooms").select("code, floor, gender, beds, sort").order("sort"),
    supabase.from("conference_registrations").select("full_name, room_assigned, gender"),
  ]);
  const rooms = (roomData as RoomRow[]) ?? [];
  const regs = (regData as Reg[]) ?? [];

  const occupants: Record<string, string[]> = {};
  for (const r of regs) {
    const code = (r.room_assigned || "").trim();
    if (code) (occupants[code] ??= []).push(r.full_name);
  }

  const totalBeds = rooms.reduce((s, r) => s + r.beds, 0);
  const filled = rooms.reduce((s, r) => s + Math.min(occupants[r.code]?.length ?? 0, r.beds), 0);
  const allocatedRooms = rooms.filter((r) => (occupants[r.code]?.length ?? 0) > 0).length;
  const fullRooms = rooms.filter((r) => (occupants[r.code]?.length ?? 0) >= r.beds).length;

  // Beds per gender vs how many of each gender have registered.
  const ladiesBeds = rooms.filter((r) => r.gender === "female").reduce((s, r) => s + r.beds, 0);
  const gentsBeds = rooms.filter((r) => r.gender === "male").reduce((s, r) => s + r.beds, 0);
  const ladiesReg = regs.filter((r) => (r.gender || "").toLowerCase() === "female").length;
  const gentsReg = regs.filter((r) => (r.gender || "").toLowerCase() === "male").length;

  const DONE: Record<string, string> = { switched: "Room switched.", added: "Room added.", removed: "Room removed." };
  const ERR: Record<string, string> = {
    occupied: "That room has occupants — reassign them before changing or removing it.",
    dupe: "A room with that code already exists.",
    roombad: "Please give a valid code, floor, and gender.",
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <BedDouble className="h-6 w-6 text-blue" /> Rooms
        </h1>
        <a href="/admin/rooms/export" className="btn btn-outline !py-2 !text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a href="/admin" className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-blue hover:bg-canvas">Registrations</a>
        <a href="/admin/payments" className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-blue hover:bg-canvas">Payments</a>
        <a href="/admin/rooms" className="rounded-full bg-blue px-3 py-1 text-xs font-semibold text-white">Rooms</a>
      </div>

      {done && DONE[done] && (
        <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-green-100 p-2.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> {DONE[done]}
        </p>
      )}
      {err && ERR[err] && (
        <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-soft p-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {ERR[err]}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Rooms" value={rooms.length} />
        <Metric label="Allocated" value={allocatedRooms} />
        <Metric label="Full" value={fullRooms} />
        <Metric label="Spaces left" value={totalBeds - filled} />
      </div>

      {/* Beds vs registered, per gender — to spot a mismatch. */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className={`rounded-xl border p-3 text-sm ${ladiesReg > ladiesBeds ? "border-danger/40 bg-red-soft" : "border-line bg-canvas"}`}>
          <span className="font-bold text-red">Ladies</span> · {ladiesReg} registered · {ladiesBeds} beds
          {ladiesReg > ladiesBeds ? <span className="font-semibold text-danger"> · short by {ladiesReg - ladiesBeds}</span> : ""}
        </div>
        <div className={`rounded-xl border p-3 text-sm ${gentsReg > gentsBeds ? "border-danger/40 bg-red-soft" : "border-line bg-canvas"}`}>
          <span className="font-bold text-blue">Gentlemen</span> · {gentsReg} registered · {gentsBeds} beds
          {gentsReg > gentsBeds ? <span className="font-semibold text-danger"> · short by {gentsReg - gentsBeds}</span> : ""}
        </div>
      </div>

      {/* Add a room */}
      <details className="card mt-4 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue">
          <Plus className="h-4 w-4" /> Add a room
        </summary>
        <form action={createRoom} className="mt-3 grid items-end gap-3 sm:grid-cols-[1.2fr_1fr_1fr_0.7fr_auto]">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Room code</label>
            <input name="code" required className="field !py-2" placeholder="e.g. D1-499" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Floor</label>
            <select name="floor" className="field !py-2" defaultValue="first">
              <option value="first">First</option>
              <option value="second">Second</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">For</label>
            <select name="gender" className="field !py-2" defaultValue="female">
              <option value="female">Ladies</option>
              <option value="male">Gentlemen</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Beds</label>
            <input name="beds" type="number" min="1" max="20" defaultValue={6} className="field !py-2" />
          </div>
          <button className="btn btn-primary !py-2">Add</button>
        </form>
      </details>

      {FLOORS.map((f) => {
        const floorRooms = rooms.filter((r) => r.floor === f.key);
        if (floorRooms.length === 0) return null;
        return (
          <section key={f.key} className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{f.title}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {floorRooms.map((r) => {
                const names = occupants[r.code] ?? [];
                const count = names.length;
                const full = count >= r.beds;
                const other = r.gender === "female" ? "male" : "female";
                return (
                  <div key={r.code} className="card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-ink">{r.code}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.gender === "female" ? "bg-red-soft text-red" : "bg-blue-soft text-blue"}`}>
                          {genderLabel(r.gender)}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          full ? "bg-red-soft text-danger" : count > 0 ? "bg-green-100 text-success" : "bg-canvas text-muted"
                        }`}
                      >
                        {count}/{r.beds}
                        {full ? " · full" : count > 0 ? ` · ${r.beds - count} left` : " · empty"}
                      </span>
                    </div>

                    {count > 0 ? (
                      <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-body">
                        {names.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <form action={setRoomGender}>
                          <input type="hidden" name="code" value={r.code} />
                          <input type="hidden" name="gender" value={other} />
                          <button className="btn btn-outline !py-1.5 !text-xs">
                            <ArrowLeftRight className="h-3.5 w-3.5" /> Switch to {genderLabel(other)}
                          </button>
                        </form>
                        <form action={deleteRoom}>
                          <input type="hidden" name="code" value={r.code} />
                          <button className="btn btn-outline !py-1.5 !text-xs !text-danger">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
