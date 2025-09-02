import { api } from '@/lib/axiosInstance';
import axios from 'axios';

export async function matchPokemon(imageUrl: string | null) {
  if (!imageUrl) return;

  const formData = new FormData();
  formData.append('image_url', imageUrl);

  const request = (timeoutMs: number) =>
    api.post('/match', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: timeoutMs,
    });

  try {
    const res = await request(45000);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      const res = await request(120000);
      return res.data;
    }
    throw error;
  }
}
