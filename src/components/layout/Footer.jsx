import { Scale, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/5 bg-void/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-neon-indigo" />
            <span className="font-heading text-lg font-bold text-text-primary">LexAI</span>
            <span className="font-mono text-xs text-text-muted">[v1.0.0]</span>
          </div>

          <p className="text-center text-sm text-text-secondary">
            Understand Any Legal Document in Seconds
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://x.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary transition-colors hover:text-neon-cyan"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary transition-colors hover:text-neon-cyan"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-text-muted">
            Powered by Grok-3 AI. Not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
