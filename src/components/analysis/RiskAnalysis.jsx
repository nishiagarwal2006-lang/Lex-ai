import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import PropTypes from 'prop-types';
import GlassCard from '../ui/GlassCard.jsx';
import RiskBadge from '../ui/RiskBadge.jsx';
import SkeletonLoader from '../ui/SkeletonLoader.jsx';
import { scoreToHex } from '../../utils/riskScorer.js';

function RiskMeter({ score, level }) {
  const color = scoreToHex(score);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <motion.circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="font-heading text-4xl font-bold"
          style={{ color }}
        >
          {score}
        </motion.div>
        <div className="mt-1 font-mono text-xs tracking-wider text-text-secondary">
          RISK SCORE
        </div>
        <div className="mt-2">
          <RiskBadge severity={level} />
        </div>
      </div>
    </div>
  );
}

function RiskItem({ risk, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard className="flex gap-4" tilt>
        <div
          className="w-1.5 shrink-0 rounded-full"
          style={{
            backgroundColor: scoreToHex(risk.severity === 'HIGH' ? 80 : risk.severity === 'MEDIUM' ? 50 : 20),
            boxShadow: `0 0 10px ${scoreToHex(risk.severity === 'HIGH' ? 80 : risk.severity === 'MEDIUM' ? 50 : 20)}`,
          }}
        />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-xs tracking-wider text-text-muted">
                {risk.category?.toUpperCase()}
              </span>
            </div>
            <RiskBadge severity={risk.severity} />
          </div>

          {risk.clause && (
            <p className="text-sm italic text-text-secondary border-l-2 border-white/10 pl-3">
              "{risk.clause}"
            </p>
          )}

          {risk.explanation && (
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-risk-medium mt-0.5" />
              <p className="text-sm text-text-primary">{risk.explanation}</p>
            </div>
          )}

          {risk.recommendation && (
            <div className="flex gap-2 rounded-lg bg-risk-low/5 p-3">
              <Lightbulb className="h-4 w-4 shrink-0 text-risk-low mt-0.5" />
              <p className="text-sm text-text-primary">{risk.recommendation}</p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function RiskAnalysis({ data, loading }) {
  const riskCounts = useMemo(() => {
    if (!data?.risks) return { high: 0, medium: 0, low: 0 };
    return {
      high:   data.risks.filter(r => r.severity === 'HIGH').length,
      medium: data.risks.filter(r => r.severity === 'MEDIUM').length,
      low:    data.risks.filter(r => r.severity === 'LOW').length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassCard className="flex items-center justify-center py-12">
          <SkeletonLoader lines={3} />
        </GlassCard>
        <SkeletonLoader lines={6} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <GlassCard className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-around" tilt>
        <RiskMeter score={data.overallRiskScore ?? 0} level={data.riskLevel || 'LOW'} />
        <div className="max-w-md text-center md:text-left">
          <h3 className="font-heading text-2xl font-bold text-text-primary">Risk Overview</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {data.risks?.length || 0} risk{data.risks?.length !== 1 ? 's' : ''} identified across
            this document. Review each finding below and follow the recommendations.
          </p>
          <div className="mt-4 font-mono text-xs text-text-muted">
            SCORE BREAKDOWN: {riskCounts.high} HIGH /{' '}
            {riskCounts.medium} MEDIUM /{' '}
            {riskCounts.low} LOW
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {data.risks?.map((risk, i) => (
          <RiskItem key={`${risk.category}-${i}`} risk={risk} index={i} />
        ))}
      </div>
    </div>
  );
}

RiskAnalysis.propTypes = {
  data: PropTypes.shape({
    overallRiskScore: PropTypes.number,
    riskLevel: PropTypes.string,
    risks: PropTypes.arrayOf(PropTypes.shape({
      category: PropTypes.string,
      severity: PropTypes.string,
      clause: PropTypes.string,
      explanation: PropTypes.string,
      recommendation: PropTypes.string,
    })),
  }),
  loading: PropTypes.bool,
};
