import { supabase } from '@/lib/supabaseClient';
import { MatchResult } from '@/types/pokemon';

export async function savePokemonResult(
  // imageUrl: string,
  etag: string,
  matchResult: MatchResult,
) {
  const { data, error } = await supabase
    .from('image_results')
    .upsert(
      {
        image_hash: etag,
        result: matchResult,
        matched_id: matchResult.matched_pokemon_id,
      },
      { onConflict: 'image_hash', ignoreDuplicates: true }, // == INSERT ... ON CONFLICT DO NOTHING
    )
    .select('share_id')
    .maybeSingle();

  if (error && process.env.NODE_ENV === 'development') {
    console.error('image_results upsert failed:', error.message ?? error);
  }

  // 충돌로 data가 비면 한 번 조회
  if (!data?.share_id) {
    const { data: existing, error: fetchErr } = await supabase
      .from('image_results')
      .select('share_id, result')
      .eq('image_hash', etag)
      .maybeSingle();

    if (fetchErr && process.env.NODE_ENV === 'development') {
      console.error(
        'image_results fetch failed:',
        fetchErr.message ?? fetchErr,
      );
    }

    return {
      result: existing?.result ?? matchResult,
      id: existing?.share_id ?? null,
    };
  }

  return { result: matchResult, id: data.share_id };
}
