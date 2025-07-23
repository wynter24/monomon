import { matchPokemon } from '@/api/matchPokemon';
import { useMatchStore } from '@/store/useMatchStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoadingPage() {
  const router = useRouter();
  const { imgUrl, setMatchResult } = useMatchStore();

  useEffect(() => {
    const runMatch = async () => {
      try {
        const data = await matchPokemon(imgUrl);
        setMatchResult(data);
        router.replace('/result');
      } catch (error) {
        console.error('매칭 실패:', error);
        router.replace('/upload');
      }
    };

    runMatch();
  }, [imgUrl]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p className="text-xl font-semibold">분석 중입니다... ⏳</p>
      {/* TODO: 로딩 이미지 추가 */}
    </div>
  );
}
