// ApiKeySetup — shown when VITE_GROQ_API_KEY is missing.
import { KeyRound, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const steps = [
  {
    step: '1',
    title: 'Get your free Groq API key',
    desc: "Visit the Groq console and generate an API key — it's free.",
    link: 'https://console.groq.com/keys',
    linkLabel: 'Open Groq Console →',
  },
  {
    step: '2',
    title: 'Create a .env file',
    desc: 'In the project root (same folder as package.json), create a file named .env',
    code: null,
  },
  {
    step: '3',
    title: 'Add your key',
    desc: 'Paste this line into your .env file (replace the placeholder):',
    code: 'VITE_GROQ_API_KEY=gsk_your_key_here',
  },
  {
    step: '4',
    title: 'Restart the dev server',
    desc: 'Stop and restart npm run dev — Vite will pick up the new variable.',
    code: 'npm run dev',
  },
];

export default function ApiKeySetup() {
  const [copied, setCopied] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-16"
      role="main"
      aria-labelledby="setup-heading"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-indigo/10 ring-1 ring-neon-indigo/30">
            <KeyRound className="h-8 w-8 text-neon-indigo" aria-hidden="true" />
          </div>
          <h1
            id="setup-heading"
            className="font-heading text-3xl font-bold text-text-primary"
          >
            Configure Your API Key
          </h1>
          <p className="mt-3 text-text-secondary">
            LexAI needs a Groq API key to analyse legal documents.
            Follow the steps below to set one up — it only takes a minute.
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-4" aria-label="Setup steps">
          {steps.map(({ step, title, desc, code, link, linkLabel }) => (
            <li
              key={step}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neon-indigo/20 font-heading text-sm font-bold text-neon-indigo"
                  aria-label={`Step ${step}`}
                >
                  {step}
                </span>
                <div className="flex-1">
                  <h2 className="font-heading text-base font-semibold text-text-primary">{title}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{desc}</p>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-neon-indigo hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo"
                    >
                      {linkLabel} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                  {code && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-void/80 px-4 py-2.5">
                      <code className="font-mono text-sm text-neon-cyan">{code}</code>
                      <button
                        onClick={() => copy(code, step)}
                        aria-label={`Copy code: ${code}`}
                        className="ml-4 shrink-0 text-text-muted transition-colors hover:text-neon-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo"
                      >
                        {copied === step
                          ? <CheckCircle className="h-4 w-4 text-risk-low" aria-hidden="true" />
                          : <Copy className="h-4 w-4"                       aria-hidden="true" />
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-xs text-text-muted">
          Your API key is stored locally in <code className="font-mono">.env</code> and never transmitted
          to any server other than the Groq API endpoint.
        </p>
      </div>
    </div>
  );
}
