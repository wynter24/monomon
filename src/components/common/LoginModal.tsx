'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Chrome } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = async (provider: 'google') => {
    try {
      setIsLoading(true);
      const next =
        new URL(window.location.href).searchParams.get('next') ?? '/';
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      // 여기서 페이지 이동은 Supabase가 처리함(구글 → 콜백)
    } catch {
      alert('Login failed. Please try again later.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="animate-in fade-in-0 zoom-in-95 relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl duration-200">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/images/pikachu.png"
              alt="Pikachu"
              width={60}
              height={60}
              priority
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Sign in to Monomon
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to save analysis results and view your Pokédex.
          </p>
        </div>

        {/* OAuth 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="flex w-full items-center justify-center space-x-3 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Chrome className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>

          {/* <button
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading}
            className="flex w-full items-center justify-center space-x-3 rounded-xl bg-gray-900 px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Github className="h-5 w-5" />
            <span>Continue with GitHub</span>
          </button> */}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            You can use the basic analysis service without signing in.
          </p>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-b-2 border-yellow-600"></div>
            <p className="mt-2 text-sm text-gray-600">Signing in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
