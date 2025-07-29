import { fetchResultFromSupabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

export function useResultQuery(id: string) {
  return useQuery({
    queryKey: ['pokemon-result', id],
    queryFn: () => fetchResultFromSupabase(id),
    staleTime: 1000 * 6 * 5, // 5min
  });
}
