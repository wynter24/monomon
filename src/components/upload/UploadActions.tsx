'use client';
import Button from '../common/Button';
import { useMobile } from '@/hooks/useMobile';

interface uploadActionsProps {
  disabled: boolean;
  onCaptureClick: () => void;
  onUploadClick: () => void;
  onFindClick: () => void;
}

export default function UploadActions({
  disabled,
  onCaptureClick,
  onUploadClick,
  onFindClick,
}: uploadActionsProps) {
  const isMobile = useMobile();

  return (
    <div
      className="flex max-w-3xs flex-col items-center justify-center gap-3"
      aria-label="Upload action buttons"
    >
      <Button
        size={isMobile ? 'md' : 'lg'}
        text="Take photo"
        onClick={onCaptureClick}
        aria-label="Open camera to take a photo"
      />
      <Button
        size={isMobile ? 'md' : 'lg'}
        text="Upload photo"
        onClick={onUploadClick}
        aria-label="Upload a photo from your device"
      />
      <Button
        size={isMobile ? 'md' : 'lg'}
        text="Find my pokemon"
        disabled={disabled}
        variants="active"
        onClick={onFindClick}
        aria-label="Find your Pokémon look-alike"
      />
    </div>
  );
}
