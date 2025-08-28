import { saveUserHistory } from '@/apis/history.client';
import { matchPokemon } from '@/apis/matchPokemon';
import { savePokemonResult } from '@/apis/savePokemonResult';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
      const { id } = await savePokemonResult(etag, result); // 저장

      void saveUserHistory(etag, result, uploadedImgUrl).catch((e) => {
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
