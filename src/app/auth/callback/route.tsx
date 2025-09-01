import { supabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (!code) {
    console.error('Missing code. request.url =', request.url);
    return NextResponse.redirect(
      new URL('/auth/error?reason=missing_code', url.origin),
    );
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/error?reason=${encodeURIComponent(error.message)}`,
        url.origin,
      ),
    );
  }

  const safeNext = next.startsWith('/') ? next : '/';
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
