'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchResultFromSupabase } from '@/lib/supabaseClient';
import { MatchResult } from '@/types/pokemon';
import SkeletonImage from '../common/SkeletonImage';
import Button from '../common/Button';
import { toast } from 'sonner';

type SharedResultClientProps = {
  id: string;
};

export default function SharedResultClient({ id }: SharedResultClientProps) {
  const [result, setResult] = useState<MatchResult | null>(null);
  const router = useRouter();

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

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
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

        <div className="w-full max-w-xs">
          <Button
            size="lg"
            text="Find your Pokémon twin"
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
