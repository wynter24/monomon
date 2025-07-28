import { MatchResult } from '@/types/pokemon';
import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function fetchResultFromSupabase(
  id: string,
): Promise<MatchResult | null> {
  const { data, error } = await supabase
    .from('pokemon_results')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('❌ Supabase 조회 실패:', error.message);
    return null;
  }
  return data?.result as MatchResult;
}
