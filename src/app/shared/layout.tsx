import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shared Incident - AlertTriage AI',
  description: 'View a shared incident from AlertTriage AI. AI-powered alert triage for SRE and DevOps teams.',
  openGraph: {
    title: 'Shared Incident - AlertTriage AI',
    description: 'View a shared incident report with AI-powered triage details, priority, timeline, and affected services.',
    type: 'website',
    siteName: 'AlertTriage AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shared Incident - AlertTriage AI',
    description: 'View a shared incident report with AI-powered triage details.',
  },
};

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
