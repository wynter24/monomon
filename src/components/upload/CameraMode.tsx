'use client';

import { useEffect, useRef, useState } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { toast } from 'sonner';
import { Camera, RefreshCw, FlipHorizontal, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import CaptureTips from './CaptureTips';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function CameraMode({ videoRef, onCapture, onCancel }: Props) {
  const isMobile = useMobile();
  const [videoReady, setVideoReady] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [mirror, setMirror] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [needsUserAction, setNeedsUserAction] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef<Promise<void> | null>(null);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iP(hone|ad|od)/.test(navigator.userAgent);

  const stopCurrentStream = async () => {
    try {
      setVideoReady(false);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
        streamRef.current = null;
      }
      await new Promise((r) => setTimeout(r, isIOS ? 800 : 300));
    } catch {}
  };

  // getUserMedia는 반드시 여기서만 호출 + 동시 호출 방지
  const startCamera = async (opts?: {
    deviceId?: string;
    facingMode?: 'user' | 'environment';
  }) => {
    if (startingRef.current) {
      await startingRef.current;
      return;
    }

    const runner = (async () => {
      try {
        await stopCurrentStream();

        const videoConstraints: MediaTrackConstraints = opts?.deviceId
          ? {
              deviceId: { exact: opts.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
              aspectRatio: 16 / 9,
            }
          : {
              facingMode: opts?.facingMode ?? 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
              aspectRatio: 16 / 9,
            };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
        streamRef.current = stream;

        // ★ 비디오에 바로 붙임 (초기든 전환이든 동일)
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setVideoReady(true);
            setIsSwitching(false);
            videoRef.current?.play().catch(() => {});
          };
        }

        // ★ 목록/현재 deviceId는 “기록용”으로만 업데이트
        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          const vids = all.filter((d) => d.kind === 'videoinput');
          setDevices(vids);

          const openedTrack = stream.getVideoTracks()[0];
          const openedId = openedTrack.getSettings().deviceId as
            | string
            | undefined;
          if (openedId) {
            setCurrentDeviceId(openedId);
            const openedLabel = (
              vids.find((v) => v.deviceId === openedId)?.label || ''
            ).toLowerCase();
            if (openedLabel) {
              setIsFrontCamera(/front|user|face|internal/.test(openedLabel));
            } else if (opts?.facingMode) {
              setIsFrontCamera(opts.facingMode === 'user');
            }
          } else if (opts?.facingMode) {
            setIsFrontCamera(opts.facingMode === 'user');
          }
        } catch {}

        setNeedsUserAction(false);
      } catch (err: any) {
        setIsSwitching(false);
        setVideoReady(false);
        setNeedsUserAction(true);
        if (err?.name !== 'NotAllowedError') {
          toast.error(
            `Failed to start camera: ${err?.message ?? err?.name ?? 'Unknown error'}`,
          );
        }
        throw err;
      } finally {
        startingRef.current = null;
      }
    })();

    startingRef.current = runner;
    await runner;
  };

  // 초기: 자동 시도(이미 허용된 환경). 실패 시 버튼으로 유도
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await startCamera({ facingMode: 'user' }); // ← 여기서 바로 붙이고, 목록/현재ID 기록
      } catch {
        if (mounted) setNeedsUserAction(true);
      }
    })();
    return () => {
      mounted = false;
      stopCurrentStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 후면 후보 탐색 헬퍼
  const findBackCameraId = () => {
    if (!devices.length) return null;

    // 1순위: 라벨에 back/rear/environment 포함
    const byLabel = devices.find((d) =>
      /(back|rear|environment)/i.test(d.label || ''),
    );
    if (byLabel) return byLabel.deviceId;

    // 2순위: 현재와 다른 비디오 입력 하나 고름(단말마다 라벨 비공개일 수 있음)
    const fallback = devices.find((d) => d.deviceId !== currentDeviceId);
    return fallback ? fallback.deviceId : null;
  };

  const switchCamera = async () => {
    if (isSwitching || startingRef.current) return;

    setIsSwitching(true);

    try {
      const nextId = findBackCameraId();
      if (!nextId) {
        setIsSwitching(false);
        toast.error('No other camera found');
        return;
      }

      const nextLabel = (
        devices.find((d) => d.deviceId === nextId)?.label || ''
      ).toLowerCase();
      if (nextLabel) {
        const nextIsFront = /front|user|face|internal/.test(nextLabel);
        setMirror(nextIsFront);
        setIsFrontCamera(nextIsFront);
      }

      // ★ 버튼 핸들러에서 직접 열기
      await startCamera({ deviceId: nextId });
      setCurrentDeviceId(nextId); // 기록만
    } catch {
      setIsSwitching(false);
    }
  };

  const handleEnableCamera = async () => {
    try {
      await startCamera({ facingMode: 'user' });
      setIsFrontCamera(true);
      setMirror(true);
    } catch {}
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
    <section
      className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-4 pt-28 pb-12"
      aria-label="Camera mode"
    >
      {/* Pokedex shell */}
      <div className="relative w-full max-w-lg rounded-2xl bg-red-600 p-3 text-white shadow-xl ring-1 ring-red-700/40 sm:p-5">
        {/* Pokedex top indicators */}
        <div className="mb-2 flex items-center gap-2 sm:mb-4">
          <div className="h-4 w-4 rounded-full bg-blue-400 ring-2 ring-blue-200 sm:h-6 sm:w-6" />
          <div className="h-1.5 w-1.5 rounded-full bg-green-300 sm:h-2 sm:w-2" />
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-300 sm:h-2 sm:w-2" />
        </div>

        {/* Main screen */}
        <div className="rounded-2xl bg-red-700/40 p-2 shadow-inner sm:p-4">
          {/* screen */}
          <div className="relative aspect-[3/4] w-full rounded-lg bg-black p-2 sm:aspect-[4/3] sm:p-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-hidden="true"
              onLoadedData={() => setVideoReady(true)}
              className={`h-full w-full rounded-lg object-cover ${mirror ? 'scale-x-[-1]' : ''}`}
            />
            {isSwitching && (
              <div
                className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black"
                role="status"
                aria-live="polite"
              >
                <div className="text-white">Switching camera...</div>
              </div>
            )}
          </div>
        </div>

        {/* Controls row */}
        <div className="mt-2 flex items-center justify-center sm:mt-4">
          <div className="grid w-full grid-cols-4 items-center gap-1.5 rounded-lg bg-black p-1.5 sm:gap-2 sm:p-2">
            {/* Capture (primary big) */}
            <button
              onClick={capture}
              disabled={!videoReady}
              className={twMerge(
                'col-span-2 flex h-10 items-center justify-center rounded-full bg-yellow-400 text-neutral-900 transition hover:bg-yellow-300 disabled:opacity-50 sm:h-12',
                isMobile && isFrontCamera && 'col-span-1',
              )}
              aria-label="Capture photo"
            >
              <Camera size={18} className="sm:h-5 sm:w-5" />
            </button>

            {/* Switch camera */}
            <button
              onClick={switchCamera}
              disabled={isSwitching || devices.length < 2}
              className="flex h-10 items-center justify-center rounded-md bg-neutral-700 text-white transition hover:bg-neutral-600 disabled:opacity-50 sm:hidden sm:h-12"
              aria-label="Switch camera"
            >
              <RefreshCw
                size={16}
                className={`sm:h-4 sm:w-4 ${isSwitching ? 'animate-spin' : ''}`}
              />
            </button>

            {/* Mirror toggle: desktop(always) or mobile(front-only) */}
            {(!isMobile || isFrontCamera) && (
              <button
                onClick={() => setMirror((prev) => !prev)}
                className="flex h-10 items-center justify-center rounded-md bg-neutral-700 text-white transition hover:bg-neutral-600 sm:h-12"
                aria-label="Toggle mirror mode"
              >
                <FlipHorizontal size={16} className="sm:h-4 sm:w-4" />
              </button>
            )}

            <button
              onClick={handleCancel}
              className="flex h-10 items-center justify-center rounded-md bg-neutral-700 text-white transition hover:bg-neutral-600 sm:h-12"
              aria-label="Cancel capture"
            >
              <X size={18} className="sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {needsUserAction && !videoReady && (
        <button
          onClick={handleEnableCamera}
          className="rounded-full bg-yellow-400 px-4 py-2 hover:bg-yellow-300"
          aria-label="Enable camera"
        >
          Enable camera
        </button>
      )}
      <CaptureTips />
    </section>
  );
}
