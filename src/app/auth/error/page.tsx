'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getErrorMessage = (reason: string | null) => {
    switch (reason) {
      case 'missing_code':
        return 'Authentication code is missing.';
      case 'access_denied':
        return 'Login was cancelled.';
      default:
        return reason || 'An unknown error occurred.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="w-full max-w-md rounded-2xl border border-yellow-200 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">Login Failed</h1>

        <p className="mb-8 text-lg text-gray-600">{getErrorMessage(reason)}</p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="flex w-full transform items-center justify-center space-x-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:scale-105 hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex w-full items-center justify-center space-x-3 rounded-xl border-2 border-yellow-300 px-6 py-3 font-medium text-yellow-700 transition-all duration-200 hover:border-yellow-400 hover:bg-yellow-50 hover:shadow-md"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
