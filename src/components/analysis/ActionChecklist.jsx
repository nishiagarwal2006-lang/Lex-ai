import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flag, Copy, AlertOctagon, CalendarClock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../ui/GlassCard.jsx';
import Badge from '../ui/Badge.jsx';
import SkeletonLoader from '../ui/SkeletonLoader.jsx';

function ChecklistItem({ text, index, column }) {
  const [checked, setChecked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setChecked(!checked)}
      className={`glass-card cursor-pointer p-4 transition-all ${checked ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
            checked
              ? 'border-risk-low bg-risk-low/20'
              : 'border-white/20 bg-white/5'
          }`}
          style={checked ? { boxShadow: '0 0 10px #30d158' } : {}}
        >
          {checked && <Check className="h-3 w-3 text-risk-low" />}
        </div>
        <p className={`text-sm text-text-primary ${checked ? 'line-through text-text-muted' : ''}`}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}

function ChecklistColumn({ title, items, icon: Icon, color }) {
  const colorMap = {
    red: { hex: '#ff2d55', badge: 'red' },
    amber: { hex: '#ff9f0a', badge: 'amber' },
    green: { hex: '#30d158', badge: 'green' },
  };
  const cfg = colorMap[color] || colorMap.amber;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: cfg.hex }} />
        <h4 className="font-heading text-sm font-semibold" style={{ color: cfg.hex }}>
          {title}
        </h4>
        <Badge color={cfg.badge}>{items?.length || 0}</Badge>
      </div>
      <div className="space-y-3">
        {items?.map((item, i) => (
          <ChecklistItem key={i} text={item} index={i} column={title} />
        ))}
        {(!items || items.length === 0) && (
          <p className="text-xs text-text-muted py-4 text-center">No items</p>
        )}
      </div>
    </div>
  );
}

export default function ActionChecklist({ data, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map(i => (
          <SkeletonLoader key={i} lines={5} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const copyQuestions = () => {
    const text = (data.lawyerQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Questions copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Three columns */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard tilt>
          <ChecklistColumn
            title="Immediate"
            items={data.immediate}
            icon={AlertOctagon}
            color="red"
          />
        </GlassCard>
        <GlassCard tilt>
          <ChecklistColumn
            title="Short-term"
            items={data.shortTerm}
            icon={CalendarClock}
            color="amber"
          />
        </GlassCard>
        <GlassCard tilt>
          <ChecklistColumn
            title="Long-term"
            items={data.longTerm}
            icon={TrendingUp}
            color="green"
          />
        </GlassCard>
      </div>

      {/* Questions for lawyer */}
      {data.lawyerQuestions?.length > 0 && (
        <GlassCard tilt>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-heading text-sm font-semibold text-neon-cyan">
              Questions for Your Lawyer
            </h4>
            <button
              onClick={copyQuestions}
              className="flex items-center gap-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-xs text-neon-cyan transition-all hover:bg-neon-cyan/20"
            >
              <Copy className="h-3 w-3" /> Copy All
            </button>
          </div>
          <ul className="space-y-2">
            {data.lawyerQuestions.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="font-mono text-xs text-neon-cyan mt-0.5">Q{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Red flags */}
      {data.redFlags?.length > 0 && (
        <GlassCard tilt className="border-risk-high/20">
          <div className="mb-4 flex items-center gap-2">
            <Flag className="h-4 w-4 text-risk-high" />
            <h4 className="font-heading text-sm font-semibold text-risk-high">Red Flags</h4>
          </div>
          <div className="space-y-3">
            {data.redFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-risk-high/15 bg-risk-high/5 p-3"
              >
                <Flag className="h-4 w-4 shrink-0 text-risk-high mt-0.5" />
                <p className="text-sm text-text-primary">{flag}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
