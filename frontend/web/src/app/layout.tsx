import type { Metadata } from 'next';
import { Comfortaa } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const font = Comfortaa({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fastotate',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="fastotate">
      <body className={`bg-base-100 ${font.className}`}>
        <div className="h-screen">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
