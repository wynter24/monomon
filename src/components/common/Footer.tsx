'use client';

import { useMobile } from '@/hooks/useMobile';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const isMobile = useMobile();

  if (isLanding || isMobile) return null;

  return (
    <footer className="bg-yellow w-full px-4 text-black" aria-label="site info">
      <div className="mx-auto max-w-7xl space-y-4 px-5 py-10">
        <p className="text-lg font-semibold sm:text-xl">
          Find your Pokémon twin with Monomon
        </p>
        <p className="text-sm leading-relaxed sm:text-base">
          Upload your photo and discover your Pokémon look-alike! 💛
          <br className="sm:hidden" />
          Save, share, and enjoy the fun.
        </p>

        <ul className="flex flex-wrap gap-4 text-xs text-black/70 sm:text-sm">
          <li>
            <a
              href="#"
              className="hover:underline"
              aria-label="Terms of Service (서비스 이용약관)"
            >
              Terms of Service
            </a>
          </li>
          <li>
            <a
              href="#"
              className="hover:underline"
              aria-label="Privacy Policy (개인정보 처리방침)"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="mailto:m.wynter24.k@gmail.com"
              className="hover:underline"
              aria-label="Contact (이메일 문의)"
            >
              Contact
            </a>
          </li>
        </ul>

        <p className="text-xs text-black">
          © {new Date().getFullYear()} Monomon. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
