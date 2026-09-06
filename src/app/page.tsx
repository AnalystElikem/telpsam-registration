import Image from "next/image";
import { AlertCircle, Smartphone, MessageCircle, BedDouble, Info } from "lucide-react";
import RegistrationForm from "@/components/RegistrationForm";
import { CONFERENCE } from "@/lib/config";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      {/* Photo banner */}
      <div className="overflow-hidden rounded-2xl">
        <Image
          src="/hero.jpg"
          alt="TELPSAM Conference"
          width={1600}
          height={1066}
          priority
          className="h-48 w-full object-cover sm:h-56"
        />
      </div>

      {/* Header */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="px-6 py-9 text-center">
          <Image
            src="/anniversary-25.png"
            alt={`TELPSAM ${CONFERENCE.anniversary}`}
            width={130}
            height={130}
            priority
            className="mx-auto h-28 w-28 object-contain"
          />
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-red">{CONFERENCE.anniversary}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-blue sm:text-4xl">
            TELPSAM CONFERENCE <span className="text-red">2026</span>
          </h1>

          <div className="mx-auto mt-4 max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red">Theme</p>
            <p className="mt-0.5 font-serif text-xl font-bold text-blue">{CONFERENCE.theme}</p>
            <p className="text-xs italic text-muted">{CONFERENCE.verse}</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-bold uppercase tracking-wide text-ink">{CONFERENCE.venue}</p>
            <p className="text-sm font-bold text-red">{CONFERENCE.dates}</p>
          </div>
        </div>
      </div>

      {/* Intro note */}
      <p className="mt-5 rounded-lg bg-blue-soft px-4 py-3 text-center text-sm text-ink">
        This portal is for <strong>registration of intent and data collection only</strong>.
        Payment confirmation, room allocation, and everything else are handled at the venue.
      </p>

      {/* Fees & payment */}
      <section className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-blue">
          <Smartphone className="h-5 w-5 text-red" /> Fees &amp; payment
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {CONFERENCE.fees.map((f) => (
            <div key={f.label} className="rounded-xl border border-line bg-canvas p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{f.label}</p>
              <p className="mt-1 text-xl font-extrabold text-blue">GHS {f.amount}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-canvas p-4 text-sm text-body">
          <p>
            Pay by Mobile Money to <strong className="text-ink">{CONFERENCE.momo.number}</strong>{" "}
            (<strong className="text-ink">{CONFERENCE.momo.name}</strong>). You may pay ahead of the
            conference or when you arrive.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>When paying by MoMo, use <strong className="text-ink">your own name</strong> as the reference.</li>
            <li className="flex items-start gap-1">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-red" />
              Send your payment proof by WhatsApp to <strong className="text-ink">&nbsp;{CONFERENCE.momo.number}</strong>.
            </li>
            <li>Note your payment reference number for verification at the venue.</li>
          </ul>
        </div>
      </section>

      {/* Rooms */}
      <section className="card mt-4 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-blue">
          <BedDouble className="h-5 w-5 text-red" /> Rooms
        </h2>
        <p className="mt-2 text-sm text-body">
          Room allocation is done manually at the venue. To make facilitation easy, you may
          choose your roommates, and special arrangements are made so that alumni have
          separate rooms from students.
        </p>
      </section>

      {/* Error banner */}
      {error && (
        <div className="mt-8 flex items-start gap-2 rounded-lg border border-danger/30 bg-red-soft p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-blue">
          <Info className="h-5 w-5 text-red" /> Your details
        </h2>
        <RegistrationForm />
      </section>
    </main>
  );
}
