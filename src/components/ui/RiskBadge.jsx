import { clsx } from 'clsx';
import { severityToColor } from '../../utils/riskScorer.js';

export default function RiskBadge({ severity, className }) {
  const color = severityToColor(severity);
  const hexMap = {
    'risk-high': '#ff2d55',
    'risk-medium': '#ff9f0a',
    'risk-low': '#30d158',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase',
        className
      )}
      style={{
        borderColor: `${hexMap[color]}40`,
        color: hexMap[color],
        backgroundColor: `${hexMap[color]}10`,
      }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: hexMap[color], boxShadow: `0 0 6px ${hexMap[color]}` }}
      />
      {severity?.toUpperCase() || 'UNKNOWN'}
    </span>
  );
}
