import { getImageResultByShareId } from '@/apis/imageResults.server';
import ResultClient from '@/components/result/ResultClient';

type Params = Promise<{ id: string }>;

// SNS 메타태그 자동 생성
export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getImageResultByShareId(id);
  if (!result) {
    return {
      title: 'No Result Available',
      description: "Sorry, we couldn't find the result you're looking for.",
    };
  }

  return {
    title: `My Pokémon look-alike is ${result.matched_pokemon_name}!`,
    description: `Similarity Score ${(result.similarity_score * 100).toFixed(2)}%`,
    openGraph: {
      title: `My Pokémon look-alike is ${result.matched_pokemon_name}!`,
      description: `Similarity Score ${(result.similarity_score * 100).toFixed(2)}%`,
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
      title: `My Pokémon look-alike is ${result.matched_pokemon_name}!`,
      description: `Similarity Score ${(result.similarity_score * 100).toFixed(2)}%`,
      images: [result.matched_pokemon_image],
    },
  };
}

export default async function ResultPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ResultClient id={id} />;
}
