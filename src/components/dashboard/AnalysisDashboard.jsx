import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, FileText, AlignLeft, Layers, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import RiskAnalysis from '../analysis/RiskAnalysis.jsx';
import ClauseSummary from '../analysis/ClauseSummary.jsx';
import ActionChecklist from '../analysis/ActionChecklist.jsx';
import QASection from '../analysis/QASection.jsx';
import Badge from '../ui/Badge.jsx';
import RiskBadge from '../ui/RiskBadge.jsx';
import { scoreToHex, scoreToLabel } from '../../utils/riskScorer.js';
import { getFileMetadata } from '../../utils/documentParser.js';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'risks', label: 'Risks' },
  { id: 'clauses', label: 'Clauses' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'qa', label: 'Q&A' },
];

export default function AnalysisDashboard({ documentText, riskData, clauseData, checklistData, loading, onAsk, activeTab: externalTab, onTabChange }) {
  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = externalTab || internalTab;
  const setActiveTab = onTabChange || setInternalTab;

  const { wordCount, readingTime } = getFileMetadata(documentText);
  const riskScore = riskData?.overallRiskScore || 0;
  const riskHex = scoreToHex(riskScore);
  const riskLabel = riskData?.riskLevel || scoreToLabel(riskScore);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Metadata bar */}
      <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neon-indigo" />
            <span className="text-sm text-text-primary">Legal Document</span>
          </div>
          <span className="text-text-muted">|</span>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <AlignLeft className="h-3.5 w-3.5" /> {wordCount.toLocaleString()} words
          </div>
          <span className="text-text-muted">|</span>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Layers className="h-3.5 w-3.5" /> ~{readingTime} min read
          </div>
          <span className="text-text-muted">|</span>
          <RiskBadge severity={riskLabel} />
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg border border-neon-indigo/30 bg-neon-indigo/10 px-3 py-2 text-xs text-neon-indigo transition-all hover:bg-neon-indigo/20"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-neon-indigo tab-active'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-card tilt-card p-6 text-center">
                  <div
                    className="font-heading text-4xl font-bold"
                    style={{ color: riskHex }}
                  >
                    {riskScore}
                  </div>
                  <div className="mt-2 font-mono text-xs text-text-muted">RISK SCORE</div>
                  <div className="mt-3">
                    <RiskBadge severity={riskLabel} />
                  </div>
                </div>

                <div className="glass-card tilt-card p-6 text-center">
                  <div className="font-heading text-4xl font-bold text-neon-cyan">
                    {clauseData?.clauses?.length || 0}
                  </div>
                  <div className="mt-2 font-mono text-xs text-text-muted">CLAUSES FOUND</div>
                  {clauseData?.documentType && (
                    <div className="mt-3">
                      <Badge color="cyan">{clauseData.documentType}</Badge>
                    </div>
                  )}
                </div>

                <div className="glass-card tilt-card p-6 text-center">
                  <div className="font-heading text-4xl font-bold text-risk-low">
                    {checklistData?.immediate?.length || 0}
                  </div>
                  <div className="mt-2 font-mono text-xs text-text-muted">IMMEDIATE ACTIONS</div>
                  <div className="mt-3">
                    <Badge color="green">{checklistData?.redFlags?.length || 0} RED FLAGS</Badge>
                  </div>
                </div>
              </div>

              {clauseData?.summary && (
                <div className="glass-card tilt-card p-6">
                  <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">Document Summary</h3>
                  <p className="text-sm text-text-secondary">{clauseData.summary}</p>
                </div>
              )}

              {riskData?.risks?.length > 0 && (
                <div className="glass-card tilt-card p-6">
                  <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
                    Top Risk Highlights
                  </h3>
                  <div className="space-y-3">
                    {riskData.risks.slice(0, 3).map((risk, i) => (
                      <div key={i} className="flex items-start gap-3 border-l-2 pl-3" style={{ borderColor: scoreToHex(risk.severity === 'HIGH' ? 80 : risk.severity === 'MEDIUM' ? 50 : 20) }}>
                        <AlertTriangle className="h-4 w-4 shrink-0 text-risk-medium mt-0.5" />
                        <div>
                          <span className="font-mono text-xs text-text-muted">{risk.category}</span>
                          <p className="text-sm text-text-secondary">{risk.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'risks' && <RiskAnalysis data={riskData} loading={loading} />}
          {activeTab === 'clauses' && <ClauseSummary data={clauseData} loading={loading} />}
          {activeTab === 'checklist' && <ActionChecklist data={checklistData} loading={loading} />}
          {activeTab === 'qa' && (
            <QASection documentText={documentText} onAsk={onAsk} loading={loading} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
