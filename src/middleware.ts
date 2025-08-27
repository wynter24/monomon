// import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       get(name: string) {
  //         return request.cookies.get(name)?.value;
  //       },
  //       set(name: string, value: string, options: CookieOptions) {
  //         request.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         });
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         });
  //         response.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         });
  //       },
  //       remove(name: string, options: CookieOptions) {
  //         request.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         });
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         });
  //         response.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         });
  //       },
  //     },
  //   },
  // );

  // TODO: 기능 추가 후 사용
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // const protectedPagePaths = ['/history', '/pokedex']; // 페이지 경로
  // const isProtectedPage = protectedPagePaths.some((p) =>
  //   request.nextUrl.pathname.startsWith(p),
  // );

  // if (isProtectedPage && !user) {
  //   const url = new URL('/login', request.url);
  //   url.searchParams.set('next', request.nextUrl.pathname);
  //   return NextResponse.redirect(url);
  // }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
