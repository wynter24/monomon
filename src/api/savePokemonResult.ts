import { supabase } from '@/lib/supabaseClient';
import type { MatchResult } from '@/store/useMatchStore';

type PokemonResultRow = {
  id: string;
  result: MatchResult;
  image_hash: string;
  user_id: string | null;
  image_url: string | null;
};

export async function savePokemonResult(
  imageUrl: string,
  etag: string,
  matchResult: MatchResult,
) {
  const imageHash = etag;

  // 중복 체크
  const { data: existing, error: selectError } = await supabase
    .from('pokemon_results')
    .select('id, result')
    .eq('image_hash', imageHash)
    .maybeSingle<Pick<PokemonResultRow, 'id' | 'result'>>();

  if (selectError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('DB 조회 실패:', selectError.message);
    }
  }

  if (existing) {
    // console.log('✅ 이미 저장된 결과, insert 생략');
    return existing.result; // 기존 결과 그대로 반환
  }

  // 새로 insert
  const { error: insertError } = await supabase.from('pokemon_results').insert([
    {
      user_id: null,
      image_hash: imageHash,
      result: matchResult,
      // TODO: 로그인 기능 추가 후, 로그인 유저는 업로드한 이미지 함께 저장
      image_url: null, // 비로그인이라 저장 안 함
    },
  ]);

  // unique constraint 중복이면 무시
  if (insertError) {
    if (insertError.code === '23505') {
      // console.warn('이미 저장된 데이터(중복 insert 방지됨)');
      return matchResult;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('DB 저장 실패:', insertError.message);
      }
    }
  }

  // console.log('✅ 새 결과 저장 완료');
  return matchResult;
}
