import Image from 'next/image';
import SkeletonImage from '../common/SkeletonImage';
import React from 'react';

type UploadProps = {
  publicId: string | null;
  capturedImage: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export default function UploadPreview({
  publicId,
  capturedImage,
  inputRef,
}: UploadProps) {
  return (
    <>
      {publicId ? (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          <SkeletonImage
            src={publicId || capturedImage || ''}
            alt="Uploaded"
            width={400}
            height={400}
            className="max-h-96"
            priority={true}
            loadingText="Loading image..."
            isCloudinary={true}
          />
        </div>
      ) : (
        <div
          className="border-gray-darker bg-gray-lightest relative flex aspect-square h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-md border-3 border-dashed transition-colors sm:h-64 sm:w-64 md:h-80 md:w-80"
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Click to upload a photo"
        >
          <div className="flex flex-col items-center gap-2">
            <Image
              width={70}
              height={35}
              src="/images/empty_preview.png"
              alt="Empty preview icon"
              priority={true}
            />
            <p className="text-gray-darker text-center text-xs md:text-sm">
              Find your Pokémon
              <br />
              look-alike
            </p>
          </div>
          <p className="text-gray-darker absolute bottom-3 text-[10px] sm:bottom-5 md:text-xs">
            Upload photo
          </p>
        </div>
      )}
    </>
  );
}
