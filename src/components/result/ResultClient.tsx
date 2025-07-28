'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Button from '../common/Button';
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

  if (!result) return <p>결과가 없습니다.</p>;

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
          <Image
            src={result.matched_pokemon_image}
            alt="matched_pokemon_image"
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto min-h-[190px] w-full min-w-[190px] rounded-md"
          />
          <div className="text-center">
            <h2 className="text-2xl font-semibold capitalize">
              {result?.matched_pokemon_name}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              유사도 점수: {(result.similarity_score * 100).toFixed(2)}%
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
                  title: `나와 닮은 포켓몬은 ${result.matched_pokemon_name}!`,
                  text: `나는 ${result.matched_pokemon_name}과 ${(result.similarity_score * 100).toFixed(2)}% 닮았어요!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('링크가 복사되었습니다!');
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
