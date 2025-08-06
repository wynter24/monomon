'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera, RefreshCw, FlipHorizontal, X } from 'lucide-react';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function CameraMode({ videoRef, onCapture, onCancel }: Props) {
  const [videoReady, setVideoReady] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [mirror, setMirror] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  const getCameraDevices = async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      tempStream.getTracks().forEach((t) => t.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoInputs);

      // 기본 전면 카메라 선택
      const defaultCamera =
        videoInputs.find((d) => /front|user/i.test(d.label)) || videoInputs[0];
      setCurrentDeviceId(defaultCamera.deviceId);
    } catch {
      toast.error('Camera permission is required.');
      onCancel();
    }
  };

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoReady(false);
  };

  const startCamera = async (deviceId: string) => {
    try {
      // 이전 스트림이 있다면 완전히 정리
      stopCurrentStream();

      // 카메라 해제를 위한 충분한 대기 시간
      await new Promise((resolve) => setTimeout(resolve, 500));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setVideoReady(true);
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (err: any) {
      console.error('Camera start error:', err);
      toast.error(`카메라 시작 실패: ${err.message}`);
      setVideoReady(false);
    }
  };

  useEffect(() => {
    getCameraDevices();

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      stopCurrentStream();
    };
  }, []);

  useEffect(() => {
    if (currentDeviceId) {
      startCamera(currentDeviceId);
    }
  }, [currentDeviceId]);

  const switchCamera = async () => {
    if (!devices.length || isSwitching) return;

    setIsSwitching(true);

    try {
      const currentIndex = devices.findIndex(
        (d) => d.deviceId === currentDeviceId,
      );
      const nextDevice = devices[(currentIndex + 1) % devices.length];

      // 다음 카메라로 전환
      await startCamera(nextDevice.deviceId);
      setCurrentDeviceId(nextDevice.deviceId);
      setMirror(/front|user/i.test(nextDevice.label));
    } catch (error) {
      console.error('카메라 전환 실패:', error);
      toast.error('카메라 전환에 실패했습니다.');
    } finally {
      setIsSwitching(false);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(dataUrl);
  };

  const handleCancel = () => {
    stopCurrentStream();
    onCancel();
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="relative aspect-[9/16] h-[70vh] w-full overflow-hidden rounded-lg bg-black sm:aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedData={() => setVideoReady(true)}
          className={`h-full w-full object-cover ${mirror ? 'scale-x-[-1]' : ''}`}
        />
        {isSwitching && (
          <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white">카메라 전환 중...</div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={capture}
          disabled={!videoReady}
          className="rounded-full bg-yellow-400 p-3 hover:bg-yellow-300 disabled:opacity-50"
        >
          <Camera size={24} />
        </button>
        {devices.length > 1 && (
          <button
            onClick={switchCamera}
            disabled={isSwitching}
            className="rounded-full bg-gray-200 p-3 hover:bg-gray-300 disabled:opacity-50 sm:hidden"
          >
            <RefreshCw
              size={20}
              className={isSwitching ? 'animate-spin' : ''}
            />
          </button>
        )}
        <button
          onClick={() => setMirror((prev) => !prev)}
          className="rounded-full bg-gray-200 p-3 hover:bg-gray-300"
        >
          <FlipHorizontal size={20} />
        </button>
        <button
          onClick={handleCancel}
          className="rounded-full bg-gray-200 p-3 hover:bg-gray-300"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
