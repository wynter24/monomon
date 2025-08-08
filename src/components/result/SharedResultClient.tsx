'use client';

import { useRouter } from 'next/navigation';
import SkeletonImage from '../common/SkeletonImage';
import Button from '../common/Button';
import { toast } from 'sonner';
import { useResultQuery } from '@/hooks/useResultQuery';
import Loading from '../common/Loading';

type SharedResultClientProps = {
  id: string;
};

export default function SharedResultClient({ id }: SharedResultClientProps) {
  const { data: result, isLoading, isError } = useResultQuery(id);
  const router = useRouter();

  if (isLoading) {
    return <Loading text="Loading result" />;
  }

  if (isError || !result) {
    toast.error('Failed to load. Please try again.');
    return (
      <div role="status" aria-live="polite" className="py-10 text-center">
        <p className="text-sm text-gray-500">No results found.</p>
      </div>
    );
  }

  return (
    <section
      className="flex flex-col items-center py-28 sm:py-20"
      aria-label="shared pokemon result"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex max-w-80 flex-col items-center gap-4">
          <SkeletonImage
            src={result.matched_pokemon_image}
            alt={`Matched Pokémon: ${result.matched_pokemon_name}`}
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
            aria-label="Find your own Pokémon look-alike"
          />
        </div>
      </div>
    </section>
  );
}
