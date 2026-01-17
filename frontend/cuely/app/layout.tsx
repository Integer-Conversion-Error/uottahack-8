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

import LayoutWrapper from '@/components/LayoutWrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${josefin_sans.variable} ${kaisei_opti.variable}`}>
      <body className={kaisei_opti.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}