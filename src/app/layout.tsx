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

// FOUC prevention script - runs before paint
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('at-theme') || 'dark';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.add(resolved === 'light' ? 'light' : 'dark');
    document.documentElement.classList.remove(resolved === 'light' ? 'dark' : 'light');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)] bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
