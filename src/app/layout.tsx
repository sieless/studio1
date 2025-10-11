import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { InactivityWarningDialog } from '@/components/inactivity-warning-dialog';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Key-2-Rent | Find Your Perfect Home in Kenya',
  description: 'Discover rental properties across Kenya. Browse bedsitters, apartments, houses, and commercial spaces in all 47 counties. Connect directly with landlords. Free to search!',
  keywords: ['Kenya rentals', 'property Kenya', 'houses for rent', 'apartments Kenya', 'bedsitter Kenya', 'rental homes', 'Nairobi rentals', 'Machakos rentals', 'Mombasa rentals'],
  authors: [{ name: 'Key-2-Rent' }],
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/droibarvx/image/upload/w_32,h_32/key2rent/logo-icon.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://res.cloudinary.com/droibarvx/image/upload/w_16,h_16/key2rent/logo-icon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: 'https://res.cloudinary.com/droibarvx/image/upload/w_180,h_180/key2rent/logo-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Key-2-Rent - Property Rentals Across Kenya',
    description: 'Find your perfect rental home in Kenya. Search across all 47 counties.',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/droibarvx/image/upload/w_1200,h_630/key2rent/logo-og.png',
        width: 1200,
        height: 630,
        alt: 'Key-2-Rent - Find Your Perfect Home in Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Key-2-Rent - Property Rentals Across Kenya',
    description: 'Find your perfect rental home in Kenya. Search across all 47 counties.',
    images: ['https://res.cloudinary.com/droibarvx/image/upload/w_1200,h_630/key2rent/logo-og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <FirebaseClientProvider>
              {children}
              <InactivityWarningDialog />
            </FirebaseClientProvider>
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
