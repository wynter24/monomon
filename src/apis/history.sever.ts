import { supabaseServer } from '@/lib/supabaseServer';

export async function listUserHistorySSR(limit = 20) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], nextCursor: null };

  const { data } = await supabase
    .from('user_results')
    .select('id, image_url, result, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  const items = data ?? [];
  const nextCursor = items.length ? items[items.length - 1].created_at : null;
  return { items, nextCursor };
}
