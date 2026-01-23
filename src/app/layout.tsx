import { Kumbh_Sans } from 'next/font/google';

import '@/app/globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';

const KumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kumbh-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={KumbhSans.variable}>
        <Providers>
          <header>
            <Navbar />
          </header>

          {/* The {children} prop is where the specific page content is injected */}
          <main className="">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
