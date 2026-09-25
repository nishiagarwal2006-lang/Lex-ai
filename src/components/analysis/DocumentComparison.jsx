import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Minus, Plus, FileEdit, Trophy } from 'lucide-react';
import GlassCard from '../ui/GlassCard.jsx';
import Badge from '../ui/Badge.jsx';
import SkeletonLoader from '../ui/SkeletonLoader.jsx';

const changeTypeMap = {
  added: { icon: Plus, color: 'green', hex: '#30d158', label: 'ADDED' },
  removed: { icon: Minus, color: 'red', hex: '#ff2d55', label: 'REMOVED' },
  modified: { icon: FileEdit, color: 'amber', hex: '#ff9f0a', label: 'MODIFIED' },
};

function SimilarityScore({ score }) {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#6366f1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 50}
          initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 50 - (score / 100) * 2 * Math.PI * 50 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: 'drop-shadow(0 0 6px #6366f1)' }}
        />
      </svg>
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-heading text-3xl font-bold text-neon-indigo"
        >
          {score}%
        </motion.div>
        <div className="font-mono text-[10px] text-text-muted">SIMILAR</div>
      </div>
    </div>
  );
}

export default function DocumentComparison({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader lines={3} />
        <SkeletonLoader lines={6} />
        <SkeletonLoader lines={6} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Score + Summary */}
      <GlassCard tilt className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <SimilarityScore score={data.similarityScore || 0} />
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-heading text-xl font-bold text-text-primary">Comparison Summary</h3>
          <p className="mt-2 text-sm text-text-secondary">{data.summary}</p>
        </div>
      </GlassCard>

      {/* Changes */}
      {data.changes?.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-mono text-xs tracking-wider text-text-muted">
            DETECTED CHANGES ({data.changes.length})
          </h4>
          {data.changes.map((change, i) => {
            const cfg = changeTypeMap[change.type] || changeTypeMap.modified;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard tilt>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: cfg.hex }} />
                      <span className="font-heading text-sm font-semibold text-text-primary">
                        {change.section}
                      </span>
                    </div>
                    <Badge color={cfg.color}>{cfg.label}</Badge>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {change.doc1Text && (
                      <div className="diff-removed">
                        <div className="mb-1 flex items-center gap-1 font-mono text-[10px] text-risk-high">
                          <ArrowLeft className="h-3 w-3" /> DOC A
                        </div>
                        <p className="text-xs text-text-secondary">{change.doc1Text}</p>
                      </div>
                    )}
                    {change.doc2Text && (
                      <div className="diff-added">
                        <div className="mb-1 flex items-center gap-1 font-mono text-[10px] text-risk-low">
                          <ArrowRight className="h-3 w-3" /> DOC B
                        </div>
                        <p className="text-xs text-text-secondary">{change.doc2Text}</p>
                      </div>
                    )}
                  </div>

                  {change.significance && (
                    <div className="mt-3 flex gap-2 rounded-lg bg-white/[0.03] p-3">
                      <span className="text-text-muted text-xs">Why it matters:</span>
                      <p className="text-xs text-text-secondary">{change.significance}</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recommendation */}
      {data.recommendation && (
        <GlassCard tilt className="border-risk-low/20">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 shrink-0 text-risk-low mt-1" />
            <div>
              <h4 className="font-heading text-sm font-semibold text-risk-low">Recommendation</h4>
              <p className="mt-2 text-sm text-text-primary">{data.recommendation}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
