import { api } from '@/lib/axiosInstance';

export async function matchPokemon(imageUrl: string | null) {
  if (!imageUrl) return;

  const formData = new FormData();
  formData.append('image_url', imageUrl);

  const res = await api.post('/match', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}
