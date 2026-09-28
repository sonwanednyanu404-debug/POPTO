import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/Toast';
import { AuthProvider } from '@/components/AuthProvider';
import { CartDrawer } from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'POPTO — Fresh Maharashtra Lemons | From Farmers to Buyers',
  description: 'Discover fresh lemons from trusted farmers and sellers across Maharashtra. Direct from farms to your doorstep. POPTO - Discover. Plan. Progress.',
  keywords: 'lemons, Maharashtra, fresh lemons, organic lemons, farm fresh, lemon delivery, POPTO, Indian lemons',
  openGraph: {
    title: 'POPTO — Fresh Maharashtra Lemons',
    description: 'Discover fresh lemons from trusted farmers and sellers across Maharashtra.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'POPTO',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2E7D32" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <ToastContainer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
