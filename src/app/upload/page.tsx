'use client';

import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

interface CloudinaryResult {
  public_id: string;
}

export default function UploadPage() {
  const [publicId, setPublicId] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">이미지 업로드</h1>
      {publicId && (
        <CldImage
          src={publicId}
          width={270}
          height={180}
          alt="Uploaded Image Not Found"
        />
      )}
      <CldUploadWidget
        uploadPreset="monomon"
        onSuccess={(result, _widget) => {
          if (result.event !== 'success') return;
          const info = result.info as CloudinaryResult;
          setPublicId(info.public_id);
        }}
        onError={(error) => {
          console.error('=== 업로드 에러 ===');
          console.error('Error:', error);
        }}
      >
        {({ open }) => {
          return (
            <button
              onClick={() => {
                console.log('=== 업로드 버튼 클릭됨 ===');
                open();
              }}
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              이미지 업로드
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
