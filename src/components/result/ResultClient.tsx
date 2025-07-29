'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '../common/Button';
import SkeletonImage from '../common/SkeletonImage';
import { useState } from 'react';
import { fetchResultFromSupabase } from '@/lib/supabaseClient';
import { MatchResult } from '@/types/pokemon';
import { toast } from 'sonner';

type ResultClientProps = {
  id: string;
};

export default function ResultClient({ id }: ResultClientProps) {
  const [result, setResult] = useState<MatchResult | null>(null);
  const router = useRouter();

  // 서버에서 결과 조회
  useEffect(() => {
    const getResult = async () => {
      try {
        const response = await fetchResultFromSupabase(id);
        setResult(response);
      } catch {
        toast.error('Failed to load. Please try again.');
      }
    };
    getResult();
  }, [id]);

  if (!result) return <p>No results found.</p>;

  // const test = {
  //   similarity_score: 0.8951477862704721,
  //   matched_pokemon_id: 800,
  //   matched_pokemon_name: 'necrozma',
  //   matched_pokemon_image:
  //     'https://res.cloudinary.com/dfgfeq4up/image/upload/v1752768818/pokemon/800.png',
  // };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          {/* <Image
            src={uploadedImgUrl}
            alt="matched_pokemon_image"
            width={190}
            height={190}
          /> */}
          <SkeletonImage
            src={result.matched_pokemon_image}
            alt="matched_pokemon_image"
            width={400}
            height={400}
            className="min-h-[190px] min-w-[190px]"
            priority={true}
            loadingText="Loading Pokémon..."
          />
          <div className="text-center">
            <h2 className="text-2xl font-semibold capitalize">
              {result?.matched_pokemon_name}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Similarity Score: {(result.similarity_score * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <Button
            size={'lg'}
            text={'Share your result'}
            variants="active"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `My Pokémon look-alike is ${result.matched_pokemon_name}!`,
                  text: `I'm ${(result.similarity_score * 100).toFixed(2)}% similar to ${result.matched_pokemon_name}!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
          />
          <Button
            size={'lg'}
            text={'Try Again'}
            variants="active"
            onClick={() => {
              router.push('/upload');
            }}
          />
        </div>
      </div>
    </div>
  );
}
