import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, Sparkles } from 'lucide-react';
import GlassCard from '../ui/GlassCard.jsx';
import Badge from '../ui/Badge.jsx';
import SkeletonLoader from '../ui/SkeletonLoader.jsx';

const clauseTypeColors = {
  Obligations: 'cyan',
  Rights: 'green',
  Payments: 'amber',
  Termination: 'red',
};

const clauseTypeHex = {
  Obligations: '#00f5ff',
  Rights: '#30d158',
  Payments: '#ff9f0a',
  Termination: '#ff2d55',
};

export default function ClauseSummary({ data, loading }) {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Obligations', 'Rights', 'Payments', 'Termination'];

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader lines={2} />
        <SkeletonLoader lines={8} />
      </div>
    );
  }

  if (!data) return null;

  const filteredClauses = activeTab === 'All'
    ? data.clauses || []
    : (data.clauses || []).filter(c => c.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Document summary */}
      {data.summary && (
        <GlassCard tilt className="border-neon-indigo/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-neon-indigo mt-1" />
            <div>
              <h3 className="font-heading text-lg font-semibold text-text-primary">Summary</h3>
              <p className="mt-2 text-sm text-text-secondary">{data.summary}</p>
              {data.documentType && (
                <Badge color="indigo" className="mt-3">
                  {data.documentType}
                </Badge>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Key dates */}
      {data.keyDates?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.keyDates.map((kd, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-2"
            >
              <Calendar className="h-4 w-4 text-neon-cyan" />
              <span className="text-sm text-text-primary">{kd.label}</span>
              <span className="font-mono text-xs text-neon-cyan">{kd.date}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-neon-indigo/20 text-neon-indigo border border-neon-indigo/30'
                : 'text-text-secondary border border-white/5 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Clause cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredClauses.map((clause, i) => {
            const hex = clauseTypeHex[clause.type] || '#6366f1';
            return (
              <motion.div
                key={`${activeTab}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard tilt className="h-full">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-heading text-base font-semibold text-text-primary">
                      {clause.title}
                    </h4>
                    <Badge
                      color={clauseTypeColors[clause.type] || 'default'}
                      className="shrink-0"
                    >
                      {clause.type}
                    </Badge>
                  </div>

                  {/* Original */}
                  <div className="mb-3 rounded-lg bg-void/60 p-3">
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-xs text-text-muted">
                      <FileText className="h-3 w-3" /> ORIGINAL
                    </div>
                    <p className="font-mono text-xs leading-relaxed text-text-secondary">
                      {clause.original}
                    </p>
                  </div>

                  {/* Simplified */}
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: `${hex}08`, borderLeft: `2px solid ${hex}` }}
                  >
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-xs" style={{ color: hex }}>
                      <Sparkles className="h-3 w-3" /> SIMPLIFIED
                    </div>
                    <p className="text-sm leading-relaxed text-text-primary">
                      {clause.simplified}
                    </p>
                  </div>

                  {clause.importance && (
                    <div className="mt-3 flex justify-end">
                      <Badge
                        color={
                          clause.importance === 'HIGH' ? 'red' :
                          clause.importance === 'MEDIUM' ? 'amber' : 'green'
                        }
                      >
                        {clause.importance} PRIORITY
                      </Badge>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Obligations & Rights summary */}
      {(data.obligations?.length > 0 || data.rights?.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.obligations?.length > 0 && (
            <GlassCard tilt>
              <h4 className="mb-3 font-mono text-xs tracking-wider text-neon-cyan">YOUR OBLIGATIONS</h4>
              <ul className="space-y-2">
                {data.obligations.map((ob, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-2">
                    <span className="text-neon-cyan">→</span> {ob}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
          {data.rights?.length > 0 && (
            <GlassCard tilt>
              <h4 className="mb-3 font-mono text-xs tracking-wider text-risk-low">YOUR RIGHTS</h4>
              <ul className="space-y-2">
                {data.rights.map((right, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-2">
                    <span className="text-risk-low">→</span> {right}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
