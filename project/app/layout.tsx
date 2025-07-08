'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide navbar on room page
  const hideNavbar = pathname === '/room';

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className={hideNavbar ? "h-screen overflow-hidden" : "min-h-screen bg-background"}>
            {!hideNavbar && <Navbar />}
            <main className={hideNavbar ? "h-full" : "flex-1"}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}