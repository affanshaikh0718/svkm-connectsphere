import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'ConnectSphere — SVKM Professional Network',
    template: '%s | ConnectSphere SVKM',
  },
  description:
    'ConnectSphere is the professional networking and campus placement platform exclusively for Shri Vile Parle Kelavani Mandal (SVKM) students, alumni, faculty, and recruiters.',
  keywords: ['SVKM', 'MPSTME', 'DJSCE', 'NMIMS', 'Mithibai', 'NM College', 'campus placements', 'professional networking', 'LinkedIn for SVKM'],
  authors: [{ name: 'ConnectSphere SVKM Team' }],
  openGraph: {
    type: 'website',
    siteName: 'ConnectSphere SVKM',
    title: 'ConnectSphere — SVKM Professional Network',
    description: 'The exclusive professional networking platform for the SVKM ecosystem.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConnectSphere SVKM',
    description: 'The exclusive professional networking platform for the SVKM ecosystem.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
