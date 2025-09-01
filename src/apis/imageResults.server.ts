import { supabaseServer } from '@/lib/supabaseServer';
import { MatchResult } from '@/types/pokemon';

export async function getImageResultByShareId(shareId: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('image_results')
    .select('*')
    .eq('share_id', shareId)
    .returns<{ result: MatchResult }[]>() // TODO: zod로 검증
    .maybeSingle();
  if (error) throw error;
  return data?.result ?? null;
}
