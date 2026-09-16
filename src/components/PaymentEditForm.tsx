"use client";

import { useState } from "react";
import { updateRegistration } from "@/app/actions/admin";

// Editable payment/room row. The note becomes required the moment the amount
// entered differs from the expected fee (less, more, or 0), so a reason is
// always recorded for anything that isn't a clean, full payment.
export default function PaymentEditForm({
  id,
  q,
  expected,
  amount,
  room,
  receivedBy,
  note,
}: {
  id: string;
  q: string;
  expected: number;
  amount: number | null;
  room: string | null;
  receivedBy: string | null;
  note: string | null;
}) {
  const [amt, setAmt] = useState<string>(amount != null ? String(amount) : "");
  const deviates = amt.trim() === "" || Number(amt) !== expected;

  return (
    <form action={updateRegistration} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="q" value={q} />

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
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Room</label>
          <input name="room_assigned" required defaultValue={room ?? ""} className="field !py-2" placeholder="e.g. B12" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Received by</label>
          <input name="received_by" required defaultValue={receivedBy ?? ""} className="field !py-2" placeholder="Your name" />
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
