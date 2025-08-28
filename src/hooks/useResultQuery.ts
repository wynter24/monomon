'use client';
import { useQuery } from '@tanstack/react-query';
import { getImageResultClient } from '@/apis/imageResults.client';

export const useResultQuery = (id: string) =>
  useQuery({
    queryKey: ['pokemon-result', id],
    queryFn: () => getImageResultClient(id),
    staleTime: 1000 * 60 * 5,
  });
