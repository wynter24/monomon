'use client';

import { useEffect } from 'react';

function isInAppBrowser(userAgent: string): boolean {
  const upper = (userAgent || '').toUpperCase();
  return (
    upper.includes('KAKAOTALK') ||
    upper.includes('FB_IAB') ||
    upper.includes('FBAN') ||
    upper.includes('FBAV') ||
    upper.includes('INSTAGRAM') ||
    upper.includes('NAVER') ||
    upper.includes('DAUMAPPS') ||
    upper.includes('LINE/')
  );
}

function tryOpenExternalBrowser(): void {
  const href = window.location.href;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    const withoutScheme = href.replace(/^https?:\/\//, '');
    const intent = `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intent;
    return;
  }

  if (isIOS) {
    const scheme = href.startsWith('https:')
      ? 'googlechromes://'
      : 'googlechrome://';
    const chromeUrl = scheme + href.replace(/^https?:\/\//, '');
    window.location.href = chromeUrl;
    return;
  }

  window.open(href, '_blank');
}

export default function InAppRedirect() {
  useEffect(() => {
    const ua =
      navigator.userAgent ||
      (navigator as any).vendor ||
      (window as any).opera ||
      '';
    if (isInAppBrowser(ua)) {
      alert(
        'Google 로그인이 인앱 브라우저에서 차단되었습니다. 외부 브라우저로 열겠습니다. 실패 시 기본 브라우저로 직접 열어주세요.',
      );
      tryOpenExternalBrowser();
      // NOTE: 필요 시 전용 안내 페이지로 이동
      // window.location.replace('/open-in-browser');
    }
  }, []);

  return null;
}
