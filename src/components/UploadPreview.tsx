import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

type UploadProps = {
  publicId: string | null;
  onUploadClick?: () => void;
};

export default function UploadPreview({
  publicId,
  onUploadClick,
}: UploadProps) {
  return (
    <>
      {publicId ? (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          <CldImage
            src={publicId}
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto w-full rounded-md"
            alt="Uploaded"
          />
        </div>
      ) : (
        <div
          className="border-gray-darker bg-gray-lightest relative flex aspect-square h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-md border-3 border-dashed transition-colors sm:h-80 sm:w-80 md:h-96 md:w-96"
          onClick={onUploadClick}
        >
          <div className="flex flex-col items-center gap-2">
            <Image
              width={70}
              height={35}
              src="/images/empty_preview.png"
              alt="empty_preview"
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
