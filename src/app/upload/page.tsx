'use client';
import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import CloudinaryCustomUpload from '@/components/CloudinaryCustomUpload';

export default function UploadPage() {
  const [publicId, setPublicId] = useState<string | null>(null);

  async function matchWithCloudinaryURL(imageUrl: string) {
    const formData = new FormData();
    formData.append('image_url', imageUrl);

    const res = await fetch(
      'https://wynter24-pokemon-face-match.hf.space/match',
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await res.json();
    console.log('API 결과:', data);

    // 예: { matched_pokemon_name: "Pikachu", matched_pokemon_image: "https://..." }
    return data;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Upload Photo</h1>

      {/* 업로드 후 미리보기 */}
      {publicId && (
        <div className="mt-4">
          <CldImage src={publicId} width={270} height={180} alt="Uploaded" />
          <p className="mt-2 text-sm text-gray-500">
            ✅ 업로드 완료! public_id: {publicId}
          </p>
        </div>
      )}

      {/* 업로드 버튼 */}
      <CloudinaryCustomUpload
        onUploadSuccess={(result: CloudinaryUploadResult) => {
          setPublicId(result.info.public_id);
          // TODO: DeepFace API 호출
          const secureUrl = result.info.secure_url; // ✅ Cloudinary가 반환하는 URL
          console.log('업로드된 Cloudinary URL:', secureUrl);

          // Cloudinary URL로 바로 Spaces API 호출
          matchWithCloudinaryURL(secureUrl);
        }}
      />
    </div>
  );
}
