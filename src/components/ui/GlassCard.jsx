import { clsx } from 'clsx';

export default function GlassCard({ children, className, tilt = true, onClick, ...props }) {
  return (
    <div
      className={clsx(
        'glass-card p-6',
        tilt && 'tilt-card',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
