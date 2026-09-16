"use client";

import { useEffect, useState } from "react";
import { updateRegistration } from "@/app/actions/admin";

type RoomOpt = { code: string; gender: string; beds: number };

// Editable payment/room row.
//  • The note becomes required the instant the amount differs from the expected fee.
//  • Rooms are limited to the person's floor (ladies = first, gentlemen = second)
//    and a full room (6/6) can't be picked unless they're already in it.
//  • "Received by" remembers the coordinator's name on this device.
//  • A hidden updated-at lets the server reject a stale save (someone edited first).
export default function PaymentEditForm({
  id,
  q,
  expected,
  amount,
  room,
  receivedBy,
  note,
  updatedAt,
  gender,
  rooms,
  occupancy,
}: {
  id: string;
  q: string;
  expected: number;
  amount: number | null;
  room: string | null;
  receivedBy: string | null;
  note: string | null;
  updatedAt: string | null;
  gender: string | null;
  rooms: RoomOpt[];
  occupancy: Record<string, number>;
}) {
  const [amt, setAmt] = useState<string>(amount != null ? String(amount) : "");
  const [rcv, setRcv] = useState<string>(receivedBy ?? "");
  const deviates = amt.trim() === "" || Number(amt) !== expected;

  // Pre-fill the coordinator's name from this device if the record has none yet.
  useEffect(() => {
    if (!receivedBy) {
      try {
        const saved = localStorage.getItem("telpsam_received_by");
        if (saved) setRcv(saved);
      } catch {}
    }
  }, [receivedBy]);

  const g = (gender || "").toLowerCase();
  const eligible = g === "male" || g === "female" ? rooms.filter((r) => r.gender === g) : rooms;

  const onRcv = (v: string) => {
    setRcv(v);
    try {
      if (v.trim()) localStorage.setItem("telpsam_received_by", v.trim());
    } catch {}
  };

  return (
    <form action={updateRegistration} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="q" value={q} />
      <input type="hidden" name="expected_updated_at" value={updatedAt ?? ""} />

      <div className="grid items-end gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Amount paid (GHS) · expected {expected}
          </label>
          <input
            name="amount_paid"
            type="number"
            min="0"
            step="1"
            required
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
            className="field !py-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Room {g ? "" : "(set gender first)"}
          </label>
          <select name="room_assigned" defaultValue={room ?? ""} className="field !py-2">
            <option value="">— Unassigned —</option>
            {eligible.map((r) => {
              const occ = occupancy[r.code] ?? 0;
              const isCurrent = r.code === room;
              const full = occ >= r.beds && !isCurrent;
              return (
                <option key={r.code} value={r.code} disabled={full}>
                  {r.code} — {occ}/{r.beds}
                  {full ? " · full" : ""}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Received by</label>
          <input
            name="received_by"
            required
            value={rcv}
            onChange={(e) => onRcv(e.target.value)}
            className="field !py-2"
            placeholder="Your name"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
          Note{" "}
          {deviates ? (
            <span className="text-danger">· required (amount differs from GHS {expected})</span>
          ) : (
            <span className="normal-case text-muted">(optional)</span>
          )}
        </label>
        <textarea
          name="payment_note"
          rows={2}
          required={deviates}
          defaultValue={note ?? ""}
          className="field !py-2"
          placeholder="e.g. paid GHS 100, balance to be paid at the venue"
        />
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary !py-2">Save</button>
      </div>
    </form>
  );
}
