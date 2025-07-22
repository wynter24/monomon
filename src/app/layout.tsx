import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'monmon',
  description: 'Find your Pokémon twin with Monomon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-full min-h-screen bg-white text-black">
        <main className="mx-auto w-full max-w-4xl px-4">{children}</main>
      </body>
    </html>
  );
}
