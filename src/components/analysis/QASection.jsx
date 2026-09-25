import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, AlertTriangle } from 'lucide-react';
import GlassCard from '../ui/GlassCard.jsx';
import Spinner from '../ui/Spinner.jsx';

const suggestedQuestions = [
  'What are my main obligations under this document?',
  'Are there any hidden fees or penalties?',
  'What happens if I terminate early?',
  'What are my rights if the other party breaches?',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <span className="typing-dot h-2 w-2 rounded-full bg-neon-indigo" />
      <span className="typing-dot h-2 w-2 rounded-full bg-neon-indigo" />
      <span className="typing-dot h-2 w-2 rounded-full bg-neon-indigo" />
    </div>
  );
}

function ChatMessage({ message, isUser, isTyping }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isUser ? 'chat-bubble-user rounded-br-sm' : 'glass-card rounded-bl-sm'
        }`}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <>
            <p className="text-sm leading-relaxed text-text-primary">{message.answer || message}</p>
            {!isUser && message.confidence != null && (
              <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-2">
                <span className="font-mono text-[10px] text-text-muted">CONFIDENCE</span>
                <div className="h-1.5 w-20 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-neon-indigo"
                    style={{ width: `${message.confidence}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-neon-indigo">{message.confidence}%</span>
              </div>
            )}
            {!isUser && message.relevantClauses?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.relevantClauses.map((c, i) => (
                  <span
                    key={i}
                    className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-text-muted"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            {!isUser && message.disclaimer && (
              <p className="mt-2 font-mono text-[10px] text-text-muted italic">
                {message.disclaimer}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function QASection({ documentText, onAsk, loading }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (question) => {
    const q = question || input.trim();
    if (!q || !documentText) return;

    setMessages((prev) => [...prev, q]);
    setInput('');

    try {
      const result = await onAsk(documentText, q);
      setMessages((prev) => [...prev, result]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { answer: 'Sorry, I could not process your question. Please try again.', confidence: 0 },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="flex items-center gap-2 rounded-lg border border-risk-medium/20 bg-risk-medium/5 px-4 py-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-risk-medium" />
        <p className="text-xs text-risk-medium">
          Not a substitute for legal advice. For informational purposes only.
        </p>
      </div>

      {/* Chat area */}
      <GlassCard className="flex flex-col" style={{ minHeight: '500px' }}>
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: '450px' }}>
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <MessageSquare className="mb-4 h-10 w-10 text-text-muted" />
              <p className="text-sm text-text-secondary">Ask any question about your document</p>
              <p className="mt-1 text-xs text-text-muted">Powered by Grok-3 AI</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isUser={typeof msg === 'string'}
            />
          ))}

          {loading && <ChatMessage message="" isUser={false} isTyping />}
        </div>

        {/* Suggested questions */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="rounded-full border border-neon-indigo/20 bg-neon-indigo/5 px-3 py-1.5 text-xs text-neon-indigo transition-all hover:bg-neon-indigo/15 hover:border-neon-indigo/40"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-center gap-2 border-t border-white/5 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            disabled={loading || !documentText}
            className="flex-1 rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-neon-indigo/40 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim() || !documentText}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-indigo text-white transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
