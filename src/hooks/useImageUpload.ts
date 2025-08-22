import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { uploadImage } from '@/api/uploadImage';

export type UploadResult = {
  publicId: string;
  secureUrl: string;
  etag: string;
};

export function useImageUpload(onSuccess?: (r: UploadResult) => void) {
  const abortRef = useRef<AbortController | null>(null);

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

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const data = await uploadImage(file);
      const out = {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        etag: data.etag,
      };
      onSuccess?.(out);
      return out;
    },
    [onSuccess],
  );

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { uploadFile, cancel };
}
