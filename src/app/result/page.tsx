'use client';
import Image from 'next/image';
import { useMatchStore } from '@/store/useMatchStore';
import { useEffect, useRef } from 'react';
import { savePokemonResult } from '@/api/savePokemonResult';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

export default function ResultPage() {
  const { uploadedImgUrl, etag, result } = useMatchStore();
  const router = useRouter();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const saveAndClear = async () => {
      if (!uploadedImgUrl || !etag || !result) {
        router.replace('/upload');
        return;
      }

      await savePokemonResult(uploadedImgUrl, etag, result); // supabase에 저장
    };
    saveAndClear();
  }, []);

  if (!result || !uploadedImgUrl) return <p>결과가 없습니다.</p>;

  return (
    <>
      <div className="flex flex-col gap-2 py-2">
        <Image
          src={uploadedImgUrl}
          alt="matched_pokemon_image"
          width={190}
          height={190}
        />
        <Image
          src={result.matched_pokemon_image}
          alt="matched_pokemon_image"
          width={190}
          height={190}
        />
        <h2>{result?.matched_pokemon_name}</h2>
        <p>유사도 점수: {(result.similarity_score * 100).toFixed(2)}%</p>
      </div>
      <Button
        size={'lg'}
        text={'Try Again'}
        variants="active"
        onClick={() => {
          router.replace('upload');
        }}
      />
    </>
  );
}
