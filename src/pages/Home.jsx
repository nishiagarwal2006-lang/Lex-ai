import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileSearch,
  GitCompareArrows,
  MessageSquareText,
  ListChecks,
  Sparkles,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import NeonButton from '../components/ui/NeonButton.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import Badge from '../components/ui/Badge.jsx';

const features = [
  {
    icon: ShieldCheck,
    name: 'Risk Analysis',
    desc: 'AI scans every clause for hidden liabilities, penalties, and unfavorable terms.',
    tag: 'RISK DETECTION',
    color: '#ff2d55',
  },
  {
    icon: FileSearch,
    name: 'Clause Simplifier',
    desc: 'Legalese translated into plain English — understand what you are actually agreeing to.',
    tag: 'PLAIN ENGLISH',
    color: '#00f5ff',
  },
  {
    icon: GitCompareArrows,
    name: 'Document Comparison',
    desc: 'Compare two contracts side-by-side with AI-highlighted differences and recommendations.',
    tag: 'DIFF ENGINE',
    color: '#8b5cf6',
  },
  {
    icon: MessageSquareText,
    name: 'Smart Q&A',
    desc: 'Ask any question about your document and get instant, cited answers from Grok-3.',
    tag: 'AI ASSISTANT',
    color: '#6366f1',
  },
  {
    icon: ListChecks,
    name: 'Action Checklist',
    desc: 'Get a prioritized list of actions, questions for your lawyer, and red flags.',
    tag: 'ACTIONABLE',
    color: '#30d158',
  },
  {
    icon: Sparkles,
    name: 'Key Date Extraction',
    desc: 'Automatically identifies deadlines, renewal dates, and termination windows.',
    tag: 'DATES & DEADLINES',
    color: '#ff9f0a',
  },
];

const stats = [
  { value: '50K+', label: 'Documents Analyzed' },
  { value: '99.2%', label: 'Clause Accuracy' },
  { value: '<5s', label: 'Average Analysis Time' },
  { value: '12', label: 'Languages Supported' },
];

export default function Home() {
  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center px-4">
        {/* Floating HUD labels */}
        <span className="hud-label" style={{ top: '15%', left: '10%' }}>[AI-POWERED]</span>
        <span className="hud-label" style={{ top: '20%', right: '12%', animationDelay: '1s' }}>[GROK-3]</span>
        <span className="hud-label" style={{ bottom: '25%', left: '15%', animationDelay: '2s' }}>[REAL-TIME]</span>
        <span className="hud-label" style={{ bottom: '30%', right: '10%', animationDelay: '0.5s' }}>[SECURE]</span>

        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge color="indigo" className="mb-6">
              Legal Intelligence Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-5xl font-bold leading-tight text-text-primary md:text-7xl"
          >
            Legal Intelligence,
            <br />
            <span className="gradient-text">Reimagined</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary"
          >
            Upload any legal document and let AI decode the risks, simplify the jargon,
            and tell you exactly what you need to do — in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/analyze">
              <NeonButton variant="primary" className="flex items-center gap-2">
                Start Analyzing <ArrowRight className="h-4 w-4" />
              </NeonButton>
            </Link>
            <Link to="/compare">
              <NeonButton variant="outline">Compare Documents</NeonButton>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="scroll-indicator mt-20 flex flex-col items-center gap-1"
          >
            <ChevronDown className="h-5 w-5 text-text-muted" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard tilt className="text-center">
                <div className="font-heading text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="mt-1 font-mono text-xs text-text-muted">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Everything You Need to <span className="gradient-text">Understand</span> Legal Docs
          </h2>
          <p className="mt-4 text-text-secondary">
            Six powerful AI-driven tools in one platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard tilt className="h-full">
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${feature.color}15`,
                      border: `1px solid ${feature.color}30`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">{feature.desc}</p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span
                      className="font-mono text-[10px] tracking-wider"
                      style={{ color: feature.color }}
                    >
                      {feature.tag}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlassCard tilt className="p-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
              Ready to decode your next contract?
            </h2>
            <p className="mt-4 text-text-secondary">
              No signup required. Upload a document and get instant analysis.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/analyze">
                <NeonButton variant="primary" className="flex items-center gap-2">
                  Analyze a Document <ArrowRight className="h-4 w-4" />
                </NeonButton>
              </Link>
              <Link to="/qa">
                <NeonButton variant="outline">Ask a Question</NeonButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}
