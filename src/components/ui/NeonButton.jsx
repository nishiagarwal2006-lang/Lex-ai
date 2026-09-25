import { clsx } from 'clsx';

export default function NeonButton({
  children,
  variant = 'primary',
  className,
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'neon-btn px-6 py-3 text-sm tracking-wide',
        variant === 'primary' && 'neon-btn-primary',
        variant === 'outline' && 'neon-btn-outline',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
