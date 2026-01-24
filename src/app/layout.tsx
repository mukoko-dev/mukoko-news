import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Serif } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { PreferencesProvider } from '@/contexts/preferences-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { OnboardingModal } from '@/components/onboarding-modal';
import { OrganizationJsonLd } from '@/components/ui/json-ld';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Mukoko News - Africa\'s News Hub',
  description: 'Pan-African digital news aggregation platform. Your trusted source for news from Zimbabwe and across Africa.',
  keywords: ['news', 'Africa', 'Zimbabwe', 'pan-African', 'digital news'],
  authors: [{ name: 'Nyuchi' }],
  openGraph: {
    title: 'Mukoko News',
    description: 'Pan-African digital news aggregation platform',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className={`${plusJakarta.variable} ${notoSerif.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider defaultTheme="system" storageKey="mukoko-news-theme">
          <PreferencesProvider>
            {/* Five African Minerals vertical stripe */}
            <div className="minerals-stripe" />

            <Header />
            <main className="flex-1 relative z-10 pb-16 md:pb-0">{children}</main>
            <Footer />
            <BottomNav />

            {/* Onboarding Modal */}
            <OnboardingModal />
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
