import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DocumentUpload from '../components/upload/DocumentUpload.jsx';
import TextInput from '../components/upload/TextInput.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import DocumentComparison from '../components/analysis/DocumentComparison.jsx';
import { useDocumentParser } from '../hooks/useDocumentParser.js';
import { useGrokAPI } from '../hooks/useGrokAPI.js';

export default function Compare() {
  const docA = useDocumentParser();
  const docB = useDocumentParser();
  const { compare, loading } = useGrokAPI();

  const [compareData, setCompareData] = useState(null);
  const [compared, setCompared] = useState(false);

  const handleCompare = useCallback(async () => {
    if (!docA.text || docA.text.trim().length < 20) {
      toast.error('Please add Document A.');
      return;
    }
    if (!docB.text || docB.text.trim().length < 20) {
      toast.error('Please add Document B.');
      return;
    }

    try {
      const result = await compare(docA.text, docB.text);
      setCompareData(result);
      // Only transition to result view after data is ready
      setCompared(true);
    } catch (err) {
      toast.error(`Comparison failed: ${err.message}`);
    }
  }, [docA.text, docB.text, compare]);

  const handleReset = () => {
    docA.reset();
    docB.reset();
    setCompareData(null);
    setCompared(false);
  };

  if (compared) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Comparison Results</h1>
          <NeonButton variant="outline" onClick={handleReset}>
            Compare New Documents
          </NeonButton>
        </div>

        <DocumentComparison data={compareData} loading={loading && !compareData} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Compare <span className="gradient-text">Two Documents</span>
        </h1>
        <p className="mt-3 text-text-secondary">
          Upload or paste two legal documents. AI will find the differences and tell you which is more favorable.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Doc A */}
        <GlassCard tilt={false} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-indigo/15 font-mono text-sm text-neon-indigo">A</span>
            <h3 className="font-heading text-sm font-semibold text-text-primary">Document A</h3>
          </div>
          <DocumentUpload
            onFileParsed={docA.parse}
            fileName={docA.fileName}
            onClear={docA.reset}
            parsing={docA.parsing}
          />
          <TextInput
            value={docA.text}
            onChange={docA.setManualText}
            placeholder="Paste Document A text..."
          />
        </GlassCard>

        {/* Doc B */}
        <GlassCard tilt={false} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-magenta/15 font-mono text-sm text-neon-magenta">B</span>
            <h3 className="font-heading text-sm font-semibold text-text-primary">Document B</h3>
          </div>
          <DocumentUpload
            onFileParsed={docB.parse}
            fileName={docB.fileName}
            onClear={docB.reset}
            parsing={docB.parsing}
          />
          <TextInput
            value={docB.text}
            onChange={docB.setManualText}
            placeholder="Paste Document B text..."
          />
        </GlassCard>
      </div>

      <div className="mt-8 flex justify-center">
        <NeonButton
          variant="primary"
          onClick={handleCompare}
          disabled={!docA.text || !docB.text || loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" /> Comparing...
            </>
          ) : (
            'Compare Documents'
          )}
        </NeonButton>
      </div>
    </div>
  );
}
