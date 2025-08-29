import Image from 'next/image';
import Link from 'next/link';

export default function EmptyHistory() {
  return (
    <section
      className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 pt-28 pb-12"
      aria-label="empty history state"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 rounded-2xl bg-gray-100 p-5 shadow-sm">
          <div className="w-40 sm:w-56">
            <Image
              src="/images/pikachu.png"
              alt="no history yet"
              width={224}
              height={224}
              sizes="(max-width: 640px) 160px, 224px"
              className="h-auto w-full object-contain"
              priority={true}
            />
          </div>
        </div>
        <h2 className="text-xl font-semibold">No history yet</h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          Upload a Pokémon photo to see your matching results here.
        </p>
        <Link
          href="/upload"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-semibold text-white ring-1 ring-black/10 transition hover:bg-black/90"
        >
          Go to Upload
        </Link>
      </div>
    </section>
  );
}
