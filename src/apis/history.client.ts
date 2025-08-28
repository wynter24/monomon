import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { MatchResult } from '@/types/pokemon';

export async function saveUserHistory(
  etag: string,
  matchResult: MatchResult,
  imageUrl: string,
) {
  const supabase = supabaseBrowser;
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData.user) return;

  // (user_id, image_hash) 기준 upsert → 중복 저장 방지
  const { error } = await supabase.from('user_results').upsert(
    {
      user_id: authData.user.id,
      image_hash: etag,
      result: matchResult,
      image_url: imageUrl ?? null,
    },
    { onConflict: 'user_id, image_hash', ignoreDuplicates: true },
  );

  if (error) {
    throw error;
  }
}

export async function deleteHistory(id: string) {
  const { error } = await supabaseBrowser
    .from('user_results')
    .delete()
    .eq('id', id);

  if (error && process.env.NODE_ENV === 'development') {
    console.error('user_results delete failed:', error.message ?? error);
  }
}
