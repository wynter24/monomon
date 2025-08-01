'use client';

import { useMobile } from '@/hooks/useMobile';
import { useState } from 'react';
import UploadButton, { showUploadWidget } from './UploadButton';
import UploadPreview from './UploadPreview';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { useUploadMutation } from './hooks/useUploadMutation';
import { toast } from 'sonner';

export default function UploadClient() {
  const [publicId, setPublicId] = useState<string | null>(null);
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const isMobile = useMobile();
  const mutation = useUploadMutation();

  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    setPublicId(result.info.public_id);
    setUploadedImgUrl(result.info.secure_url);
    setEtag(result.info.etag);
  };

  const handleUploadClick = () => {
    showUploadWidget(handleUploadSuccess);
  };

  if (mutation.isPending) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto flex max-w-4xl flex-col px-4 sm:gap-11">
      <h1 className="text-xl font-medium sm:text-2xl">Upload Photo</h1>

      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-11">
        <UploadPreview publicId={publicId} onUploadClick={handleUploadClick} />

        <div className="flex max-w-3xs flex-col items-center gap-3">
          <UploadButton
            isMobile={isMobile}
            onUploadSuccess={handleUploadSuccess}
          />
          <Button
            size={isMobile ? 'md' : 'lg'}
            text="Find my pokemon"
            disabled={!publicId}
            variants="active"
            onClick={() => {
              if (!uploadedImgUrl || !etag) {
                toast.warning(
                  'Please upload a photo to find your Pokémon twin!',
                );
                return;
              }
              mutation.mutate({ uploadedImgUrl, etag });
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm sm:text-lg">Tips for the Best Results</h3>
        <div className="text-gray-darker space-y-2 text-xs sm:text-sm">
          <p>Ensure good lighting on your face.</p>
          <p>Keep the camera at eye level for better angles.</p>
          <p>Avoid background distractions.</p>
        </div>
      </div>
    </div>
  );
}
