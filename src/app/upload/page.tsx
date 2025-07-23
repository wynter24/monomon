'use client';
import { useState } from 'react';
import UploadButton from '@/components/UploadButton';
import Button from '@/components/common/Button';
import UploadPreview from '@/components/UploadPreview';
import { useRouter } from 'next/router';
import { useMatchStore } from '@/store/useMatchStore';

export default function UploadPage() {
  const [publicId, setPublicId] = useState<string | null>(null);
  const router = useRouter();
  const { setImgUrl } = useMatchStore();

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Upload Photo</h1>

      <div className="flex flex-col items-center justify-center">
        <UploadPreview publicId={publicId} />

        {/* 버튼 */}
        <div className="flex max-w-3xs flex-col gap-3">
          <UploadButton
            onUploadSuccess={(result: CloudinaryUploadResult) => {
              setPublicId(result.info.public_id);
              setImgUrl(result.info.secure_url);
            }}
          />
          <Button
            size="md"
            text="Find my pokemon"
            disabled={!publicId}
            variants="active"
            onClick={() => router.push('/loading')}
          />
        </div>
      </div>
    </div>
  );
}
