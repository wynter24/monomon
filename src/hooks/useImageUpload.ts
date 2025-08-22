import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadImage } from '@/api/uploadImage';

export type UploadResult = {
  publicId: string;
  secureUrl: string;
  etag: string;
};

export function useImageUpload(onSuccess?: (r: UploadResult) => void) {
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!file.type.startsWith('image/')) {
        toast.warning('Please select an image file.');
        throw new Error('Invalid file type');
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.warning('Image is too large (max 10MB).');
        throw new Error('File too large');
      }
      if (uploading) {
        // 동시 업로드 방지
        throw new Error('Already uploading');
      }

      // 새 업로드 시작
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        setUploading(true);

        const data = await uploadImage(file);
        const out = {
          publicId: data.public_id,
          secureUrl: data.secure_url,
          etag: data.etag,
        };

        onSuccess?.(out);
        return out;
      } finally {
        if (mountedRef.current) setUploading(false);
      }
    },
    [onSuccess, uploading],
  );

  return { uploadFile, cancel, uploading };
}
