'use client';
import { useEffect, useState } from 'react';
import UploadButton, { showUploadWidget } from '@/components/UploadButton';
import Button from '@/components/common/Button';
import UploadPreview from '@/components/UploadPreview';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { matchPokemon } from '@/api/matchPokemon';
import { savePokemonResult } from '@/api/savePokemonResult';
import Loading from '@/components/common/Loading';

export default function UploadPage() {
  const [publicId, setPublicId] = useState<string | null>(null);
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string>('');
  const [etag, setEtag] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({
      uploadedImgUrl,
      etag,
    }: {
      uploadedImgUrl: string;
      etag: string;
    }) => {
      const data = await matchPokemon(uploadedImgUrl); // 분석
      const { id } = await savePokemonResult(etag, data); // 저장
      return id;
    },
    onSuccess: (id) => {
      router.push(`/result/${id}`);
    },
    onError: () => {
      toast.error('Failed to find a match. Please try again.');
    },
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    setPublicId(result.info.public_id);
    setUploadedImgUrl(result.info.secure_url);
    setEtag(result.info.etag);
  };

  const handleUploadClick = () => {
    showUploadWidget(handleUploadSuccess);
  };

  return (
    <>
      {mutation.isPending ? (
        <Loading />
      ) : (
        <div className="container mx-auto flex flex-col gap-11 p-4">
          <h1 className="text-2xl font-bold">Upload Photo</h1>

          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-11">
            <UploadPreview
              publicId={publicId}
              onUploadClick={handleUploadClick}
            />

            {/* 버튼 */}
            <div className="flex max-w-3xs flex-col items-center gap-3">
              <UploadButton
                isMobile={isMobile}
                onUploadSuccess={handleUploadSuccess}
              />
              <Button
                size={isMobile ? 'md' : 'lg'}
                text="Find my pokemon"
                disabled={!publicId}
                variants="active"
                onClick={() => mutation.mutate({ uploadedImgUrl, etag })} // mutation 호출
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-medium">
              Tips for the Best Results
            </h3>
            <div className="text-gray-darker space-y-2 text-sm">
              <p>Ensure good lighting on your face.</p>
              <p>Keep the camera at eye level for better angles.</p>
              <p>Avoid background distractions.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
