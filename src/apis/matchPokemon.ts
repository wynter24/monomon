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
    // 1차 시도
    const res = await request(45000);
    return res.data;
  } catch (error) {
    // 1차 타임아웃 → 재시도
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      // 재시도 성공/실패를 구분해 /log로 보내고 싶다면 이 자리에서 처리
      try {
        const res = await request(120000);
        // 재시도 성공이면 보완 이벤트: client_timeout_recovered
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            route: '/match',
            event: 'client_timeout_recovered',
          }),
        });
        return res.data;
      } catch (e2) {
        // 재시도도 실패 → client_timeout_failed (인터셉터에서도 처리되지만 안전망)
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            route: '/match',
            event: 'client_timeout_failed',
            detail: { msg: (e2 as any)?.message },
          }),
        });
        throw e2;
      }
    }
    // 기타 오류는 인터셉터에서 client_network_error로 처리됨
    throw error;
  }
}
