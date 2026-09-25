import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Type } from 'lucide-react';

export default function TextInput({ value, onChange, placeholder = 'Or paste your legal text here...' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-text-secondary transition-all hover:bg-white/[0.04]"
      >
        <span className="flex items-center gap-2">
          <Type className="h-4 w-4 text-neon-indigo" />
          Or paste text directly
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="mt-3 h-48 w-full resize-y rounded-xl border border-white/10 bg-void/60 p-4 font-mono text-sm text-text-primary placeholder-text-muted focus:border-neon-indigo/40 focus:outline-none focus:ring-1 focus:ring-neon-indigo/20"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
