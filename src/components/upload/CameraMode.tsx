'use client';

import { useEffect, useState } from 'react';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function CameraMode({ videoRef, onCapture, onCancel }: Props) {
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      stream = s;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;

        const onCanPlay = () => {
          video.play().catch((err) => {
            console.error('video.play() failed:', err);
          });
          video.removeEventListener('canplay', onCanPlay);
        };

        video.addEventListener('canplay', onCanPlay);
      }
    });

    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [videoRef]);

  const capture = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current!;
    if (!video || video.readyState < 2) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    onCapture(dataUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedData={() => setVideoReady(true)}
        className="h-72 w-72 rounded-lg border shadow-md"
      />
      <div className="flex gap-4">
        <button
          className="rounded bg-yellow-400 px-4 py-2"
          disabled={!videoReady}
          onClick={capture}
        >
          촬영
        </button>
        <button className="rounded bg-gray-300 px-4 py-2" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}
