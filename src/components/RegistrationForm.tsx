"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { registerAttendee } from "@/app/actions/register";
import { branchRegions, ASSOCIATE, OTHER_BRANCH } from "@/data/branches";
import { CONFERENCE, EDUCATION_LEVELS, GENDERS, ATTENDEE_TYPES, COMPLETION_YEARS } from "@/lib/config";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Submitting…" : "Submit registration"}
    </button>
  );
}

const feeLine = CONFERENCE.fees.map((f) => `GHS ${f.amount} (${f.label})`).join(", ");

export default function RegistrationForm() {
  const [isWorker, setIsWorker] = useState(false);

  return (
    <form id="form" action={registerAttendee} className="card mt-6 space-y-5 p-6">
      {/* Honeypot: hidden from people, tempting to bots. If filled, we drop it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Full name */}
      <div>
        <label className="label" htmlFor="full_name">Full name <span className="text-danger">*</span></label>
        <input
          id="full_name"
          name="full_name"
          required
          pattern="^\s*\S+(\s+\S+)+\s*$"
          title="Please enter at least two names (for example, first and last name)."
          className="field"
          placeholder="First name and surname"
          autoComplete="name"
        />
        <p className="mt-1 text-xs text-muted">Enter at least two names.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Date of birth */}
        <div>
          <label className="label" htmlFor="date_of_birth">Date of birth <span className="text-danger">*</span></label>
          <input id="date_of_birth" name="date_of_birth" type="date" required className="field" />
        </div>
        {/* Gender */}
        <div>
          <label className="label" htmlFor="gender">Gender <span className="text-danger">*</span></label>
          <select id="gender" name="gender" required defaultValue="" className="field">
            <option value="" disabled>Select…</option>
            {GENDERS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>

      {/* Branch */}
      <div>
        <label className="label" htmlFor="branch">Church branch <span className="text-danger">*</span></label>
        <select id="branch" name="branch" required defaultValue="" className="field">
          <option value="" disabled>Select your branch…</option>
          <option value={ASSOCIATE}>{ASSOCIATE}</option>
          {branchRegions.map((r) => (
            <optgroup key={r.region} label={r.region}>
              {r.branches.map((b) => <option key={`${r.region}-${b}`} value={b}>{b}</option>)}
            </optgroup>
          ))}
          <option value={OTHER_BRANCH}>{OTHER_BRANCH}</option>
        </select>
        <p className="mt-1 text-xs text-muted">If you are not a church member, choose “{ASSOCIATE}”.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Education level */}
        <div>
          <label className="label" htmlFor="education_level">Last / current level of education <span className="text-danger">*</span></label>
          <select id="education_level" name="education_level" required defaultValue="" className="field">
            <option value="" disabled>Select…</option>
            {EDUCATION_LEVELS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        {/* Completion year */}
        <div>
          <label className="label" htmlFor="completion_year">Year of completion (planned or actual) <span className="text-danger">*</span></label>
          <select id="completion_year" name="completion_year" required defaultValue="" className="field">
            <option value="" disabled>Select…</option>
            {COMPLETION_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Institution */}
      <div>
        <label className="label" htmlFor="last_institution">Name of last institution attended <span className="text-danger">*</span></label>
        <input id="last_institution" name="last_institution" required className="field" placeholder="e.g. Accra Academy" />
      </div>

      {/* Attendee type */}
      <div>
        <span className="label">Are you a student or a worker? <span className="text-danger">*</span></span>
        <div className="mt-1 flex flex-wrap gap-3">
          {ATTENDEE_TYPES.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm has-[:checked]:border-blue has-[:checked]:bg-blue-soft">
              <input
                type="radio"
                name="attendee_type"
                value={t}
                required
                onChange={() => setIsWorker(t === "Worker")}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* Worker-only fields */}
      {isWorker && (
        <div className="grid gap-5 rounded-lg bg-canvas p-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="workplace">Place of work <span className="text-danger">*</span></label>
            <input id="workplace" name="workplace" required={isWorker} className="field" placeholder="Organisation / company" />
          </div>
          <div>
            <label className="label" htmlFor="job_title">Position / job title <span className="text-danger">*</span></label>
            <input id="job_title" name="job_title" required={isWorker} className="field" placeholder="Your role" />
          </div>
        </div>
      )}

      <hr className="border-line" />

      {/* Contact */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Phone number <span className="text-danger">*</span></label>
          <input id="phone" name="phone" type="tel" required className="field" placeholder="e.g. 024 000 0000" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email <span className="text-muted">(optional)</span></label>
          <input id="email" name="email" type="email" className="field" placeholder="you@email.com" autoComplete="email" />
        </div>
      </div>

      {/* Emergency contact */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="emergency_contact_name">Emergency contact name <span className="text-muted">(optional)</span></label>
          <input id="emergency_contact_name" name="emergency_contact_name" className="field" placeholder="Next of kin / guardian" />
        </div>
        <div>
          <label className="label" htmlFor="emergency_contact_phone">Emergency contact phone <span className="text-muted">(optional)</span></label>
          <input id="emergency_contact_phone" name="emergency_contact_phone" type="tel" className="field" placeholder="Their phone number" />
        </div>
      </div>

      {/* Dietary / medical */}
      <div>
        <label className="label" htmlFor="dietary_medical">Dietary or medical needs <span className="text-muted">(optional)</span></label>
        <textarea id="dietary_medical" name="dietary_medical" rows={2} className="field" placeholder="Allergies, conditions, or dietary requirements we should know about" />
      </div>

      <hr className="border-line" />

      {/* Payment */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="momo_reference">MoMo reference <span className="text-muted">(optional)</span></label>
          <input id="momo_reference" name="momo_reference" className="field" placeholder="The name/reference you paid with" />
          <p className="mt-1 text-xs text-muted">Note it down for verification at the venue.</p>
        </div>
        <div>
          <span className="label">When will you pay?</span>
          <div className="mt-1 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="payment_plan" value="paid_ahead" /> I have already paid via MoMo
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="payment_plan" value="pay_at_venue" /> I will pay at the venue
            </label>
          </div>
        </div>
      </div>

      {/* Fee acknowledgement */}
      <label className="flex items-start gap-3 rounded-lg border border-blue/20 bg-blue-soft p-4 text-sm text-ink">
        <input type="checkbox" name="fee_acknowledged" required className="mt-0.5 h-4 w-4 shrink-0" />
        <span>I understand the conference fees: <strong>{feeLine}</strong>, and that I may pay ahead of the conference or when I arrive.</span>
      </label>

      <SubmitButton />
      <p className="text-center text-xs text-muted">
        Your details are used only for planning the TELPSAM Conference and are not shared with anyone else.
        This is a registration of intent and data collection only; everything else is handled at the venue.
      </p>
    </form>
  );
}
