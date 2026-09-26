import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DocumentUpload from '../components/upload/DocumentUpload.jsx';
import TextInput from '../components/upload/TextInput.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import QASection from '../components/analysis/QASection.jsx';
import { useDocumentParser } from '../hooks/useDocumentParser.js';
import { useGrokAPI } from '../hooks/useGrokAPI.js';
import { MessageSquareText } from 'lucide-react';

export default function QA() {
  const { text, fileName, parsing, parse, setManualText, reset } = useDocumentParser();
  const { ask } = useGrokAPI();
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => {
    if (!text || text.trim().length < 20) {
      toast.error('Please upload a document or paste text first.');
      return;
    }
    setReady(true);
  }, [text]);

  const handleReset = () => {
    reset();
    setReady(false);
  };

  if (ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Document Q&A</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {fileName} — ask any question about this document
            </p>
          </div>
          <NeonButton variant="outline" onClick={handleReset}>
            New Document
          </NeonButton>
        </div>

        <QASection documentText={text} onAsk={ask} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-indigo/10">
          <MessageSquareText className="h-7 w-7 text-neon-indigo" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Ask <span className="gradient-text">Anything</span>
        </h1>
        <p className="mt-3 text-text-secondary">
          Upload a legal document, then ask questions in plain English. AI will answer with references to specific clauses.
        </p>
      </motion.div>

      <GlassCard tilt={false} className="space-y-6">
        <DocumentUpload
          onFileParsed={parse}
          fileName={fileName}
          onClear={reset}
          parsing={parsing}
        />

        <TextInput value={text} onChange={setManualText} />

        {text && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <span className="font-mono text-xs text-text-muted">
              {(text.trim().split(/\s+/).filter(Boolean).length).toLocaleString()} words loaded
            </span>
          </div>
        )}

        <div className="flex justify-center">
          <NeonButton
            variant="primary"
            onClick={handleReady}
            disabled={!text || text.trim().length < 20 || parsing}
          >
            Start Asking Questions
          </NeonButton>
        </div>
      </GlassCard>
    </div>
  );
}
