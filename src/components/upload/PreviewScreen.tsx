'use client';

import Button from '../common/Button';

interface Props {
  image: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export default function PreviewScreen({ image, onRetake, onConfirm }: Props) {
  return (
    <section
      className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-4 py-10"
      aria-label="Photo preview screen"
    >
      <div className="relative aspect-[9/16] h-[70vh] w-full overflow-hidden rounded-lg bg-black sm:aspect-video">
        <img
          src={image}
          alt="Preview of captured photo"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          text="Use Photo"
          size="md"
          variants="active"
          onClick={onConfirm}
          aria-label="Use this photo"
        />
        <Button
          text="Retake"
          size="md"
          variants="inactive"
          onClick={onRetake}
          aria-label="Retake photo"
        />
      </div>
    </section>
  );
}
