'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, LogOut, History, BookOpen } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import LoginModal from './LoginModal';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { toast } from 'sonner';
import Portal from './Portal';

export default function Header({
  initialUser,
}: {
  initialUser: SupabaseUser | null;
}) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 1) 버튼 ref + 간단한 위치 상태
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  // 2) 메뉴가 열릴 때 한 번만 위치 계산
  useEffect(() => {
    if (!isUserMenuOpen || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const GAP = 8; // 버튼과 메뉴 사이
    setMenuStyle({
      position: 'fixed',
      top: r.bottom + GAP,
      left: r.right,
      transform: 'translateX(-100%)', // 오른쪽 끝 정렬 (bottom-end)
      zIndex: 9999,
      width: 192, // w-48
    });
  }, [isUserMenuOpen]);

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

  const userEmail = user?.email ?? 'User';

  const handleSignOut = async () => {
    try {
      const { error } = await supabaseBrowser.auth.signOut();
      if (error) throw error;

      setIsUserMenuOpen(false);
      setTimeout(() => {
        router.push('/');
      }, 2000);
      toast.success('You are logged out. See you again🖐️');
    } catch {
      toast.error('Failed to sign out');
    }
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
                <div className="relative sm:flex">
                  <div className="mr-4 hidden items-center space-x-4 sm:flex">
                    <Link
                      href="/upload"
                      className="flex items-center space-x-2 text-sm text-gray-700 transition-colors hover:text-gray-900 sm:text-base"
                      aria-label="Go to analysis history"
                    >
                      <span>Match</span>
                    </Link>
                  </div>
                  <button
                    ref={btnRef}
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
                    <Portal>
                      <div
                        className="fixed inset-0 z-50 bg-black/0"
                        onClick={() => setIsUserMenuOpen(false)}
                        aria-hidden="true"
                      />
                      <div
                        className="rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                        role="menu"
                        style={menuStyle}
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
                              <span>Analysis history</span>
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
                              <span>Pokédex</span>
                            </Link>
                          </li>

                          <li role="none">
                            <button
                              onClick={handleSignOut}
                              className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                              role="menuitem"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Sign out</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </Portal>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-yellow hover:bg-yellow-darker flex items-center space-x-2 rounded-lg px-4 py-2 font-medium text-black transition-colors"
                  aria-label="Open login modal"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Sign in</span>
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
