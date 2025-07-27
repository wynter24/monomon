'use client';
import { useEffect } from 'react';
import Button from './common/Button';

interface Props {
  /** 업로드 후 public_id를 부모로 전달 */
  onUploadSuccess?: (result: CloudinaryUploadResult) => void;
  isMobile: boolean;
}

// showUploadWidget 함수를 컴포넌트 외부로 이동
export const showUploadWidget = (
  onUploadSuccess?: (result: CloudinaryUploadResult) => void,
) => {
  if (!window.cloudinary) return;

  // NOTE: https://demo.cloudinary.com/uw/#/ 커스텀 사이트 참고
  window.cloudinary.openUploadWidget(
    {
      cloudName: 'dfgfeq4up',
      uploadPreset: 'monomon',
      // TODO: 로그인 기능 추가 후, signed upload로 변경 -> 중복 업로드 방지 옵션 적용
      // unique_filename: false, // 같은 이름/같은 이미지면 새로 안 만듦
      // overwrite: false, // 기존 파일이 있으면 덮어쓰기 안 함
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

export default function UploadButton({ onUploadSuccess, isMobile }: Props) {
  useEffect(() => {
    // Cloudinary 위젯 스크립트가 없으면 로드
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <Button
      size={isMobile ? 'md' : 'lg'}
      text="Take a photo or upload"
      onClick={() => showUploadWidget(onUploadSuccess)}
      className="md:w-full"
    />
  );
}
