import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import QueryProvider from '@/lib/queryProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://monomon.vercel.app/'),
  title: 'monmon',
  description: 'Find your Pokémon twin with Monomon',
  openGraph: {
    title: 'monmon',
    description: 'Find your Pokémon twin with Monomon',
    images: [
      {
        url: '/images/og-image.png',
        width: 400,
        height: 400,
        alt: 'monomon og-image',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-full min-h-screen bg-white text-black">
        <QueryProvider>
          <main className="mx-auto w-full max-w-4xl px-4">{children}</main>
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
