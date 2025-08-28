'use client';
import { Json } from '@/types/supabase';
// import { useRouter, useSearchParams } from 'next/navigation';

type HistoryClientProps = {
  initialList: {
    id: string;
    image_url: string | null;
    result: Json;
    created_at: string | null;
  }[];
};

export default function HistoryClient({ initialList }: HistoryClientProps) {
  // const router = useRouter();
  // const params = useSearchParams();
  // const selectedId = params.get('id') ?? initialDetail?.id ?? null;

  // const onSelect = (id: string) => {
  //   // 주소만 바꾸고 상태 유지 (뒤로가기/새로고침 복구)
  //   router.replace(`/history?id=${id}`);
  // };

  console.log(initialList);

  // 우측: 목록(onClick → onSelect)
  // 좌측: selectedId의 상세(필요 시 CSR로 재조회)
  return null;
}
