'use client';

import { useRouter } from 'next/navigation';
import Button from '../common/Button';
import SkeletonImage from '../common/SkeletonImage';
import { toast } from 'sonner';
import { useResultQuery } from '@/hooks/useResultQuery';

type ResultClientProps = {
  id: string;
};

export default function ResultClient({ id }: ResultClientProps) {
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
