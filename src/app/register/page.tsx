import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import RegistrationForm from "@/components/RegistrationForm";
import { CONFERENCE } from "@/lib/config";

export const metadata = { title: `Register — ${CONFERENCE.name}` };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-blue">
        <ArrowLeft className="h-4 w-4" /> Back to conference details
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <Image src="/anniversary-25.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-blue">Register</h1>
          <p className="text-sm text-muted">{CONFERENCE.name}</p>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-blue-soft px-4 py-3 text-sm text-ink">
        This is a registration of intent and data collection only. Payment and room allocation are handled at the venue.
      </p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-red-soft p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <RegistrationForm />
    </main>
  );
}
