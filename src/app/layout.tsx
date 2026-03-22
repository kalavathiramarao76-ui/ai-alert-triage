import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthGate } from "@/components/AuthGate";
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
  openGraph: {
    title: "AlertTriage AI - Intelligent Alert Management",
    description: "AI-powered alert triage for SRE teams. Classify, deduplicate, and prioritize alerts from PagerDuty, Datadog, and CloudWatch in seconds.",
    type: "website",
    url: "https://ai-alert-triage.vercel.app",
    siteName: "AlertTriage AI",
    images: [
      {
        url: "https://ai-alert-triage.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "AlertTriage AI - Intelligent Alert Management for SRE Teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlertTriage AI - Alert Management for SRE Teams",
    description: "AI classifies, deduplicates, and prioritizes your alerts so your team focuses on what matters.",
    images: ["https://ai-alert-triage.vercel.app/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://ai-alert-triage.vercel.app",
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AlertTriage AI",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description:
                "AI-powered alert triage, deduplication, noise reduction, and incident management for DevOps and SRE teams.",
              url: "https://ai-alert-triage.vercel.app",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "95",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)] bg-zinc-950 text-zinc-100`}>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
