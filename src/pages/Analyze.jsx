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
  const { analyze, simplify, checklist, ask, loading } = useGrokAPI();

  const [riskData, setRiskData] = useState(null);
  const [clauseData, setClauseData] = useState(null);
  const [checklistData, setChecklistData] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!text || text.trim().length < 20) {
      toast.error('Please upload a document or paste at least a few sentences of text.');
      return;
    }

    setAnalyzed(true);

    // Run all three analyses
    try {
      const risk = await analyze(text);
      setRiskData(risk);
    } catch (err) {
      toast.error(`Risk analysis failed: ${err.message}`);
    }

    try {
      const clauses = await simplify(text);
      setClauseData(clauses);
    } catch (err) {
      toast.error(`Clause simplification failed: ${err.message}`);
    }

    try {
      const checklist = await checklist(text);
      setChecklistData(checklist);
    } catch (err) {
      toast.error(`Checklist generation failed: ${err.message}`);
    }
  }, [text, analyze, simplify, checklist]);

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
          loading={loading && !riskData}
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
              disabled={!text || text.trim().length < 20 || parsing || loading}
              className="flex items-center gap-2"
            >
              {loading ? (
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
