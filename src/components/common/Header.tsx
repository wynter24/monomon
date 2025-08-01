import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full px-4">
      <nav className="mx-auto flex max-w-4xl items-center justify-between p-4 sm:py-6">
        <Link
          href={'/upload'}
          className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24"
        >
          <Image
            src="/images/logo.png"
            alt="logo"
            fill
            className="object-contain"
            priority
          />
        </Link>

        <ul>
          <li>
            <Link
              href={'/upload'}
              className="text-ms md:2xl font-medium sm:text-xl"
            >
              Home
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
