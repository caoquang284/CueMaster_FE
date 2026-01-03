import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SWRProvider } from '@/components/providers/swr-provider';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CueMaster - Billiard Management System',
  description: 'Premium billiard facilities management and booking system',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SWRProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
