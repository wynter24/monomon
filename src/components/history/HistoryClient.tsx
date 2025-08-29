'use client';
import { Json } from '@/types/supabase';
import SkeletonImage from '@/components/common/SkeletonImage';
import Portal from '@/components/common/Portal';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { HistoryParsedItem, MatchResult } from '@/types/pokemon';
import HistoryList from './HistoryList';

export type HistoryClientProps = {
  initialList: {
    id: string;
    image_url: string | null;
    result: Json;
    created_at: string | null;
  }[];
};

function parseItem(
  item: HistoryClientProps['initialList'][number],
): HistoryParsedItem {
  const result = item.result as unknown as Partial<MatchResult> | null;
  const safe: MatchResult | null =
    result &&
    typeof result.matched_pokemon_id === 'number' &&
    typeof result.matched_pokemon_name === 'string' &&
    typeof result.matched_pokemon_image === 'string' &&
    typeof result.matched_pokemon_description === 'string' &&
    typeof result.matched_pokemon_genus === 'string' &&
    typeof result.similarity_score === 'number'
      ? (result as MatchResult)
      : null;

  return {
    id: item.id,
    imageUrl: item.image_url,
    createdAt: item.created_at,
    result: safe,
  };
}

export default function HistoryClient({ initialList }: HistoryClientProps) {
  const parsed = useMemo(() => initialList.map(parseItem), [initialList]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCompare, setShowCompare] = useState(false);

  const selected = parsed[selectedIndex] ?? null;

  console.log(initialList);

  // Empty state UI when there is no history
  if (parsed.length === 0) {
    return (
      <section
        className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 pt-28 pb-12"
        aria-label="empty history state"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 rounded-2xl bg-gray-100 p-5 shadow-sm">
            <div className="w-40 sm:w-56">
              <Image
                src="/images/pikachu.png"
                alt="no history yet"
                width={224}
                height={224}
                sizes="(max-width: 640px) 160px, 224px"
                className="h-auto w-full object-contain"
                priority={true}
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold">No history yet</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Upload a Pokémon photo to see your matching results here.
          </p>
          <Link
            href="/upload"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-semibold text-white ring-1 ring-black/10 transition hover:bg-black/90"
          >
            Go to Upload
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto flex w-full max-w-4xl gap-6 px-4 pt-28 pb-12"
      aria-label="history pokedex layout"
    >
      {/* Left: Pokedex main panel */}
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

      <HistoryList
        parsed={parsed}
        setSelectedIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
      />

      {/* Compare Modal */}
      {showCompare && selected?.result && selected.imageUrl && (
        <Portal>
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Compare</h3>
                <button
                  type="button"
                  onClick={() => setShowCompare(false)}
                  className="cursor-pointer rounded-md bg-black px-3 py-1 text-sm text-white"
                  aria-label="Close compare"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-100 p-3">
                  <div className="mb-2 text-center text-sm font-medium">
                    Matched
                  </div>
                  <div className="overflow-hidden rounded-md bg-black p-2">
                    <Image
                      src={selected.result.matched_pokemon_image}
                      alt="matched"
                      width={560}
                      height={560}
                      sizes="(max-width: 768px) 100vw, 560px"
                      className="h-auto w-full object-contain"
                      quality={90}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-gray-100 p-3">
                  <div className="mb-2 text-center text-sm font-medium">
                    Original
                  </div>
                  <div className="overflow-hidden rounded-md bg-black p-2">
                    <Image
                      src={selected.imageUrl}
                      alt="original"
                      width={560}
                      height={560}
                      sizes="(max-width: 768px) 100vw, 560px"
                      className="h-auto w-full object-contain"
                      quality={90}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </section>
  );
}
