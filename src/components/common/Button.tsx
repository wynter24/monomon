import { BUTTON_SIZE, VARIANT_COLOR } from '@/constants/button';
import { twMerge } from 'tailwind-merge';

type ButtonProps = {
  size: 'md' | 'lg';
  text: string;
  variants?: 'inactive' | 'active';
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  size,
  text,
  variants = 'inactive',
  disabled = false,
  ...props
}: ButtonProps) {
  const { className, ...rest } = props;

  const sizeClass = BUTTON_SIZE[size];
  const baseClasses =
    'rounded-2xl py-2 text-black cursor-pointer shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition hover:shadow-[0_6px_8px_rgba(0,0,0,0.12)] disabled:hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)]';
  const variantClasses = disabled
    ? VARIANT_COLOR['disabled']
    : VARIANT_COLOR[variants];

  const buttonClassName = twMerge(
    sizeClass,
    baseClasses,
    variantClasses,
    className,
  );

  return (
    <button className={buttonClassName} disabled={disabled} {...rest}>
      {text}
    </button>
  );
}
