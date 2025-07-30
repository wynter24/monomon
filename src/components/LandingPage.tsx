'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex min-h-screen max-w-md flex-col items-center justify-center gap-10">
        <Image
          src="/images/pikachu.png"
          alt="pikachu"
          width={300}
          height={300}
          priority={true}
        />
        <div className="flex flex-col gap-6">
          <h1 className="flex flex-col items-center text-4xl font-bold tracking-wide">
            <span>Welcome to</span>
            <span className="text-yellow">monomon!</span>
          </h1>
          <p className="text-gray-darker text-center text-lg">
            Discover which Pokémon character matches your face. Upload your
            photo and let the fun begin!
          </p>
        </div>

        <button
          className="animate-shine sm:hover:animate-shine w-full cursor-pointer rounded-2xl bg-gradient-to-r from-[#FACC15] via-[#FFEB3B] to-[#FACC15] bg-[length:200%_200%] bg-[position:0%_50%] px-24 py-4 text-xl text-black shadow-[0_4px_6px_rgba(0,0,0,0.1)] brightness-100 transition hover:shadow-[0_6px_8px_rgba(0,0,0,0.12)] sm:animate-none sm:hover:brightness-100"
          onClick={() => router.replace('/upload')}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
