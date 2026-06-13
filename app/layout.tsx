import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'MindBridge — Mental Wellness for Exam Aspirants',
    template: '%s | MindBridge',
  },
  description:
    'AI-powered mental wellness companion for Indian students preparing for NEET, JEE, CUET, CAT, GATE, and UPSC exams.',
  keywords: ['mental wellness', 'exam stress', 'NEET', 'JEE', 'mindfulness', 'journaling'],
  authors: [{ name: 'MindBridge Team' }],
  robots: 'noindex, nofollow', // Private tool; no public indexing
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
