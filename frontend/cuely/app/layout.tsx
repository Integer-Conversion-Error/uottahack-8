import type { Metadata } from 'next';
import { Josefin_Sans, Kaisei_Opti } from 'next/font/google';
import './globals.css';
import Image from 'next/image';

const josefin_sans = Josefin_Sans({ variable: '--font-josefin_sans',subsets: ['latin'] });
const kaisei_opti = Kaisei_Opti({variable: '--font-kaisei_opti', weight: "400"});

export const metadata: Metadata = {
  title: 'Cuely',
  description: 'Interactive demo for learning to detect sarcasm',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${josefin_sans.variable} ${kaisei_opti.variable}`}>
      <body className={kaisei_opti.className}>
        <header className="w-full flex justify-center pt-2 pb-2 ">
          <Image
            src="/Cuely-logo-bg-removed.png"
            alt="Cuely Logo"
            width={70}
            height={70}
            priority
          />
        </header>
        {children}
      </body>
    </html>
  );
}