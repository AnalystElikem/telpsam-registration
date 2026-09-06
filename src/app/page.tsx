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
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src="/hero.jpg"
          alt="TELPSAM Conference"
          width={1600}
          height={1066}
          priority
          className="h-52 w-full object-cover sm:h-64"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold-soft">
            The Lord&apos;s Pentecostal Church International
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{CONFERENCE.name}</h1>
          <p className="mt-0.5 text-sm text-white/90">{CONFERENCE.dates} · {CONFERENCE.venue}</p>
        </div>
      </div>

      <header className="mt-5 flex items-center gap-3">
        <Image src="/telpsam-logo.png" alt="TELPSAM" width={40} height={40} className="h-10 w-10 object-contain" />
        <p className="rounded-lg bg-teal-soft/60 px-3 py-2 text-sm text-ink">
          This portal is for <strong>registration of intent and data collection only</strong>.
          Payment confirmation, room allocation, and everything else are handled at the venue.
        </p>
      </header>

      {/* Payment information */}
      <section className="card mt-8 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Smartphone className="h-5 w-5 text-teal" /> Fees &amp; payment
        </h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <tbody>
              {CONFERENCE.fees.map((f, i) => (
                <tr key={f.label} className={i % 2 ? "bg-canvas" : ""}>
                  <td className="px-4 py-2 text-body">{f.label}</td>
                  <td className="px-4 py-2 text-right font-semibold text-ink">GHS {f.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              Send your payment proof by WhatsApp to <strong className="text-ink">&nbsp;{CONFERENCE.momo.number}</strong>.
            </li>
            <li>Note your payment reference number — you&apos;ll need it for verification at the venue.</li>
          </ul>
        </div>
      </section>

      {/* Rooming note */}
      <section className="card mt-4 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <BedDouble className="h-5 w-5 text-teal" /> Rooms
        </h2>
        <p className="mt-2 text-sm text-body">
          Room allocation is done manually at the venue. To make facilitation easy, you may
          choose your roommates, and special arrangements are made so that alumni have
          separate rooms from students.
        </p>
      </section>

      {/* Error banner */}
      {error && (
        <div className="mt-8 flex items-start gap-2 rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Info className="h-5 w-5 text-teal" /> Your details
        </h2>
        <RegistrationForm />
      </section>
    </main>
  );
}
