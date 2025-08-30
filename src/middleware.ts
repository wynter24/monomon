import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Next.js 미들웨어에서 request.cookies는 읽기 전용이므로 그대로 전달
          return request.cookies
            .getAll()
            .map(({ name, value }) => ({ name, value }));
        },
        setAll(cookies) {
          // Supabase가 세션 갱신 시 내려주는 쿠키들을 response에 세팅
          cookies.forEach(
            ({
              name,
              value,
              options,
            }: {
              name: string;
              value: string;
              options: CookieOptions;
            }) => {
              response.cookies.set(name, value, options);
            },
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPagePaths = ['/history'];
  const isProtectedPage = protectedPagePaths.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (isProtectedPage && !user) {
    const url = new URL('/', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
