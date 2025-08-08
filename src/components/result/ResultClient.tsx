'use client';

import { useRouter } from 'next/navigation';
import Button from '../common/Button';
import SkeletonImage from '../common/SkeletonImage';
import { toast } from 'sonner';
import { useResultQuery } from '@/hooks/useResultQuery';
import Loading from '../common/Loading';

type ResultClientProps = {
  id: string;
};

export default function ResultClient({ id }: ResultClientProps) {
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
      aria-label="result pokemon"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <figure className="flex max-w-80 flex-col items-center gap-4">
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
          <figcaption className="text-center">
            <h2 className="text-2xl font-semibold capitalize">
              {result?.matched_pokemon_name}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Similarity Score: {(result.similarity_score * 100).toFixed(2)}%
            </p>
          </figcaption>
        </figure>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <Button
            size={'lg'}
            text={'Share your result'}
            variants="active"
            onClick={() => {
              const shareUrl = `${window.location.origin}/result/${id}/share`;
              if (navigator.share) {
                navigator.share({
                  title: `My Pokémon look-alike is ${result.matched_pokemon_name}!`,
                  text: `I'm ${(result.similarity_score * 100).toFixed(2)}% similar to ${result.matched_pokemon_name}!`,
                  url: shareUrl,
                });
              } else {
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
              }
            }}
            aria-label={`Share your result with ${result.matched_pokemon_name}`}
          />
          <Button
            size={'lg'}
            text={'Try Again'}
            variants="active"
            onClick={() => {
              router.push('/upload');
            }}
            aria-label="Try the matching again"
          />
        </div>
      </div>
    </section>
  );
}
