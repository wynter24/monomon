import { supabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('image_results')
    .select('*')
    .eq('share_id', params.id)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ result: data?.result ?? null });
}
