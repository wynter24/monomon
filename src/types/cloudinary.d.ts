export {};

declare global {
  interface CloudinaryUploadResultInfo {
    public_id: string;
    secure_url: string;
    etag: string;
  }

  interface CloudinaryUploadResult {
    event: string;
    info: CloudinaryUploadResultInfo;
  }

  type CloudinaryCallback = (
    error: unknown,
    result: CloudinaryUploadResult
  ) => void;

  interface CloudinaryWidgetOptions {
    cloudName: string;
    uploadPreset: string;
    sources?: string[];
    multiple?: boolean;
    cropping?: boolean;
    defaultSource?: string;
    styles?: Record<string, unknown>;
  }

  interface CloudinaryWidget {
    openUploadWidget: (
      options: CloudinaryWidgetOptions,
      callback: CloudinaryCallback
    ) => void;
  }

  interface Window {
    cloudinary: CloudinaryWidget;
  }
}
