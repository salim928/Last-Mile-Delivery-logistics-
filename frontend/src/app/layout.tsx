import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Faster initial paint
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Movva - Last-Mile Delivery Optimization',
    template: '%s | Movva',
  },
  description: 'Smart last-mile delivery logistics platform for Africa. Optimize routes, manage riders, and track deliveries in real-time.',
  keywords: ['delivery', 'logistics', 'last-mile', 'Africa', 'Ghana', 'route optimization', 'fleet management'],
  authors: [{ name: 'Movva' }],
  creator: 'Movva',
  publisher: 'Movva',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#ea580c' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}