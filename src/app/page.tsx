import Image from "next/image";
import Link from "next/link";
import { Smartphone, MessageCircle, BedDouble, ArrowRight, ChevronDown } from "lucide-react";
import BackgroundSlider from "@/components/BackgroundSlider";
import { CONFERENCE, PHOTOS, telHref, waHref } from "@/lib/config";

export default function LandingPage() {
  return (
    <main>
      {/* Full-screen hero: photos fill the page, details overlaid */}
      <section className="relative flex min-h-screen flex-col">
        <BackgroundSlider photos={PHOTOS} />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-16 text-center text-white">
          <div className="rounded-2xl bg-white p-2 shadow-lg">
            <Image
              src="/anniversary-25.png"
              alt={`TELPSAM ${CONFERENCE.anniversary}`}
              width={110}
              height={110}
              priority
              className="h-24 w-24 object-contain"
            />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-gold-soft">{CONFERENCE.anniversary}</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white drop-shadow sm:text-5xl">
            TELPSAM CONFERENCE 2026
          </h1>

          <div className="mt-5 max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-soft">Theme</p>
            <p className="mt-1 font-serif text-2xl font-bold text-white drop-shadow">{CONFERENCE.theme}</p>
            <p className="text-sm italic text-white/85">{CONFERENCE.verse}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-wide text-white drop-shadow">{CONFERENCE.venue}</p>
            <p className="text-base font-bold text-gold-soft">{CONFERENCE.dates}</p>
          </div>

          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-blue shadow-lg transition-colors hover:bg-gold-soft"
          >
            Register for the conference <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-xs text-white/75">Registration of intent only. Everything else is handled at the venue.</p>
        </div>

        <a
          href="#details"
          className="relative z-10 mb-6 flex flex-col items-center gap-1 text-xs text-white/80 hover:text-white"
        >
          Details &amp; fees
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* Details below the fold */}
      <div id="details" className="mx-auto max-w-2xl px-5 py-10">
        <section className="card p-6">
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
              Pay by Mobile Money to{" "}
              <a href={telHref(CONFERENCE.momo.number)} className="font-semibold text-blue underline decoration-blue/40 underline-offset-2">
                {CONFERENCE.momo.number}
              </a>{" "}
              (<strong className="text-ink">{CONFERENCE.momo.name}</strong>). You may pay ahead of the
              conference or when you arrive.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>When paying by MoMo, use <strong className="text-ink">your own name</strong> as the reference.</li>
              <li className="flex items-start gap-1">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-red" />
                <span>
                  Send your payment proof by WhatsApp to{" "}
                  <a href={waHref(CONFERENCE.momo.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue underline decoration-blue/40 underline-offset-2">
                    {CONFERENCE.momo.whatsapp}
                  </a>.
                </span>
              </li>
              <li>Note your payment reference number for verification at the venue.</li>
            </ul>
          </div>
        </section>

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

        <Link href="/register" className="btn btn-primary mt-6 w-full !py-3.5 text-base">
          Register now <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </main>
  );
}
