import Image from 'next/image';
import SkeletonImage from '../common/SkeletonImage';
import { HistoryParsedItem } from '@/types/pokemon';
import { Dispatch, SetStateAction } from 'react';

type HistroyMainPanelProps = {
  selected: HistoryParsedItem;
  setShowCompare: Dispatch<SetStateAction<boolean>>;
};

export default function HistroyMainPanel({
  selected,
  setShowCompare,
}: HistroyMainPanelProps) {
  return (
    <div className="relative flex-1 rounded-2xl bg-red-600 p-5 text-white shadow-xl ring-1 ring-red-700/40">
      {/* Pokedex top indicators */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-blue-400 ring-2 ring-blue-200" />
        <div className="h-2 w-2 rounded-full bg-green-300" />
        <div className="h-2 w-2 rounded-full bg-yellow-300" />
      </div>

      {/* Main screen */}
      <div className="rounded-2xl bg-red-700/40 p-4 shadow-inner">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-gray-100 p-4">
          <div className="rounded-lg bg-black p-3 text-center">
            {selected?.result?.matched_pokemon_image ? (
              <SkeletonImage
                src={selected.result.matched_pokemon_image}
                alt="matched pokemon"
                width={280}
                height={280}
                sizes="(max-width: 768px) 100vw, 280px"
                className="mx-auto min-h-[140px] min-w-[140px]"
                priority={true}
                loadingText="Loading Pokémon..."
              />
            ) : (
              <div className="py-12 text-sm text-gray-400">No selection</div>
            )}
          </div>
        </div>

        {/* Info panel: genus + similarity */}
        <div className="mt-4 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 p-3 text-center shadow-inner">
          <div className="flex items-center justify-between gap-6">
            {/* Genus info */}
            <div className="flex-1">
              <div className="text-xs font-medium tracking-wide text-emerald-100">
                GENUS
              </div>
              <div className="text-sm font-semibold text-white">
                {selected?.result?.matched_pokemon_genus || 'Unknown'}
              </div>
            </div>

            {/* Similarity score */}
            {selected?.result && (
              <div className="flex-1">
                <div className="text-xs font-medium tracking-wide text-emerald-100">
                  SIMILARITY
                </div>
                <div className="text-sm font-semibold text-white">
                  {(selected.result.similarity_score * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Black info panel */}
        <div className="mt-4 rounded-lg bg-black p-3 text-center">
          <div className="text-xs tracking-widest text-gray-300">
            NO.{selected?.result?.matched_pokemon_id ?? '--'}
          </div>
          <div className="mt-1 text-lg font-semibold capitalize">
            {selected?.result?.matched_pokemon_name ?? 'Unknown'}
          </div>
          <div className="mt-2 text-sm text-gray-200">
            {selected?.result?.matched_pokemon_description}
          </div>
        </div>

        {/* Controls row: thumbnail (left) + compare button (right) */}
        <div className="mt-4 flex items-center justify-between">
          {/* Thumbnail (left) */}
          {selected?.imageUrl ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-black/70 ring-1 ring-white/20">
              <Image
                src={selected.imageUrl}
                alt="uploaded original"
                width={48}
                height={48}
                sizes="48px"
                className="h-full w-full object-cover"
                quality={85}
              />
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
            </div>
          ) : (
            <div />
          )}

          {/* Compare button (right) */}
          {selected?.imageUrl && (
            <button
              type="button"
              onClick={() => setShowCompare(true)}
              className="h-10 cursor-pointer rounded-md bg-black px-4 text-white ring-1 ring-white/15 transition hover:bg-black/90"
              aria-label="Open compare modal"
            >
              <span className="text-sm font-semibold tracking-wide">
                COMPARE
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
