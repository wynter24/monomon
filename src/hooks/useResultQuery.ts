'use client';
import { useQuery } from '@tanstack/react-query';
import type { MatchResult } from '@/types/pokemon';

async function fetchResultViaApi(id: string): Promise<MatchResult | null> {
  const res = await fetch(`/api/result/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result as MatchResult | null;
}

export const useResultQuery = (id: string) =>
  useQuery({
    queryKey: ['pokemon-result', id],
    queryFn: () => fetchResultViaApi(id),
    staleTime: 1000 * 60 * 5,
  });
