import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DocumentUpload from '../components/upload/DocumentUpload.jsx';
import TextInput from '../components/upload/TextInput.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import AnalysisDashboard from '../components/dashboard/AnalysisDashboard.jsx';
import { useDocumentParser } from '../hooks/useDocumentParser.js';
import { useGrokAPI } from '../hooks/useGrokAPI.js';

export default function Analyze() {
  const { text, fileName, parsing, parseError, parse, setManualText, reset } = useDocumentParser();
  // Each feature gets its own hook instance so their loading states are independent
  const { analyze, loading: riskLoading } = useGrokAPI();
  const { simplify, loading: clauseLoading } = useGrokAPI();
  const { checklist: generateChecklist, loading: checklistLoading } = useGrokAPI();
  const { ask, loading: qaLoading } = useGrokAPI();

  const [riskData, setRiskData] = useState(null);
  const [clauseData, setClauseData] = useState(null);
  const [checklistData, setChecklistData] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  const anyLoading = riskLoading || clauseLoading || checklistLoading;

  const handleAnalyze = useCallback(async () => {
    if (!text || text.trim().length < 20) {
      toast.error('Please upload a document or paste at least a few sentences of text.');
      return;
    }

    setAnalyzed(true);

    // Fire all three analyses in parallel — each has its own loading state
    const [riskResult, clauseResult, checklistResult] = await Promise.allSettled([
      analyze(text),
      simplify(text),
      generateChecklist(text),
    ]);

    if (riskResult.status === 'fulfilled') {
      setRiskData(riskResult.value);
    } else {
      toast.error(`Risk analysis failed: ${riskResult.reason?.message}`);
    }

    if (clauseResult.status === 'fulfilled') {
      setClauseData(clauseResult.value);
    } else {
      toast.error(`Clause simplification failed: ${clauseResult.reason?.message}`);
    }

    if (checklistResult.status === 'fulfilled') {
      setChecklistData(checklistResult.value);
    } else {
      toast.error(`Checklist generation failed: ${checklistResult.reason?.message}`);
    }
  }, [text, analyze, simplify, generateChecklist]);

  const handleReset = () => {
    reset();
    setRiskData(null);
    setClauseData(null);
    setChecklistData(null);
    setAnalyzed(false);
  };

  if (analyzed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Analysis Results</h1>
          <NeonButton variant="outline" onClick={handleReset}>
            Analyze New Document
          </NeonButton>
        </div>

        <AnalysisDashboard
          documentText={text}
          riskData={riskData}
          clauseData={clauseData}
          checklistData={checklistData}
          riskLoading={riskLoading}
          clauseLoading={clauseLoading}
          checklistLoading={checklistLoading}
          qaLoading={qaLoading}
          onAsk={ask}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Analyze a <span className="gradient-text">Legal Document</span>
        </h1>
        <p className="mt-3 text-text-secondary">
          Upload a PDF, DOCX, or TXT file — or paste text directly. AI will analyze risks, simplify clauses, and generate an action checklist.
        </p>
      </motion.div>

      <div className="space-y-6">
        <GlassCard tilt={false} className="space-y-6">
          <DocumentUpload
            onFileParsed={parse}
            fileName={fileName}
            onClear={handleReset}
            parsing={parsing}
          />

          {parseError && (
            <p className="text-sm text-risk-high">{parseError}</p>
          )}

          <TextInput value={text} onChange={setManualText} />

          {text && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <span className="font-mono text-xs text-text-muted">
                {(text.trim().split(/\s+/).filter(Boolean).length).toLocaleString()} words ready for analysis
              </span>
            </div>
          )}

          <div className="flex justify-center">
            <NeonButton
              variant="primary"
              onClick={handleAnalyze}
              disabled={!text || text.trim().length < 20 || parsing || anyLoading}
              className="flex items-center gap-2"
            >
              {anyLoading ? (
                <>
                  <Spinner size="sm" /> Analyzing...
                </>
              ) : (
                'Analyze Document'
              )}
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
