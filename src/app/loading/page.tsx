'use client';
import { matchPokemon } from '@/api/matchPokemon';
import { useMatchStore } from '@/store/useMatchStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoadingPage() {
  const router = useRouter();
  const { uploadedImgUrl, setMatchResult } = useMatchStore();

  useEffect(() => {
    if (!uploadedImgUrl) {
      // TODO: 에러메시지 표시 + 다시 시도 버튼
      router.replace('/upload');
      return;
    }

    const runMatch = async () => {
      try {
        const data = await matchPokemon(uploadedImgUrl); // 분석
        setMatchResult(data); // 전역에 저장
        router.replace('/result');
      } catch (error) {
        // TODO: ERROR 메시지 추가
        console.error('매칭 실패:', error);
        router.replace('/upload');
      }
    };

    runMatch();
  }, [uploadedImgUrl]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p className="text-xl font-semibold">분석 중입니다... ⏳</p>
      {/* TODO: 로딩 이미지 추가 */}
    </div>
  );
}
