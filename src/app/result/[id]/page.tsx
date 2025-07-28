import { fetchResultFromSupabase } from '@/lib/supabaseClient';
import ResultClient from '@/components/result/ResultClient';

type Params = Promise<{ id: string }>;

// SNS 메타태그 자동 생성
export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const result = await fetchResultFromSupabase(id);

  if (!result) {
    return {
      title: '결과를 찾을 수 없습니다',
      description: '결과가 존재하지 않아요.',
    };
  }

  return {
    title: `나와 닮은 포켓몬은 ${result.matched_pokemon_name}!`,
    description: `유사도 ${(result.similarity_score * 100).toFixed(2)}%`,
    openGraph: {
      title: `나와 닮은 포켓몬은 ${result.matched_pokemon_name}!`,
      description: `유사도 ${(result.similarity_score * 100).toFixed(2)}%`,
      images: [
        {
          url: result.matched_pokemon_image,
          width: 600,
          height: 600,
        },
      ],
      url: `https://monomon.com/result/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `나와 닮은 포켓몬은 ${result.matched_pokemon_name}!`,
      description: `유사도 ${(result.similarity_score * 100).toFixed(2)}%`,
      images: [result.matched_pokemon_image],
    },
  };
}

export default async function ResultPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ResultClient id={id} />;
}
