import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

type UploadProps = {
  publicId: string | null;
};

export default function UploadPreview({ publicId }: UploadProps) {
  return (
    <>
      {publicId ? (
        <div className="mt-4">
          <CldImage src={publicId} width={270} height={180} alt="Uploaded" />
        </div>
      ) : (
        <div className="border-gray-darker bg-gray-lightest flex min-h-48 min-w-48 flex-col items-center justify-center rounded-md border-3 border-dashed sm:h-full sm:w-full">
          <div className="flex flex-col items-center gap-2">
            <Image
              width={70}
              height={35}
              src="/images/empty_preview.png"
              alt="empty_preview"
            />
            <p className="text-gray-darker text-center text-sm">
              Find your Pokémon
              <br />
              look-alike
            </p>
          </div>
          <p className="text-gray-darker text-xs">Upload photo</p>
        </div>
      )}
    </>
  );
}
