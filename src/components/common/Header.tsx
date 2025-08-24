'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User as UserIcon, LogOut, History, BookOpen } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import LoginModal from './LoginModal';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function Header({
  initialUser,
}: {
  initialUser: SupabaseUser | null;
}) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser;

    // 최신 세션 재확인(선택)
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id !== user?.id) setUser(data.user ?? null);
    });

    // 로그인/로그아웃/토큰갱신 반영
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line

  const userEmail = user?.email ?? '사용자';

  const handleSignOut = async () => {
    // TODO: 로그아웃 로직 구현
    console.log('로그아웃');
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const handleHistory = () => {
    setIsUserMenuOpen(false);
  };

  const handlePokedex = () => {
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm"
        role="banner"
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between">
            {/* 로고 */}
            <Link
              href="/"
              className="flex cursor-pointer items-center"
              aria-label="Go to homepage"
            >
              <span className="text-yellow text-2xl font-bold">monomon</span>
            </Link>

            {/* 로그인/사용자 메뉴 */}
            <div className="flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rounded-full p-2 transition-colors hover:bg-gray-100"
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="bg-yellow flex h-8 w-8 items-center justify-center rounded-full">
                      <UserIcon className="h-5 w-5 text-black" />
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="border-b border-gray-100 px-4 py-2">
                        <p
                          className="text-sm font-medium text-gray-900"
                          id="user-menu-button"
                        >
                          {userEmail}
                        </p>
                      </div>

                      <ul role="none">
                        <li role="none">
                          <Link
                            href="/history"
                            onClick={handleHistory}
                            className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                          >
                            <History className="h-4 w-4" />
                            <span>분석 히스토리</span>
                          </Link>
                        </li>

                        <li role="none">
                          <Link
                            href="/pokedex"
                            onClick={handlePokedex}
                            className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>포켓몬 도감</span>
                          </Link>
                        </li>

                        <li role="none">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                            role="menuitem"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>로그아웃</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-yellow hover:bg-yellow-darker flex items-center space-x-2 rounded-lg px-4 py-2 font-medium text-black transition-colors"
                  aria-label="Open login modal"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>로그인</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
