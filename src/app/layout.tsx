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
  title: 'Key-2-Rent | Find Your Perfect Home in Machakos, Kenya',
  description: 'Discover rental properties in Machakos, Kenya. Browse bedsitters, apartments, houses, and commercial spaces. Connect directly with landlords. Free to search!',
  keywords: ['Machakos rentals', 'Kenya property', 'houses for rent', 'apartments Machakos', 'bedsitter Kenya', 'rental homes'],
  authors: [{ name: 'Key-2-Rent' }],
  openGraph: {
    title: 'Key-2-Rent - Property Rentals in Machakos',
    description: 'Find your perfect rental home in Machakos, Kenya',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
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
