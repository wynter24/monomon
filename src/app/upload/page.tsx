'use client';
import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import CloudinaryCustomUpload from '@/components/CloudinaryCustomUpload';

export default function UploadPage() {
  const [publicId, setPublicId] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Upload Photo</h1>

      {/* 업로드 후 미리보기 */}
      {publicId && (
        <div className="mt-4">
          <CldImage src={publicId} width={270} height={180} alt="Uploaded" />
          <p className="mt-2 text-sm text-gray-500">
            ✅ 업로드 완료! public_id: {publicId}
          </p>
        </div>
      )}

      {/* 업로드 버튼 */}
      <CloudinaryCustomUpload
        onUploadSuccess={(pid) => {
          setPublicId(pid);
          // TODO: DeepFace API 호출
        }}
      />
    </div>
  );
}
