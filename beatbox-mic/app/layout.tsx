import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Beatbox Mic - Professional Preset Analyzer & Live Processor',
  description:
    'Upload professional beatbox recordings to extract EQ curves, compression settings, and reverb characteristics. Apply these presets to your live microphone for professional-grade sound.',
  keywords: [
    'beatbox',
    'audio processing',
    'EQ',
    'compression',
    'reverb',
    'vocal effects',
    'microphone presets',
    'live audio',
    'DSP',
  ],
  authors: [{ name: 'Beatbox Mic Team' }],
  openGraph: {
    title: 'Beatbox Mic - Professional Audio Presets',
    description: 'Transform your beatbox sound with AI-powered preset analysis',
    type: 'website',
    url: 'https://beatboxmic.com',
    images: [
      {
        url: 'https://beatboxmic.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Beatbox Mic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beatbox Mic - Professional Audio Presets',
    description: 'Transform your beatbox sound with AI-powered preset analysis',
    images: ['https://beatboxmic.com/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
