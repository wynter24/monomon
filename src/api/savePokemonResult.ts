import { supabase } from '@/lib/supabaseClient';
import { MatchResult } from '@/types/pokemon';

export async function savePokemonResult(
  // imageUrl: string,
  etag: string,
  matchResult: MatchResult,
) {
  const imageHash = etag;

  // 중복 체크
  const { data: existing, error: selectError } = await supabase
    .from('image_results')
    .select('share_id, result')
    .eq('image_hash', imageHash)
    .maybeSingle();

  if (selectError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('DB 조회 실패:', selectError.message);
    }
  }

  if (existing) {
    // console.log('✅ 이미 저장된 결과, insert 생략');
    return { result: existing.result, id: existing.share_id }; // 기존 결과 그대로 반환
  }

  // 새로 insert
  const { data: insertData, error: insertError } = await supabase
    .from('image_results')
    .insert([
      {
        image_hash: imageHash,
        result: matchResult,
        matched_id: matchResult.matched_pokemon_id,
      },
    ])
    .select('share_id')
    .maybeSingle();

  // unique constraint 중복이면 무시
  if (insertError?.code === '23505') {
    // console.warn('이미 저장된 데이터(중복 insert 방지됨)');
    return { result: matchResult, id: insertData?.share_id };
  } else if (insertError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('DB 저장 실패:', insertError.message);
    }
  }

  // console.log('✅ 새 결과 저장 완료');
  return { result: matchResult, id: insertData?.share_id };
}
