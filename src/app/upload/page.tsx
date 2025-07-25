'use client';
import { useEffect, useState } from 'react';
import UploadButton from '@/components/UploadButton';
import Button from '@/components/common/Button';
import UploadPreview from '@/components/UploadPreview';
import { useMatchStore } from '@/store/useMatchStore';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [publicId, setPublicId] = useState<string | null>(null);
  const router = useRouter();
  const { setImgUrl, setEtag, clearMatch } = useMatchStore();

  useEffect(() => {
    clearMatch();
  }, []);

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
              setEtag(result.info.etag);
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
