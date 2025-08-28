'use client';
import { Json } from '@/types/supabase';
import SkeletonImage from '@/components/common/SkeletonImage';
import Portal from '@/components/common/Portal';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { MatchResult } from '@/types/pokemon';

type HistoryClientProps = {
  initialList: {
    id: string;
    image_url: string | null;
    result: Json;
    created_at: string | null;
  }[];
};

type ParsedItem = {
  id: string;
  imageUrl: string | null;
  createdAt: string | null;
  result: MatchResult | null;
};

function parseItem(
  item: HistoryClientProps['initialList'][number],
): ParsedItem {
  const result = item.result as unknown as Partial<MatchResult> | null;
  const safe: MatchResult | null =
    result &&
    typeof result.matched_pokemon_id === 'number' &&
    typeof result.matched_pokemon_name === 'string' &&
    typeof result.matched_pokemon_image === 'string' &&
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
  const [page, setPage] = useState(1);
  const [showCompare, setShowCompare] = useState(false);
  const pageSize = 6;

  const totalPages = Math.max(1, Math.ceil(parsed.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageItems = parsed.slice(pageStart, pageStart + pageSize);

  const selected = parsed[selectedIndex] ?? null;

  const goPrevPage = () => setPage((p) => (p > 1 ? p - 1 : p));
  const goNextPage = () => setPage((p) => (p < totalPages ? p + 1 : p));

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
                  width={380}
                  height={380}
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="mx-auto min-h-[180px] min-w-[180px]"
                  priority={true}
                  loadingText="Loading Pokémon..."
                />
              ) : (
                <div className="py-16 text-sm text-gray-400">No selection</div>
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
              Your Pokémon twin is identified.
            </div>
          </div>

          {/* Controls row: blue chip + original thumbnail + compare button (pokedex-like) */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {/* Blue chip: similarity */}
            {selected?.result && (
              <div className="flex-shrink-0">
                <div className="inline-flex min-w-[200px] items-center justify-center rounded-lg bg-gradient-to-b from-blue-400 to-blue-600 px-4 py-2 text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.35)] ring-2 ring-blue-700/50">
                  <span className="text-sm font-extrabold tracking-wide">
                    SIMILARITY
                  </span>
                  <span className="ml-2 rounded-md bg-white/20 px-2 py-0.5 text-sm font-bold">
                    {(selected.result.similarity_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Original image thumbnail + compare trigger */}
            {selected?.imageUrl && (
              <div className="flex items-center gap-3">
                {/* circular lens-like thumbnail */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-black/70 ring-2 ring-white/40">
                  <Image
                    src={selected.imageUrl}
                    alt="uploaded original"
                    width={56}
                    height={56}
                    sizes="56px"
                    className="h-full w-full object-cover"
                    quality={85}
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
                </div>

                {/* Pokedex-style compare button with subtle animation */}
                <button
                  type="button"
                  onClick={() => setShowCompare(true)}
                  className="group relative h-10 cursor-pointer rounded-lg bg-black px-4 text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10 transition-transform duration-200 hover:translate-y-[1px] hover:bg-black/90 active:translate-y-[2px]"
                  aria-label="Open compare modal"
                >
                  <span className="text-sm font-semibold tracking-wide">
                    COMPARE
                  </span>
                  <span
                    aria-hidden
                    className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-yellow-400 ring-2 ring-yellow-200"
                  />
                  <span
                    aria-hidden
                    className="absolute -right-2 bottom-1 h-2 w-2 rounded-full bg-red-400 opacity-80 transition-opacity group-hover:opacity-100"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: History list with pagination */}
      <aside className="flex w-full max-w-sm flex-col justify-between rounded-2xl bg-red-600 p-5 text-white shadow-xl ring-1 ring-red-700/40">
        <div>
          <div className="mb-4 text-center text-sm text-gray-100">History</div>
          <ul className="grid grid-cols-1 gap-3">
            {pageItems.map((item, idx) => {
              const absoluteIndex = pageStart + idx;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(absoluteIndex)}
                    className={`flex w-full items-center gap-3 rounded-lg bg-red-700/40 p-3 text-left ring-1 ring-red-800/40 transition hover:bg-red-700/60 ${
                      absoluteIndex === selectedIndex
                        ? 'outline outline-yellow-300'
                        : ''
                    }`}
                    aria-current={absoluteIndex === selectedIndex}
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-black">
                      {item.result?.matched_pokemon_image && (
                        <img
                          src={item.result.matched_pokemon_image}
                          alt="thumb"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold capitalize">
                        {item.result?.matched_pokemon_name ?? 'Unknown'}
                      </span>
                      <span className="truncate text-xs text-gray-200">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ''}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pagination controls (Pokedex style) */}
        <div className="my-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevPage}
            className="h-10 w-16 rounded-md bg-black text-white shadow-inner ring-1 ring-white/10 transition hover:bg-black/90"
            aria-label="Previous page"
          >
            ◀
          </button>
          <div className="rounded-md bg-black/70 px-3 py-1 text-sm text-gray-100">
            {page} / {totalPages}
          </div>
          <button
            type="button"
            onClick={goNextPage}
            className="h-10 w-16 rounded-md bg-black text-white shadow-inner ring-1 ring-white/10 transition hover:bg-black/90"
            aria-label="Next page"
          >
            ▶
          </button>
        </div>
      </aside>
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
