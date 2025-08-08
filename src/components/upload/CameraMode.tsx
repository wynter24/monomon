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
  const [needsUserAction, setNeedsUserAction] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef<Promise<void> | null>(null);
  const skipNextEffectRef = useRef(false);

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

        // deviceId가 오면 플랫폼 상관없이 항상 exact로 시도
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

        // 열린 뒤엔 목록/라벨 보강
        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          const vids = all.filter((d) => d.kind === 'videoinput');
          setDevices(vids);

          // deviceId 없던 초기 진입 시, 실제 열린 트랙 id 동기화
          if (!opts?.deviceId) {
            const openedTrack = stream.getVideoTracks()[0];
            const openedId = openedTrack.getSettings().deviceId as string;
            if (openedId) {
              skipNextEffectRef.current = true; // 다음 effect 건너뛰기
              setCurrentDeviceId(openedId);
            }
          }
        } catch {}

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setVideoReady(true);
            setIsSwitching(false);
            videoRef.current?.play().catch(() => {});
          };
        }

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
        await startCamera({ facingMode: 'user' });
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

  // ✅ currentDeviceId가 바뀔 때 카메라는 "딱 한 번"만 재시작
  useEffect(() => {
    if (!currentDeviceId) return;

    // 1) 먼저 스킵 플래그를 확인 (초기 진입 때 effect 1회 건너뜀)
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false;
      return;
    }

    // 2) 실제 전환 시작
    setIsSwitching(true);
    startCamera({ deviceId: currentDeviceId }).catch(() => {
      // 실패 시 로딩 해제 (성공 시 onloadeddata에서 해제됨)
      setIsSwitching(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDeviceId]);

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
    if (isSwitching) return;

    setIsSwitching(true);

    try {
      // 전환은 항상 deviceId로 “확정”해서 시도
      const nextId = findBackCameraId();
      if (!nextId) {
        setIsSwitching(false);
        toast.error('No other camera found');
        return;
      }

      if (nextId === currentDeviceId) {
        // 이미 후면이면 전면 후보를 찾아봄 (라벨에 front/user)
        const front = devices.find((d) => /(front|user)/i.test(d.label || ''));
        if (front && front.deviceId !== currentDeviceId) {
          setMirror(true);
          setCurrentDeviceId(front.deviceId);
          return;
        }
        setIsSwitching(false);
        return;
      }

      // 미러는 라벨 있으면 동기화, 없으면 기본값 유지
      const nextLabel = (
        devices.find((d) => d.deviceId === nextId)?.label || ''
      ).toLowerCase();
      if (nextLabel) setMirror(/front|user/.test(nextLabel));

      // 실제 전환은 effect가 수행
      setCurrentDeviceId(nextId);
    } catch {
      setIsSwitching(false);
    }
  };

  const handleEnableCamera = async () => {
    try {
      await startCamera({ facingMode: 'user' });
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
      className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-4 py-10"
      aria-label="Camera mode"
    >
      <div className="relative aspect-[9/16] h-[70vh] w-full overflow-hidden rounded-lg bg-black sm:aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-hidden="true"
          onLoadedData={() => setVideoReady(true)}
          className={`h-full w-full object-cover ${mirror ? 'scale-x-[-1]' : ''}`}
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

      {needsUserAction && !videoReady && (
        <button
          onClick={handleEnableCamera}
          className="rounded-full bg-yellow-400 px-4 py-2 hover:bg-yellow-300"
          aria-label="Enable camera"
        >
          Enable camera
        </button>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={capture}
          disabled={!videoReady}
          className="rounded-full bg-yellow-400 p-3 hover:bg-yellow-300 disabled:opacity-50"
          aria-label="Capture photo"
        >
          <Camera size={24} />
        </button>

        <button
          onClick={switchCamera}
          disabled={isSwitching || devices.length < 2}
          className="rounded-full bg-gray-200 p-3 hover:bg-gray-300 disabled:opacity-50 sm:hidden"
          aria-label="Switch camera"
        >
          <RefreshCw size={20} className={isSwitching ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => setMirror((prev) => !prev)}
          className="rounded-full bg-gray-200 p-3 hover:bg-gray-300"
          aria-label="Toggle mirror mode"
        >
          <FlipHorizontal size={20} />
        </button>

        <button
          onClick={handleCancel}
          className="rounded-full bg-gray-200 p-3 hover:bg-gray-300"
          aria-label="Cancel capture"
        >
          <X size={20} />
        </button>
      </div>
    </section>
  );
}
