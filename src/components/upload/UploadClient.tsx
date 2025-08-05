'use client';

import { ChangeEvent, useRef, useState } from 'react';
import UploadPreview from './UploadPreview';
import Loading from '../common/Loading';
import { useUploadMutation } from './hooks/useUploadMutation';
import { toast } from 'sonner';
import { uploadImage } from '@/api/uploadImage';
import UploadActions from './UploadActions';
import CameraMode from './CameraMode';
import PreviewScreen from './PreviewScreen';

export default function UploadClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const mutation = useUploadMutation();

  const handleCapture = async (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setMode('preview');
  };

  const handleConfirm = async () => {
    try {
      const blob = dataURLtoBlob(capturedImage!);
      const file = new File([blob], 'captured.jpg', { type: blob.type });
      const data = await uploadImage(file);
      setPublicId(data.public_id);
      setUploadedImgUrl(data.secure_url);
      setEtag(data.etag);
      setMode('idle');
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Failed to upload captured image.');
    }
  };

  function dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

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

  if (mode === 'camera') {
    return (
      <CameraMode
        videoRef={videoRef}
        onCapture={handleCapture}
        onCancel={() => setMode('idle')}
      />
    );
  }

  if (mode === 'preview' && capturedImage) {
    return (
      <PreviewScreen
        image={capturedImage}
        onRetake={() => setMode('camera')}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:gap-16 sm:py-12">
      <h1 className="text-xl font-medium sm:text-2xl">Upload Photo</h1>

      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-11">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />

        <UploadPreview
          publicId={publicId}
          capturedImage={capturedImage}
          inputRef={inputRef}
        />
        <UploadActions
          disabled={!publicId}
          onUploadClick={() => inputRef.current?.click()}
          onCaptureClick={() => setMode('camera')}
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
