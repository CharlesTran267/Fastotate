'use client';
import { Comfortaa } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const font = Comfortaa({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="fastotate">
      <body className={`flex h-screen flex-col bg-base-100 ${font.className}`}>
        <Header />
        <main className="flex flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
