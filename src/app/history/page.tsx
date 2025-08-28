import { listUserHistorySSR } from '@/apis/history.sever';
import HistoryClient from '@/components/user/HistoryClient';
import { supabaseServer } from '@/lib/supabaseServer';

type Params = Promise<{ id: string }>;

export default async function HistoryPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;

  const { items } = await listUserHistorySSR();

  // const selectedId = id ?? items[0]?.id ?? null;
  // const { data: detail } = selectedId
  //   ? await supabase.from('user_results')
  //       .select('id, image_url, result, created_at')
  //       .eq('id', selectedId)
  //       .maybeSingle()
  //   : { data: null };
  console.log(id); // NOTE: 중간 저장을 위한 임시 출력
  return <HistoryClient initialList={items} />;
}
