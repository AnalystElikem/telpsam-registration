import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CONFERENCE } from "@/lib/config";

export const metadata = { title: `Registered — ${CONFERENCE.name}` };

export default function ThankYouPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="mt-4 text-2xl font-bold text-ink">You&apos;re registered</h1>
      <p className="mt-2 text-body">
        Thank you for registering your intent to attend {CONFERENCE.name}. Your details have been received.
      </p>
      <div className="mt-6 w-full rounded-lg border border-blue/20 bg-blue-soft p-4 text-left text-sm text-ink">
        <p className="font-semibold">Before the conference, please remember:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-body">
          <li>Pay your fee by MoMo to <strong className="text-ink">{CONFERENCE.momo.number}</strong> ({CONFERENCE.momo.name}) using your name as the reference, or pay at the venue.</li>
          <li>Send your payment proof by WhatsApp to <strong className="text-ink">{CONFERENCE.momo.whatsapp}</strong>.</li>
          <li>Keep your payment reference number for verification at the venue.</li>
        </ul>
      </div>
      <Link href="/register" className="btn btn-outline mt-6">Register someone else</Link>
    </main>
  );
}
