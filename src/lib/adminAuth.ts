import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE = "conf_admin";

// The cookie stores a hash derived from ADMIN_PASSWORD, so it can't be forged
// without knowing the password, and the raw password is never stored anywhere.
function expectedToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  return createHash("sha256").update(`telpsam-conf::${pw}`).digest("hex");
}

export function checkPassword(pw: string): boolean {
  const real = process.env.ADMIN_PASSWORD || "";
  return real.length > 0 && pw === real;
}

export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const c = await cookies();
  return c.get(COOKIE)?.value === expectedToken();
}

export async function setAdminCookie(): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearAdminCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}
