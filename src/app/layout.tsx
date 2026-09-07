import type { Metadata, Viewport } from "next";
import { Lora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { CONFERENCE } from "@/lib/config";

const heading = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://registration.telpsam.com";
const desc = `Register to attend ${CONFERENCE.name}. ${CONFERENCE.theme} · ${CONFERENCE.dates} · ${CONFERENCE.venue}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${CONFERENCE.name} — Registration`,
  description: desc,
  openGraph: {
    type: "website",
    siteName: CONFERENCE.name,
    title: CONFERENCE.name,
    description: `${CONFERENCE.theme} · ${CONFERENCE.dates}`,
    url: siteUrl,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: CONFERENCE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: CONFERENCE.name,
    description: `${CONFERENCE.theme} · ${CONFERENCE.dates}`,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#14213d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
