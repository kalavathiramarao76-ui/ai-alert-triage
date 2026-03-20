import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AlertTriage AI - Intelligent Alert Management for SRE Teams",
  description: "AI-powered alert triage, deduplication, noise reduction, and incident management for DevOps and SRE teams. Cut through alert fatigue with intelligent classification.",
  keywords: ["SRE", "DevOps", "alert management", "incident response", "AI triage", "PagerDuty", "Datadog"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)] bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
