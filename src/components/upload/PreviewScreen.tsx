'use client';

import Button from '../common/Button';

interface Props {
  image: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export default function PreviewScreen({ image, onRetake, onConfirm }: Props) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="relative aspect-[9/16] h-[70vh] w-full overflow-hidden rounded-lg bg-black sm:aspect-video">
        <img
          src={image}
          alt="캡처된 이미지"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex gap-4">
        <Button
          text="Use Photo"
          size="md"
          variants="active"
          onClick={onConfirm}
        />
        <Button
          text="Retake"
          size="md"
          variants="inactive"
          onClick={onRetake}
        />
      </div>
    </div>
  );
}
