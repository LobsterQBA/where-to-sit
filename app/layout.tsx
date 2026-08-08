import type { Metadata } from "next";
import "@fontsource-variable/instrument-sans";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:4173/";
const metadataBase = new URL(siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`);
const socialImage = new URL("og.png", metadataBase).toString();
const favicon = new URL("favicon.svg", metadataBase).toString();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Where to Sit | IMAX Seat View Simulator",
    template: "%s | Where to Sit",
  },
  description:
    "Compare IMAX theaters in Seattle, New York, and the Bay Area, then preview an estimated seat-level view in 3D.",
  icons: {
    icon: favicon,
    shortcut: favicon,
  },
  openGraph: {
    title: "Where to Sit | IMAX Seat View Simulator",
    description: "Choose a theater. Then preview the seat.",
    type: "website",
    locale: "en_US",
    images: [{ url: socialImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where to Sit | IMAX Seat View Simulator",
    description: "Choose a theater. Then preview the seat.",
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
