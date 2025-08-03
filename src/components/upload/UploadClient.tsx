'use client';

import { ChangeEvent, useRef, useState } from 'react';
import UploadPreview from './UploadPreview';
import Loading from '../common/Loading';
import { useUploadMutation } from './hooks/useUploadMutation';
import { toast } from 'sonner';
import { uploadImage } from '@/api/uploadImage';
import UploadActions from './UploadActions';

export default function UploadClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const mutation = useUploadMutation();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadImage(file);
      setPublicId(data.public_id);
      setUploadedImgUrl(data.secure_url);
      setEtag(data.etag);
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  if (mutation.isPending) {
    return <Loading text="We’re finding your Pokémon twin" />;
  }

  return (
    <div className="container mx-auto flex max-w-4xl flex-col px-4 py-8 sm:gap-11 sm:py-12 md:py-16">
      <h1 className="text-xl font-medium sm:text-2xl">Upload Photo</h1>

      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-11">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <UploadPreview publicId={publicId} inputRef={inputRef} />
        <UploadActions
          disabled={!publicId}
          onUploadClick={() => inputRef.current?.click()}
          onFindClick={() => {
            if (!uploadedImgUrl || !etag) {
              toast.warning('Please upload a photo to find your Pokémon twin!');
              return;
            }
            mutation.mutate({ uploadedImgUrl, etag });
          }}
        />
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
