import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Microdrama AI Studio',
  description:
    'Generator Naskah, Visual Storyboard & Master Prompt Terpadu untuk Produksi Microdrama Vertikal & Layar Lebar (1–10 Menit).',
  openGraph: {
    title: 'Microdrama AI Studio',
    description:
      'Generator Naskah, Visual Storyboard & Master Prompt Terpadu untuk Produksi Microdrama Vertikal & Layar Lebar (1–10 Menit).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Microdrama AI Studio',
    description:
      'Generator Naskah, Visual Storyboard & Master Prompt Terpadu untuk Produksi Microdrama Vertikal & Layar Lebar (1–10 Menit).',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#090b10] text-slate-100 antialiased selection:bg-violet-600 selection:text-white font-sans min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}
