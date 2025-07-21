'use client';
import { useEffect } from 'react';

interface Props {
  /** 업로드 후 public_id를 부모로 전달 */
  onUploadSuccess?: (result: CloudinaryUploadResult) => void;
}

export default function CloudinaryCustomUpload({ onUploadSuccess }: Props) {
  useEffect(() => {
    // Cloudinary 위젯 스크립트가 없으면 로드
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const showUploadWidget = () => {
    if (!window.cloudinary) return;

    // NOTE: https://demo.cloudinary.com/uw/#/ 커스텀 사이트 참고
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dfgfeq4up',
        uploadPreset: 'monomon',
        sources: ['local', 'camera', 'google_drive', 'dropbox', 'url'],
        // NOTE: 크롭 모드 활성화 시 크롭 후 바로 업로드
        // TODO: 파일 선택만 하고 직접 커스텀 크롭 모드 구현
        cropping: true,
        multiple: false,
        defaultSource: 'local',
        styles: {
          palette: {
            window: '#ffffff',
            sourceBg: '#fafbfb',
            windowBorder: '#4b5563',
            tabIcon: '#1f2937',
            inactiveTabIcon: '#555a5f',
            menuIcons: '#555a5f',
            link: '#ffde5d',
            action: '#ffde5d',
            inProgress: '#ffde5d',
            complete: '#ffde5d',
            error: '#cc0000',
            textDark: '#1f2937',
            textLight: '#fcfffd',
          },
          fonts: {
            default: null,
            "'Fredoka', sans-serif": {
              url: 'https://fonts.googleapis.com/css?family=Fredoka',
              active: true,
            },
          },
        },
      },
      (err, result) => {
        if (!err && result.event === 'success') {
          console.log('✅ 업로드 완료:', result);
          onUploadSuccess?.(result);
        }
      },
    );
  };

  return (
    <button
      onClick={showUploadWidget}
      className="rounded bg-yellow-400 px-4 py-2 text-black hover:bg-yellow-500"
    >
      Take a photo or upload
    </button>
  );
}
