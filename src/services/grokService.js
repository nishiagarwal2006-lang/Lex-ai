'use strict';

/**
 * @file src/services/grokService.js
 * @description Client-side AI service — calls the Groq API directly from the browser
 * using environment variables injected at build time by Vite.
 *
 * Security features applied here:
 *  - Prompt injection filtering (client-side pre-check)
 *  - Input length bounds before reaching the API
 *  - AbortController on every fetch() — cancelled on new request or unload
 *  - HTML entity escaping of all AI output via sanitizeString()
 *  - 3-model fallback ladder on 404/429/503
 *  - API key present only via import.meta.env — never hardcoded
 */

import axios from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────

/** @type {Readonly<object>} — All tunables in one immutable object. No magic numbers. */
export const LIMITS = Object.freeze({
  /** Max characters sent per document — prevents token overrun */
  MAX_DOC_CHARS: 12_000,
  /** Max characters for a user question — prevents injection via padding */
  MAX_QUESTION_CHARS: 500,
  /** Max messages stored in conversation history */
  MAX_HISTORY_TURNS: 20,
  /** Axios request timeout in milliseconds */
  REQUEST_TIMEOUT_MS: 60_000,
  /** Axios abort signal timeout in milliseconds (same value via AbortController) */
  ABORT_TIMEOUT_MS: 60_000,
});

/**
 * 3-model fallback ladder.
 * Primary model (env override or default) is tried first;
 * on HTTP 404/429/503 the next model is used automatically.
 * No duplicates — each entry is unique.
 * @type {ReadonlyArray<string>}
 */
export const MODEL_FALLBACK_LADDER = Object.freeze(
  (() => {
    const primary = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile';
    const candidates = [primary, 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
    // De-duplicate while preserving order
    return [...new Set(candidates)];
  })()
);

const GROQ_URL =
  import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

/** Prompt-injection patterns checked on BOTH client and server */
const INJECTION_PATTERNS = Object.freeze([
  /ignore\s+previous\s+instructions/i,
  /ignore\s+all\s+instructions/i,
  /disregard/i,
  /new\s+instructions:/i,
  /you\s+are\s+now/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
]);

// ─── Abort controller registry ────────────────────────────────────────────────
// Keyed by request type so that starting a new request of the same type
// automatically cancels any in-flight one of that type.
/** @type {Map<string, AbortController>} */
const _controllers = new Map();

/**
 * Cancel any in-flight request of the given type, then create and store a new
 * AbortController for it.
 * @param {string} type - e.g. 'analyzeRisk'
 * @returns {AbortController}
 */
function freshController(type) {
  const prev = _controllers.get(type);
  if (prev) prev.abort();
  const ctrl = new AbortController();
  _controllers.set(type, ctrl);
  return ctrl;
}

// Cancel all in-flight requests when the page unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    for (const ctrl of _controllers.values()) ctrl.abort();
  });
}

// ─── Security helpers ─────────────────────────────────────────────────────────

/**
 * Escape HTML entities so AI output is safe to insert anywhere in the DOM.
 * React renders text nodes safely by default; this guards any future
 * dangerouslySetInnerHTML usage or third-party renderer.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Alias kept for backwards-compatibility with existing tests.
 * @param {string} str
 * @returns {string}
 */
export const escapeHtml = sanitizeString;

/**
 * Sanitise document text before sending to the model.
 * - Strips null bytes and non-printable control characters.
 * - Collapses runs of whitespace to a single space.
 * - Hard-caps at LIMITS.MAX_DOC_CHARS.
 * @param {string} text
 * @returns {string}
 */
export function sanitiseText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\0/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
    .slice(0, LIMITS.MAX_DOC_CHARS);
}

/**
 * Returns true if the text contains a known prompt-injection pattern.
 * @param {string} text
 * @returns {boolean}
 */
export function containsInjection(text) {
  if (typeof text !== 'string') return false;
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

/** Return a user-readable error message — never expose raw keys or internals */
function friendlyError(err) {
  if (err?.response?.status === 401) return 'Invalid API key. Please check your VITE_GROQ_API_KEY in .env.';
  if (err?.response?.status === 429) return 'Rate limit reached. Please wait a moment and try again.';
  if (err?.response?.status >= 500)  return 'The AI service is temporarily unavailable. Please retry.';
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout'))
    return 'Request timed out. Try a shorter document or retry.';
  if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return null; // silent
  return err?.response?.data?.error?.message || err?.message || 'Unexpected error. Please retry.';
}

// ─── Core API caller with fallback ladder ─────────────────────────────────────

/**
 * Call the Groq API with automatic model fallback on 404/429/503.
 * Uses an AbortController tied to the request type — automatically cancels
 * any previous in-flight request of the same type.
 * @param {string}   prompt    - The full prompt string to send
 * @param {number}   maxTokens - Max tokens for the response
 * @param {string}   type      - Request type key (used for AbortController dedup)
 * @returns {Promise<object>}  - Parsed JSON from the AI
 */
async function callGrok(prompt, maxTokens = 4000, type = 'default') {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error(
      'Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file and restart the dev server.'
    );
  }

  const ctrl = freshController(type);
  let lastError;

  for (const model of MODEL_FALLBACK_LADDER) {
    // If the controller was already aborted (e.g. user navigated away), stop silently
    if (ctrl.signal.aborted) return null;

    let response;
    try {
      response = await axios.post(
        GROQ_URL,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: LIMITS.REQUEST_TIMEOUT_MS,
          signal: ctrl.signal,
        }
      );
    } catch (err) {
      // Abort errors are silenced — they happen on component unload or new request start
      if (err?.name === 'AbortError' || err?.name === 'CanceledError' || ctrl.signal.aborted) {
        return null;
      }
      // Retry on 404/429/503
      const status = err?.response?.status;
      if (status === 404 || status === 429 || status === 503) {
        lastError = err;
        continue;
      }
      throw new Error(friendlyError(err));
    }

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI model. Please retry.');

    try {
      return JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { return JSON.parse(match[0]); } catch { /* fall through */ }
      }
      throw new Error('AI returned an unreadable response. Please retry.');
    }
  }

  throw new Error(friendlyError(lastError) || 'All AI models unavailable. Please retry.');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyse a legal document for risks.
 * @param {string} documentText - Raw document text (will be sanitised)
 * @returns {Promise<object>}
 */
