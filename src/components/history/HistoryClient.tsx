'use client';
import { Json } from '@/types/supabase';
import { useMemo, useState } from 'react';
import type { HistoryParsedItem, MatchResult } from '@/types/pokemon';
import HistoryList from './HistoryList';
import EmptyHistory from './EmptyHistory';
import HistroyMainPanel from './HistoryMainPanel';
import CompareModal from './CompareModal';

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

  if (parsed.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <section
      className="mx-auto flex w-full max-w-4xl gap-6 px-4 pt-28 pb-12"
      aria-label="history pokedex layout"
    >
      <HistroyMainPanel selected={selected} setShowCompare={setShowCompare} />

      <HistoryList
        parsed={parsed}
        setSelectedIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
      />

      {showCompare && selected?.result && selected.imageUrl && (
        <CompareModal selected={selected} setShowCompare={setShowCompare} />
      )}
    </section>
  );
}
