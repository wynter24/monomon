'use client';

import { useMobile } from '@/hooks/useMobile';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const isMobile = useMobile();

  if (isLanding || isMobile) return null;

  return (
    <footer className="bg-yellow w-full px-4 text-black">
      <div className="mx-auto max-w-4xl space-y-4 px-5 py-10">
        <p className="text-lg font-bold sm:text-xl">
          Find your Pokémon twin with Monomon
        </p>
        <p className="text-sm leading-relaxed sm:text-base">
          Upload your photo and discover your Pokémon look-alike! 💛
          <br className="sm:hidden" />
          Save, share, and enjoy the fun.
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-black/70 sm:text-sm">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="mailto:m.wynter24.k@gmail.com" className="hover:underline">
            Contact
          </a>
        </div>

        <p className="text-xs text-black/60">
          © {new Date().getFullYear()} Monomon. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
