import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { MatchResult } from '@/types/pokemon';

export async function savePokemonResult(
  etag: string,
  matchResult: MatchResult,
) {
  const { error } = await supabaseBrowser.from('image_results').upsert(
    {
      image_hash: etag,
      result: matchResult,
      matched_id: matchResult.matched_pokemon_id,
    },
    {
      onConflict: 'image_hash',
      ignoreDuplicates: true,
    },
  );
  if (error && process.env.NODE_ENV === 'development') {
    console.error('image_results upsert failed:', error.message ?? error);
  }

  // 본문을 받지 않으므로 항상 조회하여 share_id/결과 조회
  {
    const { data: existing, error: fetchErr } = await supabaseBrowser
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
}

export async function getImageResultClient(
  shareId: string,
): Promise<MatchResult | null> {
  const { data, error } = await supabaseBrowser
    .from('image_results')
    .select('result')
    .eq('share_id', shareId)
    .maybeSingle();

  if (error) throw error;
  return (data?.result ?? null) as MatchResult | null;
}
