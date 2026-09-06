import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

// Service-role client. Bypasses RLS — used ONLY on the server for the admin
// registrations list/export. Never import this into a client component.
export function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
