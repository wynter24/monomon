'use client';

import { ChangeEvent, useRef, useState } from 'react';
import UploadPreview from './UploadPreview';
import Loading from '../common/Loading';
import { useUploadMutation } from './hooks/useUploadMutation';
import { toast } from 'sonner';
import UploadActions from './UploadActions';
import CameraMode from './CameraMode';
import PreviewScreen from './PreviewScreen';
import { useImageUpload } from '@/hooks/useImageUpload';

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

  const { uploadFile, uploading } = useImageUpload(
    ({ publicId, secureUrl, etag }) => {
      setPublicId(publicId);
      setUploadedImgUrl(secureUrl);
      setEtag(etag);
    },
  );

  // 파일 선택
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    try {
      await uploadFile(file);
    } catch {
      toast.error('Failed to upload image.');
    } finally {
      if (inputRef.current) inputRef.current.value = ''; // 같은 파일 재선택 가능
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

  // 카메라 캡쳐
  const handleConfirm = async () => {
    if (!capturedImage || uploading) return;
    try {
      const blob = dataURLtoBlob(capturedImage!);
      const file = new File([blob], 'captured.jpg', { type: blob.type });
      await uploadFile(file);
      setMode('idle');
      setCapturedImage(null);
    } catch {
      toast.error('Failed to upload captured image.');
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
        onCancel={() => {
          setMode('idle');
          setCapturedImage(null);
        }}
      />
    );
  }

  if (mode === 'preview' && capturedImage) {
    return (
      <PreviewScreen
        image={capturedImage}
        onRetake={() => {
          setMode('camera');
          setCapturedImage(null);
        }}
        onConfirm={handleConfirm}
      />
    );
  }

  const canFind =
    Boolean(uploadedImgUrl && etag) && !mutation.isPending && !uploading;

  return (
    <section
      className="container mx-auto flex max-w-4xl flex-col gap-5 px-4 pt-28 pb-12 md:gap-11"
      aria-label="Photo selection area"
    >
      <header className="text-center">
        <h1 className="text-2xl font-semibold md:text-3xl">
          Find your Pokémon twin
        </h1>
        <p className="mt-2 text-sm text-gray-600 md:text-base">
          Upload a clear photo to match your look{' '}
          <span className="hidden md:inline">with a Pokémon</span>
        </p>
      </header>

      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-11">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload a photo"
        />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
          aria-hidden="true"
        />

        <UploadPreview
          publicId={publicId}
          capturedImage={capturedImage}
          inputRef={inputRef}
        />
        <UploadActions
          disabled={!canFind}
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
    </section>
  );
}
