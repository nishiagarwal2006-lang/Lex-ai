import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function DocumentUpload({ onFileParsed, fileName, onClear, parsing }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) onFileParsed(file);
    },
    [onFileParsed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: parsing,
  });

  return (
    <div className="w-full">
      {!fileName ? (
        <motion.div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragActive
              ? 'border-neon-indigo bg-neon-indigo/10 scale-[1.02]'
              : 'border-neon-indigo/30 bg-white/[0.02] hover:border-neon-indigo/60 hover:bg-white/[0.04]'
          }`}
          animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
          whileHover={{ y: -2 }}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={isDragActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-indigo/10"
          >
            <UploadCloud className="h-8 w-8 text-neon-indigo" />
          </motion.div>
          <p className="font-heading text-lg text-text-primary">
            {isDragActive ? 'Drop your document here' : 'Drag & drop your legal document'}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Supports PDF, DOCX, TXT — up to 10MB
          </p>
          {parsing && (
            <p className="mt-4 font-mono text-xs text-neon-cyan animate-pulse">
              Parsing document...
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-indigo/15">
              <FileText className="h-5 w-5 text-neon-indigo" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{fileName}</p>
              <p className="font-mono text-xs text-risk-low">Ready to analyze</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-white/5 hover:text-risk-high"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
