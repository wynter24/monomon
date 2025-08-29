import { saveUserHistory } from '@/apis/history.client';
import { matchPokemon } from '@/apis/matchPokemon';
import { savePokemonResult } from '@/apis/imageResults.client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getPokemonInfo } from '@/apis/getPokemonInfo';

export const useUploadMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      uploadedImgUrl,
      etag,
    }: {
      uploadedImgUrl: string;
      etag: string;
    }) => {
      const result = await matchPokemon(uploadedImgUrl); // 분석
      const { text, genus } = await getPokemonInfo(result.matched_pokemon_id);
      const pokemonInfo = {
        ...result,
        matched_pokemon_description: text,
        matched_pokemon_genus: genus,
      };
      const { id } = await savePokemonResult(etag, pokemonInfo); // 저장

      void saveUserHistory(etag, pokemonInfo, uploadedImgUrl).catch((e) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('saveUserHistory error:', e);
        }
      });

      return id;
    },
    onSuccess: (id) => {
      router.push(`/result/${id}`);
    },
    onError: () => {
      toast.error('Failed to find a match. Please try again.');
    },
  });
};
