'use client';

import { useRouter } from 'next/navigation';
import SkeletonImage from '../common/SkeletonImage';
import Button from '../common/Button';
import { toast } from 'sonner';
import { useResultQuery } from '@/hooks/useResultQuery';

type SharedResultClientProps = {
  id: string;
};

export default function SharedResultClient({ id }: SharedResultClientProps) {
  const { data: result, isLoading, isError } = useResultQuery(id);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 lg:text-lg">
        <p>Loading result...</p>
      </div>
    );
  }

  if (isError || !result) {
    toast.error('Failed to load. Please try again.');
    return <p>No results found.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-8 pt-16 pb-10">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex max-w-80 flex-col items-center gap-4">
          <SkeletonImage
            src={result.matched_pokemon_image}
            alt="matched_pokemon_image"
            width={400}
            height={400}
            sizes="100vw"
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
