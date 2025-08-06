'use client';

interface Props {
  image: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export default function PreviewScreen({ image, onRetake, onConfirm }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="relative aspect-[9/16] h-[70vh] w-full max-w-md overflow-hidden rounded-lg bg-black sm:aspect-video">
        <img
          src={image}
          alt="캡처된 이미지"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex gap-4">
        <button
          className="cursor-pointer rounded bg-yellow-400 px-4 py-2"
          onClick={onConfirm}
        >
          확인
        </button>
        <button
          className="cursor-pointer rounded bg-gray-300 px-4 py-2"
          onClick={onRetake}
        >
          재촬영
        </button>
      </div>
    </div>
  );
}
