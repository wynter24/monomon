import { matchPokemon } from '@/api/matchPokemon';
import { savePokemonResult } from '@/api/savePokemonResult';
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
      const data = await matchPokemon(uploadedImgUrl); // 분석
      const { id } = await savePokemonResult(etag, data); // 저장
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
