'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { BLUR_DATA_URL } from '@/constants/image';

interface SkeletonImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  loadingText?: string;
  isCloudinary?: boolean;
}

export default function SkeletonImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  sizes,
  priority = false,
  placeholder = 'blur',
  blurDataURL = BLUR_DATA_URL,
  onLoad,
  loadingText = 'Loading...',
  isCloudinary = false,
}: SkeletonImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  return (
    <div className="relative w-full">
      {/* 스켈레톤 UI */}
      {!imageLoaded && (
        <div
          className="absolute inset-0 flex animate-pulse items-center justify-center rounded-md bg-gray-200"
          role="status"
          aria-live="polite"
        >
          <span className="text-sm text-gray-400">{loadingText}</span>
        </div>
      )}

      {/* 실제 이미지 */}
      {isCloudinary ? (
        <CldImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={`h-auto w-full rounded-md object-contain transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleImageLoad}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={`h-auto w-full rounded-md object-contain transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleImageLoad}
        />
      )}
    </div>
  );
}