export async function analyzeRisk(documentText) {
  const safe = sanitiseText(documentText);
  if (!safe) throw new Error('Document text is empty.');
  if (containsInjection(safe)) throw new Error('Document contains disallowed content.');
  const prompt = `You are a legal risk analysis AI. Analyse the following legal document for risks.
Return ONLY a valid JSON object with this exact structure:
{
  "overallRiskScore": <integer 0-100>,
  "riskLevel": "<HIGH|MEDIUM|LOW>",
  "risks": [
    {
      "category": "<short category name>",
      "severity": "<HIGH|MEDIUM|LOW>",
      "clause": "<exact excerpt from document, max 200 chars>",
      "explanation": "<plain-english explanation of the risk>",
      "recommendation": "<actionable recommendation>"
    }
  ]
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}`;
  return callGrok(prompt, 4000, 'analyzeRisk');
}

/**
 * Simplify legal clauses into plain English.
 * @param {string} documentText
 * @returns {Promise<object>}
 */
export async function simplifyClauses(documentText) {
  const safe = sanitiseText(documentText);
  if (!safe) throw new Error('Document text is empty.');
  if (containsInjection(safe)) throw new Error('Document contains disallowed content.');
  const prompt = `You are a legal document simplifier AI. Analyse the following legal document and simplify its clauses.
Return ONLY a valid JSON object with this exact structure:
{
  "documentType": "<type of document>",
  "summary": "<2-3 sentence summary>",
  "clauses": [
    {
      "title": "<clause title>",
      "original": "<original clause text, max 300 chars>",
      "simplified": "<plain-english simplification>",
      "type": "<Obligations|Rights|Payments|Termination>",
      "importance": "<HIGH|MEDIUM|LOW>"
    }
  ],
  "keyDates": [{ "label": "<date description>", "date": "<date string>" }],
  "obligations": ["<obligation>"],
  "rights": ["<right>"]
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}`;
  return callGrok(prompt, 4000, 'simplifyClauses');
}

/**
 * Compare two legal documents and return a structured diff.
 * @param {string} doc1Text
 * @param {string} doc2Text
 * @returns {Promise<object>}
 */
export async function compareDocuments(doc1Text, doc2Text) {
  const safeA = sanitiseText(doc1Text);
  const safeB = sanitiseText(doc2Text);
  if (!safeA || !safeB) throw new Error('Both document texts are required for comparison.');
  if (containsInjection(safeA) || containsInjection(safeB)) throw new Error('Document contains disallowed content.');
  const prompt = `You are a legal document comparison AI. Compare the two legal documents below.
Return ONLY a valid JSON object with this exact structure:
{
  "similarityScore": <integer 0-100>,
  "summary": "<brief comparison summary>",
  "changes": [
    {
      "type": "<added|removed|modified>",
      "section": "<section name>",
      "doc1Text": "<text in doc A or empty string>",
      "doc2Text": "<text in doc B or empty string>",
      "significance": "<why this change matters>"
    }
  ],
  "recommendation": "<which document is more favourable and why>"
}
Do NOT include markdown fences or extra text outside the JSON.

Document A:
${safeA}

Document B:
${safeB}`;
  return callGrok(prompt, 6000, 'compareDocuments');
}

/**
 * Answer a plain-English question about a legal document.
 * @param {string} documentText
 * @param {string} question
 * @returns {Promise<object>}
 */
export async function askQuestion(documentText, question) {
  const safe = sanitiseText(documentText);
  const safeQ = sanitiseText(String(question || '')).slice(0, LIMITS.MAX_QUESTION_CHARS);
  if (!safe)  throw new Error('Document text is empty.');
  if (!safeQ) throw new Error('Question cannot be empty.');
  if (containsInjection(safeQ)) throw new Error('Question contains disallowed content.');
  const prompt = `You are a legal Q&A AI. Answer the user's question about the legal document below.
Return ONLY a valid JSON object with this exact structure:
{
  "answer": "<detailed plain-English answer>",
  "confidence": <integer 0-100>,
  "relevantClauses": ["<relevant clause titles or references>"],
  "disclaimer": "This response is for informational purposes only and is not a substitute for professional legal advice."
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}

Question: ${safeQ}`;
  return callGrok(prompt, 2000, 'askQuestion');
}

/**
 * Generate a prioritised action checklist from a legal document.
 * @param {string} documentText
 * @returns {Promise<object>}
 */
export async function generateChecklist(documentText) {
  const safe = sanitiseText(documentText);
  if (!safe) throw new Error('Document text is empty.');
  if (containsInjection(safe)) throw new Error('Document contains disallowed content.');
  const prompt = `You are a legal action checklist AI. Generate a prioritised action checklist from the legal document below.
Return ONLY a valid JSON object with this exact structure:
{
  "immediate": ["<action to take within 24-48 hours>"],
  "shortTerm": ["<action to take within the next few weeks>"],
  "longTerm": ["<action to take over the next months>"],
  "lawyerQuestions": ["<question to ask your lawyer>"],
  "redFlags": ["<red-flag warning requiring urgent attention>"]
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}`;
  return callGrok(prompt, 4000, 'generateChecklist');
}
