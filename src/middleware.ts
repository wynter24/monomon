import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const requestId = crypto.randomUUID();
  requestHeaders.set('x-request-id', requestId);

  // 클라 디버그용
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId); // 로그/추적용 ID

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

  const hasSession =
    request.cookies.has('sb-access-token') ||
    request.cookies.has('sb-refresh-token');

  let user = null;
  if (hasSession) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

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
