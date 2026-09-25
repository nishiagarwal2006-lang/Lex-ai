import { clsx } from 'clsx';

export default function Badge({ children, className, color = 'default' }) {
  const colorMap = {
    default: 'border-white/10 text-text-secondary bg-white/5',
    cyan: 'border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5',
    magenta: 'border-neon-magenta/30 text-neon-magenta bg-neon-magenta/5',
    indigo: 'border-neon-indigo/30 text-neon-indigo bg-neon-indigo/5',
    green: 'border-risk-low/30 text-risk-low bg-risk-low/5',
    amber: 'border-risk-medium/30 text-risk-medium bg-risk-medium/5',
    red: 'border-risk-high/30 text-risk-high bg-risk-high/5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-mono tracking-wider uppercase',
        colorMap[color] || colorMap.default,
        className
      )}
    >
      {children}
    </span>
  );
}
