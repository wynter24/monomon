'use client';
import { matchPokemon } from '@/api/matchPokemon';
import { useMatchStore } from '@/store/useMatchStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function LoadingPage() {
  const router = useRouter();
  const { uploadedImgUrl, setMatchResult } = useMatchStore();

  useEffect(() => {
    if (!uploadedImgUrl) {
      requestAnimationFrame(() => {
        toast.error('No photo uploaded. Please try again.');
        router.replace('/upload');
      });
      return;
    }

    const runMatch = async () => {
      try {
        const data = await matchPokemon(uploadedImgUrl); // 분석
        setMatchResult(data); // 전역에 저장
        router.replace('/result');
      } catch {
        toast.error('Failed to find a match. Please try again.');
        router.replace('/upload');
      }
    };

    runMatch();
  }, [uploadedImgUrl, router, setMatchResult]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <Image
          width={70}
          height={70}
          className="sm:h-20 sm:w-20"
          src={'/images/loading_icon.png'}
          alt="loading"
        />
        <div className="mt-4 flex space-x-3 sm:mt-5 md:mt-6">
          <div className="bg-yellow h-2 w-2 animate-bounce rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3"></div>
          <div
            className="bg-yellow h-2 w-2 animate-bounce rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="bg-yellow h-2 w-2 animate-bounce rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl">
        We’re finding your Pokémon twin
      </p>
    </div>
  );
}
