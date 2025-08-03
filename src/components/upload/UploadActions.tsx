'use client';
import Button from '../common/Button';
import { useMobile } from '@/hooks/useMobile';

interface uploadActionsProps {
  disabled: boolean;
  onUploadClick: () => void;
  onFindClick: () => void;
}

export default function UploadActions({
  disabled,
  onUploadClick,
  onFindClick,
}: uploadActionsProps) {
  const isMobile = useMobile();

  return (
    <div className="flex max-w-3xs flex-col items-center justify-center gap-3">
      <Button
        size={isMobile ? 'md' : 'lg'}
        text="Upload photo "
        onClick={onUploadClick}
      />
      <Button
        size={isMobile ? 'md' : 'lg'}
        text="Find my pokemon"
        disabled={disabled}
        variants="active"
        onClick={onFindClick}
      />
    </div>
  );
}
